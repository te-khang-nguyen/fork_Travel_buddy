import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '../../supabase/supabase_client';
import  { globalStore } from '@/libs/globalStore';

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
                const { data: { user }, error: getUerror } = await supabase.auth.getUser();

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

        updateProfile: builder.mutation<ProfileRes, ProfileReq>({ //{ username,businessname,email,firstname,lastname,facebook,instagram,x,phone }
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

                } else {  // Session expired!
                    return { error: "Session expired!" };

                }
            }
        }),

    }),
});

export const { useGetProfileQuery, useUpdateProfileMutation } = UserProfileApi;
export { UserProfileApi };
