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

interface UploadRes {
    signedUrl?: string;
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
  }),
});

export const { 
  useUploadImageMutation,
  useUploadVideoMutation,
} = StorageApi;
export { StorageApi };
