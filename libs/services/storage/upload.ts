import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/libs/supabase/baseQuery";

interface ImageReq {
    imageBase64: string | null;
    title: string;
    bucket: string;
}

interface VideoReq {
  videoBase64: string | null;
  title: string;
  bucket: string;
}

interface ImagesReq {
  imagesBase64: string[] | null;
  title: string;
  bucket: string;
}

interface UploadRes {
    signedUrl?: string;
    error?: any;
}  

interface UploadResMultiple {
  signedUrls?: string[];
  error?: any;
}  

const StorageApi = createApi({
  reducerPath: "storage",
  baseQuery,
  endpoints: (builder) => ({
    uploadImage: builder.mutation<UploadRes, ImageReq>({
        query: (params) => ({
          url: `/storage/upload-image`,
          method: "POST",
          body: params,
        }),
    }),
    uploadVideo: builder.mutation<UploadRes, VideoReq>({
      query: (params) => ({
        url: `/storage/upload-video`,
        method: "POST",
        body: params,
      }),
    }),
    uploadImages: builder.mutation<UploadResMultiple, ImagesReq>({
      query: (params) => ({
        url: `/storage/upload-images`,
        method: "POST",
        body: params,
      }),
    }),
    createMediaAsset: builder.mutation< any, any >({
      query: (params) => ({
        url: `/media-assets`,
        method: "POST",
        body: params,
      }),
    })
  }),
});

export const { 
  useUploadImageMutation,
  useUploadVideoMutation,
  useUploadImagesMutation,
  useCreateMediaAssetMutation,
} = StorageApi;
export { StorageApi };
