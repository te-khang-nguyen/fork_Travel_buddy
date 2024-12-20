import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '../../supabase/supabase_client';
const { createClient } = require('@supabase/supabase-js');
import  { globalStore } from '@/libs/globalStore';

// Define TypeScript interfaces for the request and response data
interface AuthReq {

    firstName?: string,
    lastName?: string,
    email: string,
    phone?: string,
    password: string

};

interface AuthRes {
    data: any;
    error?: string;
};


const UserAuthApi = createApi({
    reducerPath: 'userauth',
    baseQuery: fakeBaseQuery(),
    endpoints: (builder) => ({
        signUp: builder.mutation<AuthRes, AuthReq>({
            queryFn: async ({ firstName, lastName, email, phone, password }) => { //: {firstname, lastname, email, phone, password}
                let token;
                let userProfile;
                if (!email || !password) {
                    return { err: 'Email and password are required!' };
                }
                
                try {

                    try {
                        const { data: authData, error: authError } = await supabase.auth.signUp({
                            email: email,
                            password: password,
                            options: {
                                emailRedirectTo: 'http://localhost:3000'
                            },
                        });
                        if (authError){
                            return { authError };
                        };
                        //uid = authData.user.id;
                        //token = authData.session.access_token;

                    } catch (error) {
                        return { code: 500, mess: { message: "Email is already used by another account!" } };
                    }


                    if (firstName != lastName) {
                        userProfile = {
                            email: email,
                            username: `${firstName}${lastName}`,
                            firstname: firstName,
                            lastname: lastName,
                            phone: phone
                        };
                    } else {
                        let businessname = firstName ? firstName : lastName? lastName : "";
                        userProfile = {
                            email: email,
                            businessname: businessname,
                            phone: !phone ? "" : phone,
                        }
                    }

                    //const supabasePreSignIn = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
                    //    global: {
                    //        headers: {
                    //            'Authorization': `Bearer ${token}`
                    //        }
                    //    }
                    //});


                    // Create user profile in profiles table
                    const { error } = await supabase //PreSignIn
                        .from('userprofiles')
                        .insert(userProfile);

                    if (error) {
                        return { err: error };
                    };

                    return { data: 'User created successfully!' };

                } catch (error) {
                    console.error('Error creating user:', error);
                    return { err: error };
                }
                
            },
        }),

        logIn: builder.mutation<AuthRes, AuthReq>({
            queryFn: async ({ email, password }) => {
                let resp;
                if (!email || !password) {
                    resp = { code: 400, mess: { message: 'Email and password are required!' } };
                    return resp;
                }

                try {
                    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                        email: email,
                        password: password
                    });

                    

                    if (!authError) {
                        globalStore.setRole('user');
                        globalStore.setEntity('userprofiles');
                        globalStore.setField('userid');
                        return {  data: "Congrats! You are signed in!" };
                    } else {
                        return { err: `Login fail!` };
                    }

                } catch (error) {
                    //console.error('Login error:', error);
                    return { error };
                }
            }
        }),

        logOut: builder.query({
            queryFn: async () => {
                try {
                    const { data: { user } } = await supabase.auth.getUser()
                    if (user) {
                        const { error } = await supabase.auth.signOut();
                        return !error? {  data: "User is signed out successfully!"} : { err: error };
                    } else {
                        return { err: "No user currently signed in!" };
                    }
                } catch (error) {
                    return { error };
                };
            }
        }),

    }),
});

export const { useSignUpMutation, useLogInMutation, useLogOutQuery } = UserAuthApi;
export { UserAuthApi };
