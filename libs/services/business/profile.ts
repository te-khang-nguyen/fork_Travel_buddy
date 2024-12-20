import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '../../supabase/supabase_client';
import  { globalStore } from '@/libs/globalStore';

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
                const { data: { user }, error: getUerror } = await supabase.auth.getUser();
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()
                const { data: refreshSession, error: refreshError } = await supabase.auth.refreshSession()

                if (user) { //Signed In
                    const { data, error } = await supabase
                        .from(globalStore.entity)
                        .select()
                        .eq(globalStore.field, user.id)
                        .single();

                    if (!error) {
                        delete data[globalStore.field];
                        return { data };
                    } else {
                        return { error: error };
                    }

                } else {  // Singed out
                    return { error: getUerror };
                }
            },
        }),

        updateProfile: builder.mutation<ProfileRes, ProfileReq>({ 
            queryFn: async (input) => {
                const { data: { user } } = await supabase.auth.getUser();

                if (user) { //Signed In

                    const { data, error } = await supabase
                        .from(globalStore.entity)
                        .select()
                        .eq(globalStore.field, user.id)
                        .single();

                    if (!error) {
                        const { error } = await supabase
                            .from(globalStore.entity)
                            .update(input)
                            .eq(globalStore.field, data[globalStore.field]);
                        if (error) {
                            return { error: error };
                        } else {
                            return { data };
                        }
                    } else {
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
