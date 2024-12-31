import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "../../supabase/supabase_client";
import { imgToDB, upsertNewRow } from "../utils";

interface ChallengeReq {
  title: string;
  description: string;
  thumbnail: string;
  backgroundImage: string | null;
}

interface ChallengeRes {
  data?: any;
  error?: any;
}

const ChallengeApi = createApi({
  reducerPath: "createChallenge",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getAllChallenges: builder.query<any, void>({
      queryFn: async () => {
      try {
        const { data, error } = await supabase
        .from("challenges")
        .select("*");

        if (error) {
        return { error };
        }

        return { data };
      } catch (error) {
        return { error };
      }
      },
    }),
    createChallenge: builder.mutation<ChallengeRes, ChallengeReq>({
      queryFn: async ({ title, description, thumbnail, backgroundImage }) => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            throw new Error("User not authenticated");
          }

          const thumbnailUrl = await imgToDB(thumbnail, title);
          const backgroundUrl = backgroundImage
            ? await imgToDB(backgroundImage, title)
            : null;

          const { data, error } = await supabase
            .from("challenges")
            .insert([
              {
                title,
                businessid: user.id,
                description,
                thumbnailUrl,
                backgroundUrl,
              },
            ])
            .select("id")
            .single();

          if (error) {
            return { error };
          }

          return { data: { id: data.id } as ChallengeRes };
        } catch (error) {
          return { error };
        }
      },
    }),
    updateChallenge: builder.mutation<ChallengeRes, { id: string; data: any }>({
      queryFn: async ({ id, data }) => {
        try {
          const result = await upsertNewRow({ entity: "challenges", id, ...data });
          if (result.error) {
            return { error: result.error };
          }
          return { data: result.data };
        } catch (error) {
          return { error };
        }
      },
    }),
  }),
});

export const { 
  useCreateChallengeMutation, 
  useGetAllChallengesQuery, 
  useUpdateChallengeMutation 
} = ChallengeApi;
export { ChallengeApi };
