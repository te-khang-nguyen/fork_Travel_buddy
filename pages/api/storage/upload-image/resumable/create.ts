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

    // Debugging logs
    form.on('fileBegin', (name, file) => {
      console.log(`Upload started: ${name} → ${file.filepath}`);
    });

    form.on('file', (name, file) => {
      console.log(`Upload completed: ${name} → ${file.filepath}`);
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

async function finalizeUpload(uploadSession: UploadSession, supabase: any) {
  // List all chunks
  const { data: chunks, error: listError } = await supabase.storage
    .from('story')
    .list(uploadSession.id, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'asc' },
    });

  if (listError) return { error: listError } ;
  console.log("Session:", uploadSession);
  console.log("Retrieved chunks:", chunks);
  if (!chunks || chunks.length === 0) return { error: {
    message: 'No chunks found',
    uploadSession
  }};

  console.log("Retrieved chunks:", chunks);

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

    console.log(`Downloaded chunk: ${chunk.name} Size: ${data.size}`);
    console.log("Combined buffer size:", combinedBuffer, "Length: ", combinedBuffer.length);
  }

  console.log("Combined buffer size:", combinedBuffer, "Length: ", combinedBuffer.length);

  // Upload final file
  const { 
    data: uploadTask, 
    error: uploadError 
  } = await supabase.storage
    .from('story')
    .upload(
      uploadSession.file_name, 
      combinedBuffer, 
      {
        contentType: 'image/png',
        upsert: false
      }
    );

  if (uploadError) return { error: uploadError };

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

    if (uploadError) throw uploadError;

    // Update upload session
    const { error: updateError } = await supabase
      .from('uploads')
      .update({
        received_parts: [...uploadSession.received_parts, parseInt(partNumber)],
        status: 'uploading'
      })
      .eq('id', uploadSession.id);

    if (updateError) return res.status(500).json({ error: updateError });

    // Check if all parts uploaded
    if (uploadSession.received_parts.length === uploadSession.total_parts
        || parseInt(partNumber) === uploadSession.total_parts) {
     const {data, error} = await finalizeUpload(uploadSession, supabase);
      // Cleanup temporary file
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