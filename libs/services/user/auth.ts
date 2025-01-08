import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "../../supabase/supabase_client";

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

import { Provider } from "@supabase/supabase-js";
import { baseUrl } from "@/app/constant";

const handleOAuthSignIn = async (provider: Provider) => {
  const { data: authData, error: authError } =
    await supabase.auth.signInWithOAuth({ provider,options:{redirectTo:`${baseUrl}/auth/callbackv1`} });

  if (authError) {
    return { error: authError.message };
  }

  return { data: authData };
};

const UserAuthApi = createApi({
  reducerPath: "userauth",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    signUpWithGoogle: builder.mutation<any, void>({
      queryFn: () => handleOAuthSignIn("google"),
    }),

    signUpWithFacebook: builder.mutation<any, void>({
      queryFn: () => handleOAuthSignIn("facebook"),
    }),

    signUp: builder.mutation<AuthRes, AuthReq>({
      queryFn: async ({ firstName, lastName, email, phone, password }) => {
        if (!email || !password)
          return { error: "Email and password are required!" };

        try {
          const { error: authError } = await supabase.auth.signUp({
            email,
            password,
          });
          if (authError) return { error: authError.message };

          const userProfile =
            firstName !== lastName
              ? {
                  email,
                  username: `${firstName}${lastName}`,
                  firstname: firstName,
                  lastname: lastName,
                  phone,
                }
              : {
                  email,
                  businessname: firstName || lastName || "",
                  phone: phone || "",
                };

          const { error: profileError } = await supabase
            .from("userprofiles")
            .insert(userProfile);
          if (profileError) return { error: profileError.message };

          await supabase.auth.signOut();
          return { data: { message: "User created successfully!" } };
        } catch (err: any) {
          return { error: err.message || "An unknown error occurred." };
        }
      },
    }),

    logIn: builder.mutation<AuthRes, AuthReq>({
      queryFn: async ({ email, password }) => {
        if (!email || !password)
          return { error: "Email and password are required!" };

        try {
          const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (authError) return { error: authError.message };

          return { data: { message: "Congrats! You are signed in!" } };
        } catch (err: any) {
          return {
            error: err.message || "Login failed due to an unknown error.",
          };
        }
      },
    }),

    logOut: builder.mutation<AuthRes, void>({
      queryFn: async () => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) return { error: "No user currently signed in!" };

          const { error } = await supabase.auth.signOut();
          if (error) return { error: error.message };

          return { data: { message: "User is signed out successfully!" } };
        } catch (err: any) {
          return {
            error: err.message || "An unknown error occurred during sign out.",
          };
        }
      },
    }),
  }),
});

export const {
  useSignUpMutation,
  useLogInMutation,
  useLogOutMutation,
  useSignUpWithFacebookMutation,
  useSignUpWithGoogleMutation,
} = UserAuthApi;
export { UserAuthApi };
