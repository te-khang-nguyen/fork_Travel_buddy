import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/libs/supabase/baseQuery";

// TypeScript interfaces
interface AuthReq {
  businessName?: string;
  email: string;
  phone?: string;
  password: string;
}

interface AuthRes {
  data: any;
  error?: any;
}

const BusinessAuthApi = createApi({
  reducerPath: "businessauth",
  baseQuery,
  endpoints: (builder) => ({
    signUp: builder.mutation<AuthRes, AuthReq>({
      query: (body) => ({
        url: "/auth/business/sign-up",
        method: "POST",
        body,
      }),
    }),

    logIn: builder.mutation<AuthRes, AuthReq>({
      query: (body) => ({
        url: "/auth/business/login",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useSignUpMutation, useLogInMutation } =
  BusinessAuthApi;
export { BusinessAuthApi };
