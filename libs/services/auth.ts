import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '../supabase/supabase_client';
const { createClient } = require('@supabase/supabase-js');

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




const AuthApi = createApi({
    reducerPath: 'authen',
    baseQuery: fakeBaseQuery(),
    endpoints: (builder) => ({
        signUp: builder.mutation<AuthRes, AuthReq>({
            queryFn: async ({ firstName, lastName, email, phone, password }) => { //: {firstname, lastname, email, phone, password}
                console.log("Current user's email:", email);
                let uid;
                let token;
                let userProfile;
                let entity;
                if (!email || !password) {
                    return { err: 'Email and password are required!' };
                }
                
                try {

                    try {
                        // Create user in Supabase auth
                        if (firstName != lastName) {
                            entity = 'userprofiles';
                        } else {
                            entity = 'businessprofiles';
                        };
                        console.log(entity);
                        const { data: authData, error: authError } = await supabase.auth.signUp({
                            email: email,
                            password: password,
                            options: {
                                emailRedirectTo: 'http://localhost:3000' //,
                                //data: {
                                //   user_role: entity.split('p')[0]
                                //}
                            },
                        });
                        if (authError){
                            console.log(authError);
                            return { authError };
                        };
                        console.log(authData);
                        //uid = authData.user.id;
                        token = authData.session.access_token;

                    } catch (error) {
                        console.log(error);
                        return { code: 500, mess: { message: "Email is already used by another account!" } };
                    }


                    if (firstName != lastName) {
                        userProfile = {
                            //userid: uid,
                            //entity: entity,
                            email: email,
                            username: `${firstName}${lastName}`,
                            firstname: firstName,
                            lastname: lastName,
                            phone: phone
                        };
                    } else {
                        let businessname = firstName ? firstName : lastName? lastName : "";
                        userProfile = {
                            //businessid: uid,
                            //entity: entity,
                            email: email,
                            businessname: businessname,
                            phone: !phone ? "" : phone,
                        }
                    }

                    const supabasePreSignIn = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
                        global: {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }
                    });


                    // Create user profile in profiles table
                    const { error } = await supabasePreSignIn
                        .from(entity)
                        .insert(userProfile);

                    if (error) {
                        console.log(error);
                        return { err: error };
                    };

                    return { data: 'User created successfully!' };

                    //return resp;

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

                //console.log("Request entity:", entity);

                try {
                    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                        email: email,
                        password: password
                    });

                    if (!authError) {
                        console.log(`Congrats! You are signed in with`, authData.user.id);
                        return {  data: `Congrats! You are signed in!` };
                    } else {
                        console.log(`Error during sign in:`, authError);
                        return { err: `Fail to sign in!` };
                    }

                } catch (error) {
                    console.error('Login error:', error);
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
                        console.log(!error ? "User is now log out!" : error);
                        return !error? {  data: "User is signed out successfully!"} : { err: error };
                    } else {
                        console.log("Wrong user email!");
                        return { err: "Wrong user email!" };
                    }
                } catch (error) {
                    console.log(error);
                    return { error };
                };
            }
        }),

    }),
});

export const { useSignUpMutation, useLogInMutation, useLogOutQuery } = AuthApi;
export { AuthApi };
