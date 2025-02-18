import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";
import { SupabaseClient } from '@supabase/supabase-js';
import {
    base64toBinary,
} from "@/libs/services/utils";
import crypto from "crypto";

/**
 * @swagger
 * /api/storage:
 *   post:
 *     tags:
 *       - storage
 *     summary: Upload an image to storage
 *     description: Upload an image to the specified storage bucket.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageBase64:
 *                 type: string
 *                 description: The base64 encoded image data
 *               bucket:
 *                 type: string
 *                 description: The storage bucket name
 *               title:
 *                 type: string
 *                 description: The title for the image
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 signedUrl:
 *                   type: string
 *                   description: The signed URL of the uploaded image
 *                 message:
 *                   type: string
 *                   example: "File uploaded successfully!"
 *       400:
 *         description: Bad request
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Internal server error
 */

interface ImageUploadInput {
  userId: string;
  bucket: string;
  title: string;
  data: Uint8Array;
}

interface SignedUrlResponse {
  data?: string;
  error?: any;
}

export const imageToStorage = async (
  inputobj: ImageUploadInput,
  supabase: SupabaseClient
): Promise<SignedUrlResponse> => {
  const hash = crypto.randomBytes(16).toString("hex");
  const fileName = `${inputobj.title.replace(/\s+/g, "")}/${hash}.jpg`;
  const storageRef = `${inputobj.userId}/${fileName}`;
  const uploadTask = await supabase.storage
    .from(inputobj.bucket)
    .upload(storageRef, inputobj.data, {
      cacheControl: "3600",
      upsert: true,
      contentType: "image/jpg",
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
          sizeLimit: '4.5mb', // Increase the body size limit (e.g., 5MB)
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
    const supabase = createApiClient(token);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    try {

      const { imageBase64, bucket, title } = req.body;
      
      if (!imageBase64) {
        return res.status(400).json({
          success: false,
          error: "Bad Request",
          message: "Missing image",
        })
      }
      
      let bytesArray;
      if (typeof imageBase64 === "string") {
        // Ensure it's a base64 data URL
        bytesArray = base64toBinary(imageBase64);
      } else if (imageBase64 instanceof Uint8Array) {
        bytesArray = imageBase64;
      } else {
        throw new Error(`Unsupported image type: ${typeof imageBase64}`);
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

      const {data : signedUrl} = await imageToStorage(toStorageUpload, supabase);

      return res.status(200).json({
          success: true,
          signedUrl: signedUrl,
          message: 'File uploaded successfully!'
      });
    } catch (error) {
      console.error('Unexpected error in upload handler:', error);
      return res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : JSON.stringify(error),
          message: 'Unexpected server error during file upload'
      });
    }
}

export const swaggerStorageImgUpload = 
`"/api/storage/upload_image": {
    "post": {
      "tags": ["storage"],
      "summary": "Upload an image to storage",
      "description": "Upload an image to the specified storage bucket.",
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
                "imageBase64": {
                  "type": "string",
                  "description": "The base64 encoded image data"
                },
                "bucket": {
                  "type": "string",
                  "description": "The storage bucket name"
                },
                "title": {
                  "type": "string",
                  "description": "The title for the image"
                }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "File uploaded successfully",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": true
                  },
                  "signedUrl": {
                    "type": "string",
                    "description": "The signed URL of the uploaded image"
                  },
                  "message": {
                    "type": "string",
                    "example": "File uploaded successfully!"
                  }
                }
              }
            }
          }
        },
        "400": {
          "description": "Bad request"
        },
        "405": {
          "description": "Method not allowed"
        },
        "500": {
          "description": "Internal server error"
        }
      }
    }
  }`