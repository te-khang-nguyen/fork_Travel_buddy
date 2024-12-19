import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '../../supabase/supabase_client';

// Define TypeScript interfaces for the request and response data
interface ProfileReq {

    username?: string,
    businessname?: string,
    email?: string,
    firstname?: string,
    lastname?: string,
    facebook?: string,
    instagram?: string,
    x?: string,
    phone?: string,
    references?: string,
    description?: string

};

interface ProfileRes {
    data: any;
    error?: string;
};




const UserProfileApi = createApi({
    reducerPath: 'userprofile',
    baseQuery: fakeBaseQuery(),
    endpoints: (builder) => ({
        getProfile: builder.query({
            queryFn: async () => {
                let entity;
                const { data: { user }, error: getUerror } = await supabase.auth.getUser();
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()
                const { data: refreshSession, error: refreshError } = await supabase.auth.refreshSession();
                //const searchField = ['user', 'business'];
                console.log('User display from service file:', user.id, user.email);
                console.log('Get user error:', getUerror);
                console.log('User session expiration:', session.expires_in ? session.expires_in : "No info");

                if (user) { //Signed In
                    entity = "userprofiles";
                    const { data, error } = await supabase
                        .from(entity)
                        .select()
                        .eq("userid", user.id)
                        .single();

                    if (!error) {
                        console.log("Profile found:", data["userid"]);
                        delete data["userid"];
                        console.log(data);
                        return { data };
                    } else {
                        console.log("User profile error:", error);
                        return { error: error };
                    }


                    //resp = { code: 200, mess: { message: "User profile retreived successfully!", data: data } };

                    //return resp;
                } else {  // Singed out
                    return { error: getUerror };
                }
            },
        }),

        updateProfile: builder.mutation<ProfileRes, ProfileReq>({ //{ username,businessname,email,firstname,lastname,facebook,instagram,x,phone }
            queryFn: async (input) => {
                console.log(input);
                let entity;
                const { data: { user } } = await supabase.auth.getUser();

                if (user) { //Signed In

                    entity = "userprofiles";
                    const { data, error } = await supabase
                        .from(entity)
                        .select()
                        .eq("userid", user.id)
                        .single();

                    if (!error) {
                        const { error } = await supabase
                            .from(entity)
                            .update(input)
                            .eq("userid", data["userid"]);
                        if (error) {
                            console.log(error);
                            return { error: error };
                        } else {
                            return { data };
                        }
                    } else {
                        console.log("User profile error:", error);
                        return { error: error };
                    }


                    //resp = { code: 200, mess: { message: "User profile retreived successfully!", data: data } };

                    //return resp;
                } else {  // Singed out
                    return { error: "Session expired!" };

                }
            }
        }),

    }),
});

export const { useGetProfileQuery, useUpdateProfileMutation } = UserProfileApi;
export { UserProfileApi };
