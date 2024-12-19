import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '../../supabase/supabase_client';

// Define TypeScript interfaces for the request and response data
interface ProfileReq {

    businessname?: string,
    email?: string,
    facebook?: string,
    instagram?: string,
    x?: string,
    phone?: string,
    description?: string,
    type?: string

};

interface ProfileRes {
    data: any;
    error?: string;
};


const BusinessProfileApi = createApi({
    reducerPath: 'businessprofile',
    baseQuery: fakeBaseQuery(),
    endpoints: (builder) => ({
        getProfile: builder.query({
            queryFn: async () => {
                let entity;
                const { data: { user }, error: getUerror } = await supabase.auth.getUser();
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()
                const { data: refreshSession, error: refreshError } = await supabase.auth.refreshSession();
                //const searchField = ['user', 'business'];
                console.log('User display from service file:', user);
                console.log('Get user error:', getUerror);
                console.log('User session expiration:', session.expires_in ? session.expires_in : "No info");

                if (user) { //Signed In
                    entity = "businessprofiles";
                    const { data, error } = await supabase
                        .from(entity)
                        .select()
                        .eq("businessid", user.id)
                        .single();

                    if (!error) {
                        console.log("Profile found:", data["businessid"]);
                        delete data["businessid"];
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

                    entity = "businessprofiles";
                    const { data, error } = await supabase
                        .from(entity)
                        .select()
                        .eq("businessid", user.id)
                        .single();

                    if (!error) {
                        const { error } = await supabase
                            .from(entity)
                            .update(input)
                            .eq("businessid", data["businessid"]);
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

export const { useGetProfileQuery, useUpdateProfileMutation } = BusinessProfileApi;
export { BusinessProfileApi };
