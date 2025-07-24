import { createApiClient } from "@/libs/supabase/supabaseApi";
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const token = req.headers.authorization?.split(' ')[1];
  const supabase = createApiClient(token!);

  const { fileName, totalParts, mimeType } = req.body;

  try {
    // Create upload session in database
    const { data, error } = await supabase
      .from('uploads')
      .insert([{
        file_name: fileName,
        total_parts: totalParts,
        received_parts: [],
        status: 'initialized',
        mime_type: mimeType,
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ uploadId: data.id });
  } catch (error) {
    res.status(500).json({ error: error });
  }
}

export const swaggerStorageResumableUploadInit = {
  index:31, 
  text:
`"/api/v1/storage/upload-image/initialize": {
      "post": {
        "tags": ["storage"],
        "summary": "Initialize a multipart image upload",
        "description": "Creates a new upload session for multipart image upload",
        "security": [
          {
            "bearerAuth": []
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["fileName", "totalParts"],
                "properties": {
                  "fileName": {
                    "type": "string",
                    "description": "Name of the file to be uploaded"
                  },
                  "totalParts": {
                    "type": "integer",
                    "description": "Total number of parts in the multipart upload"
                  },
                  "mimeType": {
                    "type": "string",
                    "description": "MIME type of the file to be uploaded"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Upload session created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "uploadId": {
                      "type": "string",
                      "description": "The ID of the created upload session"
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
                      "type": "object",
                      "description": "Error object from the server"
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