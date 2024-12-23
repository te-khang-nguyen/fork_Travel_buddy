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

const UserAuthApi = createApi({
  reducerPath: "userauth",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    signUp: builder.mutation<AuthRes, AuthReq>({
      queryFn: async ({ firstName, lastName, email, phone, password }) => {
        if (!email || !password) {
          return { error: "Email and password are required!" };
        }

        try {
          // Sign up the user
          const { data: authData, error: authError } =
            await supabase.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: "http://localhost:3000",
              },
            });

          if (authError) {
            return { error: authError.message };
          }

          // Create user profile
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

          if (profileError) {
            return { error: profileError.message };
          }

          return { data: { message: "User created successfully!" } };
        } catch (err: any) {
          return { error: err.message || "An unknown error occurred." };
        }
      },
    }),

    logIn: builder.mutation<AuthRes, AuthReq>({
      queryFn: async ({ email, password }) => {
        if (!email || !password) {
          return { error: "Email and password are required!" };
        }

        try {
          const { data: authData, error: authError } =
            await supabase.auth.signInWithPassword({
              email,
              password,
            });

          if (authError) {
            return { error: authError.message };
          }

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

          if (!user) {
            return { error: "No user currently signed in!" };
          }

          const { error } = await supabase.auth.signOut();

          if (error) {
            return { error: error.message };
          }

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

export const { useSignUpMutation, useLogInMutation, useLogOutMutation } =
  UserAuthApi;
export { UserAuthApi };
