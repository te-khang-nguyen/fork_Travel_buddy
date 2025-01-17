import { baseQuery } from "@/libs/supabase/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

interface AuthReq {
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  password: string;
}

interface AuthRes {
  message?: string;
  error?: string;
}

const UserAuthApi = createApi({
  reducerPath: "userauth",
  baseQuery, // Use the reusable baseQuery
  endpoints: (builder) => ({
    signUpWithGoogle: builder.mutation<any, void>({
      query: () => ({
        url: "/auth/oauth",
        method: "POST",
        body: { provider: "google" },
      }),
    }),

    fetchUserAfterOAuth: builder.query({
      query: ({ accessToken, refreshToken }) => ({
        url: `/auth/callback`,
        params: { access_token: accessToken, refresh_token: refreshToken },
      }),
    }),
    signUpWithFacebook: builder.mutation<any, void>({
      query: () => ({
        url: "/auth/oauth",
        method: "POST",
        body: { provider: "facebook" },
      }),
    }),

    signUp: builder.mutation<AuthRes, AuthReq>({
      query: (body) => ({
        url: "/auth/sign-up",
        method: "POST",
        body,
      }),
    }),

    logIn: builder.mutation<AuthRes, AuthReq>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    }),

    logOut: builder.mutation<AuthRes, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useFetchUserAfterOAuthQuery,
  useSignUpMutation,
  useLogInMutation,
  useLogOutMutation,
  useSignUpWithFacebookMutation,
  useSignUpWithGoogleMutation,
} = UserAuthApi;

export { UserAuthApi };
