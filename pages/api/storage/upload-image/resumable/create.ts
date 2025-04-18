// pages/api/upload.ts
import { createApiClient } from "@/libs/supabase/supabaseApi";
import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File as FormidableFile } from 'formidable';
import { promises as fs } from 'fs';
// import { Readable } from 'stream';

// Type definitions
interface UploadSession {
  id: string;
  file_name: string;
  total_parts: number;
  received_parts: number[];
  status: string;
  mime_type: string;
}

interface FormDataFields {
  uploadId: string[];
  partNumber: string[];
}

interface FormDataFiles {
  chunk: FormidableFile[];
}

export const config = {
  api: {
    bodyParser: false
  }
};

async function parseFormData(req: NextApiRequest): Promise<{
  fields: FormDataFields;
  files: FormDataFiles;
}> {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      multiples: false,
      keepExtensions: true,
      // Add these explicit options:
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowEmptyFiles: false,
      uploadDir: `/tmp`, // ← Critical for Vercel/serverless
      filter: (part) => {
        // Only process the 'chunk' field as file
        return part.name === 'chunk';
      }
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({
        fields: fields as unknown as FormDataFields,
        files: files as unknown as FormDataFiles
      });
    });
  });
}

async function readFile(filepath: string): Promise<Buffer> {
  return fs.readFile(filepath);
}

async function finalizeUpload(
  uploadSession: UploadSession, 
  supabase: any, 
  userId: string
) {
  // List all chunks
  const { 
    data: chunks, 
    error: listError 
  } = await supabase
    .storage
    .from('story')
    .list(uploadSession.id, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'asc' },
      search: 'part-'
    });

  if (listError) return { error: listError } ;
  if (!chunks || chunks.length === 0) return { error: {
    message: 'No chunks found',
    uploadSession
  }};

  

  // Sort chunks numerically by part number
  const sortedChunks = chunks
    .filter(chunk=> chunk.name.startsWith('part-'))
    .sort((a, b) => {
      const aNum = parseInt(a.name.split('-')[1]);
      const bNum = parseInt(b.name.split('-')[1]);
      return aNum - bNum;
    });

  if (sortedChunks.length !== uploadSession.total_parts) {
    return { error: 'Not all chunks uploaded' };
  }

  // Download and concatenate all chunks
  let combinedBuffer = Buffer.alloc(0);
  
  for (const chunk of sortedChunks) {
    const { 
      data, 
      error: downloadError
    } = await supabase.storage
      .from('story')
      .download(`${uploadSession.id}/${chunk.name}`);

    if (downloadError) return { error: downloadError };
    
    combinedBuffer = Buffer.concat([
      combinedBuffer, 
      Buffer.from(await data.arrayBuffer())
    ]);
  }

  // Upload final file
  const { 
    data: uploadTask, 
    error: uploadError 
  } = await supabase.storage
    .from('story')
    .upload(
      `${userId}/${uploadSession.file_name}`, 
      combinedBuffer, 
      {
        contentType: uploadSession?.mime_type ?? 'image/jpeg',
        upsert: true
      }
    );
  
  console.log('File path name', `${userId}/${uploadSession.file_name}`);
  console.log('Upload task:', uploadTask);

  if (uploadError) return { error: uploadError ?? 'Error uploading final file' };

  // Clean up chunks
  const { error: deleteError } = await supabase.storage
    .from('story')
    .remove(sortedChunks.map(chunk => `${uploadSession.id}/${chunk.name}`));

  if (deleteError) return { error: deleteError };

  // Update database record
  const { error: updateError } = await supabase
    .from('uploads')
    .update({ 
      status: 'completed',
      received_parts: Array.from({ length: uploadSession.total_parts }, (_, i) => i + 1)
    })
    .eq('id', uploadSession.id);

  if (updateError) return { error: updateError };

  const { 
    data: finalStorageData, 
    error 
  } = await supabase.storage
            .from('story')
            .createSignedUrl(uploadTask.path, 60 * 60 * 24 * 365);
  
  if(error) return { error };
  
  return { data: finalStorageData?.signedUrl };
  
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  const supabase = createApiClient(token);

  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  try {
    const formData = await parseFormData(req);
    const uploadId = formData.fields.uploadId[0];
    const partNumber = formData.fields.partNumber[0];
    const chunk = formData.files.chunk[0];

    // Validate inputs
    if (!uploadId || !partNumber || !chunk) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get upload session
    const { data: uploadSession, error: sessionError } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', uploadId)
      .single();

    if (sessionError) return { error: sessionError };
    if (!uploadSession) return { error: 'Upload session not found' };

    // Upload chunk to Supabase Storage
    const chunkName = `${uploadSession.id}/part-${partNumber}`;
    const chunkBuffer = await readFile(chunk.filepath);
    
    const { error: uploadError } = await supabase.storage
      .from('story')
      .upload(chunkName, chunkBuffer, {
        contentType: chunk.mimetype || 'application/octet-stream',
        upsert: false
      });

    if (uploadError) return res.status(500).json({ error: uploadError });

    // Update upload session
    const { data: updatedSession, error: updateError } = await supabase
      .from('uploads')
      .update({
        received_parts: [...uploadSession.received_parts, parseInt(partNumber)],
        status: 'uploading'
      })
      .eq('id', uploadSession.id)
      .select("*")
      .single();

    if (updateError) return res.status(500).json({ error: updateError });

    // Check if all parts uploaded
    if (updatedSession.received_parts.length === updatedSession.total_parts) {
      const {data, error} = await finalizeUpload(updatedSession, supabase, user?.id ?? "");

      await fs.unlink(chunk.filepath);

      if (error) {
        return res.status(500).json({ error });
      }
      return res.status(200).json({ 
        message: 'Upload completed successfully',
        url: data
      });
    } else {
      return res.status(200).json({ 
        message: 'Chunk uploaded successfully'
      });
    }
    
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

export const swaggerStorageResumableUpload = {
  index:40, 
  text:
`"/api/v1/storage/upload-image/resumable": {
  "post": {
    "tags": ["storage"],
    "summary": "Upload a chunk of a multipart image upload",
    "description": "Handles the upload of individual chunks in a multipart upload session",
    "security": [
      {
        "bearerAuth": []
      }
    ],
    "requestBody": {
      "required": true,
      "content": {
        "multipart/form-data": {
          "schema": {
            "type": "object",
            "required": ["uploadId", "partNumber", "chunk"],
            "properties": {
              "uploadId": {
                "type": "string",
                "description": "ID of the upload session"
              },
              "partNumber": {
                "type": "string",
                "description": "Sequential number of the chunk being uploaded"
              },
              "chunk": {
                "type": "string",
                "format": "binary",
                "description": "The chunk file data"
              }
            }
          }
        }
      }
    },
    "responses": {
      "200": {
        "description": "Chunk uploaded successfully",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "oneOf": [
                {
                  "properties": {
                    "message": {
                      "type": "string",
                      "example": "Chunk uploaded successfully"
                    }
                  }
                },
                {
                  "properties": {
                    "message": {
                      "type": "string",
                      "example": "Upload completed successfully"
                    },
                    "url": {
                      "type": "string",
                      "description": "Signed URL of the completed upload"
                    }
                  }
                }
              ]
            }
          }
        }
      },
      "400": {
        "description": "Bad request",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "error": {
                  "type": "string",
                  "example": "Missing required fields"
                }
              }
            }
          }
        }
      },
      "405": {
        "description": "Method not allowed",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "error": {
                  "type": "string",
                  "example": "Method not allowed"
                }
              }
            }
          }
        }
      },
      "500": {
        "description": "Internal server error",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "error": {
                  "type": "string",
                  "description": "Error message from the server"
                }
              }
            }
          }
        }
      }
    }
  }
}`,
}