import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '../supabase/supabase_client';


const UsersApi = createApi({
  reducerPath: 'users',
  baseQuery: fakeBaseQuery(), // Using fakeBaseQuery for direct Supabase queries
  endpoints: (builder) => ({
    getUsers: builder.query({
      queryFn: async () => {
        try {
          
          // Querying Supabase for data
          const { data, error } = await supabase
            .from('users')
            .select('*');

          // Handle any errors returned by Supabase
          if (error) {
            return { error: error.message };
          }

          // Return the data if no errors
          return { data };
        } catch (err: unknown) {
          // Catch any network errors
          return { error: err };
        }
      },
    }),
  }),
});

export const { useGetUsersQuery } = UsersApi;
export { UsersApi };
