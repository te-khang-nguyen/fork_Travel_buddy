import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/libs/supabase/baseQuery";

interface ChallengeReq {
  title: string;
  description: string;
  thumbnail: string | null | undefined;
  backgroundImage: string | null | undefined;
  tourSchedule: string;
}

interface ImageReq {
  imageBase64: string | null;
  title: string;
  bucket: string;
}

interface ImageRes {
  signedUrl?: string;
  error?: any;
}

interface ChallengeRes {
  data?: any;
  error?: any;
}

interface AllChallengesRes {
  data: {
    id: string;
    businessid: string;
    description: string;
    thumbnailUrl: string;
    backgroundUrl: string | null;
    qrurl: string | null;
    price: number;
    created: string;
    title: string;
    tourSchedule: string | null;
    status: string;
  }[];
  error?: any;
}

const ChallengeApi = createApi({
  reducerPath: "createChallenge",
  baseQuery,
  endpoints: (builder) => ({
    getAllChallenges: builder.query<AllChallengesRes, void>({
      query: () => ({
        url: `/challenge/business/get-all-challenges`,
        method: "GET"
      }),
    }),
    createChallenge: builder.mutation<ChallengeRes, ChallengeReq>({
      query: ({ title, description, thumbnail, backgroundImage, tourSchedule }) => ({
        url: `/challenge/business/create`,
        method: "POST",
        body: {
          title,
          description,
          thumbnailUrl: thumbnail,
          backgroundUrl: backgroundImage,
          tourSchedule,
        },
      }),
    }),
    updateChallenge: builder.mutation<ChallengeRes, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/challenge/business/update/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteChallenge: builder.mutation<ChallengeRes, { id: string }>({
      query: ({ id }) => ({
        url: `/challenge/business/delete/${id}`,
        method: "PUT",
      }),
    }),
  }),
});

export const { 
  useCreateChallengeMutation, 
  useGetAllChallengesQuery, 
  useUpdateChallengeMutation,
  useDeleteChallengeMutation,
} = ChallengeApi;
export { ChallengeApi };
