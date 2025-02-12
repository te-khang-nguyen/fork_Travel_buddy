import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/libs/supabase/baseQuery";

interface ImageReq {
    imageBase64: string | null;
    title: string;
    bucket: string;
}

interface ImageRes {
    signedUrl?: string;
    error?: any;
}  

const StorageApi = createApi({
  reducerPath: "storage",
  baseQuery,
  endpoints: (builder) => ({
    uploadImage: builder.mutation<ImageRes, ImageReq>({
        query: (params) => ({
          url: `/storage/upload_image`,
          method: "POST",
          body: params,
        }),
    }),
  }),
});

export const { 
  useUploadImageMutation
} = StorageApi;
export { StorageApi };
