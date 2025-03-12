import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/libs/supabase/baseQuery";

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
  avatarUrl?: string
}

interface ProfileRes {
  data: any;
  error?: string;
}

const UserProfileApi = createApi({
  reducerPath: "userprofile",
  baseQuery,
  endpoints: (builder) => ({
    getProfile: builder.query<ProfileRes, void>({
      query: () => ({
        url: `/profile`,
        params: { role: "user" }
      }),
    }),

    updateProfile: builder.mutation<ProfileRes, ProfileReq>({
      query: (payload) => ({
        url: `/profile`,
        params: { role: "user" },
        method: "PUT",
        body: payload
      }),
    }),

    updateAvatar: builder.mutation<ProfileRes, ProfileReq>({
      query: ({avatarUrl}) => ({
        url: `/profile/avatar`,
        params: { role: "user" },
        method: "PUT",
        body: { "avatar-url": avatarUrl }
      }),
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdateAvatarMutation
} = UserProfileApi;
export { UserProfileApi };
