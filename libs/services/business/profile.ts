import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/libs/supabase/baseQuery";

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
  baseQuery,
  endpoints: (builder) => ({

    getProfile: builder.query<ProfileRes, void>({
      query: () => ({
        url: `/profile`,
        params: { role: "business" }
      })
    }),

    updateProfile: builder.mutation<ProfileRes, ProfileReq>({
      query: (payload) => ({
        url: `/profile`,
        params: { role: "business" },
        method: "PUT",
        body: payload
      }),
    }),

  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation } =
  BusinessProfileApi;
export { BusinessProfileApi };
