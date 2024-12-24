
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "../../supabase/supabase_client";

// TypeScript interfaces
interface AuthReq {
  firstName?: string;
  lastName?: string;
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
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    signUp: builder.mutation<AuthRes, AuthReq>({
      queryFn: async ({ firstName, lastName, email, phone, password }) => {
        if (!email || !password) {
          return { error: { data: "Email and password are required!" } };
        }

        try {
          // Sign up the user
          const { data: authData, error: authError } =
            await supabase.auth.signUp({
              email,
              password,
            });

          if (authError) {
            return { error: { data: authError.message } };
          }

          // Create user profile
          const businessname = firstName || lastName || "";
          const userProfile = {
            email,
            businessname,
            phone: phone || "",
          };

          const { error: profileError } = await supabase
            .from("businessprofiles")
            .insert(userProfile);

          if (profileError) {
            return { error: { data: profileError.message } };
          }

          return { data: { data: "User created successfully!" } };
        } catch (error) {
          console.error("Error creating user:", error);
          return { error: { data: (error as Error).message } };
        }
      },
    }),

    logIn: builder.mutation<AuthRes, AuthReq>({
      queryFn: async ({ email, password }) => {
        if (!email || !password) {
          return { error: { data: "Email and password are required!" } };
        }
    
        try {
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
    
          if (authError) {
            return { error: { data: authError.message } };
          }
    
          const { user } = authData;
    
          const { data: profileData, error: profileError } = await supabase
            .from("profile")
            .select("*")
            .eq("business_id", user!.id);
    
          if (profileError) {
            return { error: { data: profileError.message } };
          }
    
          if (profileData && profileData.length > 0) {
            return { data: { data: "Congrats! You are signed in!" } };
          } else {
            return { error: { data: "No profile associated with this account." } };
          }
        } catch (error) {
          console.error("Login error:", error);
          return { error: { data: (error as Error).message } };
        }
      },
    }),
    
    logOut: builder.mutation<AuthRes, AuthReq>({
      queryFn: async () => {
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (!userData?.user) {
            return { error: { data: "No user currently signed in!" } };
          }

          const { error: signOutError } = await supabase.auth.signOut();
          if (signOutError) {
            return { error: { data: signOutError.message } };
          }

          return { data: { data: "User is signed out successfully!" } };
        } catch (error) {
          return { error: { data: (error as Error).message } };
        }
      },
    }),
  }),
});

export const { useSignUpMutation, useLogInMutation, useLogOutMutation } =
  BusinessAuthApi;
export { BusinessAuthApi };
