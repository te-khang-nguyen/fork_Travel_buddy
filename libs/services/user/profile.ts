import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "../../supabase/supabase_client";

// Define TypeScript interfaces for the request and response data
interface ProfileReq {
  username?: string;
  businessname?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  facebook?: string;
  instagram?: string;
  x?: string;
  phone?: string;
  references?: string;
  description?: string;
}

interface ProfileRes {
    data: any;
  error?: string;
}

const UserProfileApi = createApi({
  reducerPath: "userprofile",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getProfile: builder.query<ProfileRes, void>({
      queryFn: async () => {
        const {
          data: { user },
          error: getUerror,
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from("userprofiles")
            .select()
            .eq("userid", user.id)
            .single();

          if (!error) {
            return { data: { data } };
          } else {
            return { error: error.message };
          }
        } else {
          return { error: getUerror?.message || "User not authenticated" };
        }
      },
    }),

    updateProfile: builder.mutation<ProfileRes, ProfileReq>({
      queryFn: async (input) => {
        try {
          const {
            data: { user },
            error: getUerror,
          } = await supabase.auth.getUser();

          if (!user) {
            return { error: getUerror?.message || "Session expired!" };
          }

          const { error: updateError } = await supabase
            .from("userprofiles")
            .update(input)
            .eq("userid", user.id);

          if (updateError) {
            return { error: updateError.message };
          }

          // Return updated data in a format matching ProfileRes
          return { data: { data: input } };
        } catch (err: any) {
          return { error: err.message || "An unexpected error occurred" };
        }
      },
    }),
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation } = UserProfileApi;
export { UserProfileApi };
