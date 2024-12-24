import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "../../supabase/supabase_client";

// Define TypeScript interfaces for the request and response data
interface ProfileReq {
  businessname?: string;
  email?: string;
  facebook?: string;
  instagram?: string;
  x?: string;
  phone?: string;
  description?: string;
  type?: string;
}

interface ProfileRes {
  email?: string | null;
  firstname?: string | null;
  id?: string;
  lastname?: string | null;
  preferences?: string | null;
  role?: string | null;
  travelhistory?: string | null;
  username?: string | null;
  [key: string]: any; // Allow additional properties
}

const BusinessProfileApi = createApi({
  reducerPath: "businessprofile",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getProfile: builder.query<ProfileRes, void>({
      queryFn: async () => {
        try {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) {
            return { error: { message: userError?.message || "User is not signed in." } };
          }

          const { data, error } = await supabase
            .from("businessprofiles")
            .select()
            .eq("businessid", user.id)
            .single();

          if (error) {
            return { error: { message: error.message } };
          }

          return { data };
        } catch (err) {
          return { error: { message: "An unexpected error occurred." } };
        }
      },
    }),

    updateProfile: builder.mutation<ProfileRes, ProfileReq>({
      queryFn: async (input) => {
        try {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError || !user) {
            return { error: { message: userError?.message || "User is not signed in." } };
          }

          const { data: existingData, error: fetchError } = await supabase
            .from("businessprofiles")
            .select()
            .eq("businessid", user.id)
            .single();

          if (fetchError) {
            return { error: { message: fetchError.message } };
          }

          if (existingData) {
            const { error: updateError } = await supabase
              .from("businessprofiles")
              .update(input)
              .eq("businessid", user.id);

            if (updateError) {
              return { error: { message: updateError.message } };
            }

            return { data: { ...existingData, ...input } };
          }

          return { error: { message: "No data found to update." } };
        } catch (err) {
          return { error: { message: "An unexpected error occurred during the update." } };
        }
      },
    }),
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation } =
  BusinessProfileApi;
export { BusinessProfileApi };
