import { NextApiRequest, NextApiResponse } from "next";
import { createApiClient } from "@/libs/supabase/supabaseApi";
import { SupabaseClient } from '@supabase/supabase-js';
import {
    base64toBinary,
} from "@/libs/services/utils";
import crypto from "crypto";

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


const imageToStorage = async (
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
        if (!imageBase64.startsWith('data:image/')) {
          throw new Error('Invalid base64 format. Must start with data:image/');
        }
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