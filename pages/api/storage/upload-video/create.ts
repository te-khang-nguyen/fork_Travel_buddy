import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";
import { SupabaseClient } from '@supabase/supabase-js';
import {
    base64toBinary,
} from "@/libs/services/utils";
import crypto from "crypto";

interface VideoUploadInput {
  userId: string;
  bucket: string;
  title: string;
  data: Uint8Array;
}

interface SignedUrlResponse {
  data?: string;
  error?: any;
}

export const videoToStorage = async (
  inputobj: VideoUploadInput,
  supabase: SupabaseClient
): Promise<SignedUrlResponse> => {
  const hash = crypto.randomBytes(16).toString("hex");
  const fileName = `${inputobj.title.replace(/\s+/g, "")}/${hash}.mp4`;
  const storageRef = `${inputobj.userId}/${fileName}`;
  const uploadTask = await supabase.storage
    .from(inputobj.bucket)
    .upload(storageRef, inputobj.data, {
      cacheControl: "3600",
      upsert: true,
      contentType: "video/mp4",
    });

  if (uploadTask.error) {
    return { error: uploadTask.error };
  }
  const { data, error } = await supabase.storage
    .from(inputobj.bucket)
    .createSignedUrl(uploadTask.data.path, 60 * 60 * 24 * 365);

  return { data: data?.signedUrl };
};

export const config = {
  api: {
      bodyParser: {
          sizeLimit: '50mb', // Increase the body size limit for videos
      },
  },
};

export default async function handler(
  req:NextApiRequest, res:NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false,
            message: 'Only POST requests allowed' 
        });
    }

    const token = req.headers.authorization?.split(' ')[1];
    const supabase = createApiClient(token!);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    try {
      const { videoBase64, bucket, title } = req.body;
      
      if (!videoBase64) {
        return res.status(400).json({
          success: false,
          error: "Bad Request",
          message: "Missing video",
        })
      }
      
      let bytesArray;
      if (typeof videoBase64 === "string") {
        // Ensure it's a base64 data URL
        bytesArray = base64toBinary(videoBase64);
      } else if (videoBase64 instanceof Uint8Array) {
        bytesArray = videoBase64;
      } else if (typeof videoBase64 === "object") {
        // If it's an object, try to convert it to a base64 string
        try {
          const base64String = Buffer.from(JSON.stringify(videoBase64)).toString('base64');
          bytesArray = base64toBinary(base64String);
        } catch (conversionError) {
          console.error('Failed to convert video object to base64:', conversionError);
          return res.status(400).json({
            success: false,
            error: "Conversion Error",
            message: `Unable to convert video data. Received type: ${typeof videoBase64}`,
            details: JSON.stringify(videoBase64)
          });
        }
      } else {
        throw new Error(`Unsupported video type: ${typeof videoBase64}`);
      }

      // Validate other inputs
      if (!bucket || typeof bucket !== 'string') {
        throw new Error('Invalid or missing bucket');
      }
      if (!title || typeof title !== 'string') {
        throw new Error('Invalid or missing title');
      }

      const toStorageUpload = {
        userId: user!.id,
        bucket: bucket,
        title: title,
        data: bytesArray,
      };

      const {data : signedUrl} = await videoToStorage(toStorageUpload, supabase);

      return res.status(200).json({
          success: true,
          signedUrl: signedUrl,
          message: 'Video uploaded successfully!'
      });
    } catch (error) {
      console.error('Unexpected error in video upload handler:', error);
      return res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : JSON.stringify(error),
          message: 'Unexpected server error during video upload',
          details: JSON.stringify(error)
      });
    }
}

// Workaround to enable Swagger on production 
export const swaggerStorageVideoUpload = {
    index:41, 
    text:
`"/api/storage/upload-video": {
      "post": {
        "tags": ["storage"],
        "summary": "Upload a video",
        "description": "Upload a video to the specified storage bucket.",
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
                "properties": {
                  "videoBase64": {
                    "type": "string",
                    "description": "Base64 encoded video data"
                  },
                  "bucket": {
                    "type": "string",
                    "description": "The storage bucket to upload the video to"
                  },
                  "title": {
                    "type": "string",
                    "description": "The title of the video"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Video uploaded successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean" },
                    "signedUrl": { "type": "string" },
                    "message": { "type": "string" }
                  }
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
                    "success": { "type": "boolean" },
                    "error": { "type": "string" },
                    "message": { "type": "string" }
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
                    "success": { "type": "boolean" },
                    "message": { "type": "string" }
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
                    "success": { "type": "boolean" },
                    "error": { "type": "string" },
                    "message": { "type": "string" },
                    "details": { "type": "string" }
                  }
                }
              }
            }
          }
        }
      }
    }`
}