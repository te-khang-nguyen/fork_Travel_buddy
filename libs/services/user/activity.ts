import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/libs/supabase/baseQuery";
import { Activity } from "../user/experience";

interface GetActivityResponse {
    data: Activity[];
}

const ActivityUserApi = createApi({
  reducerPath: "getActivity",
  baseQuery,
  endpoints: (builder) => ({
    getActivitiesInExperience: builder.query<Activity[], { experience_id: string }>({
      query: ({ experience_id }) => ({
        url: `/activities/experience`,
        params: {"experience-id": experience_id},
        method: "GET",
      }),
      transformResponse: (response: GetActivityResponse): Activity[] =>
        response.data,
    }),
  }),
});

export const { 
  useGetActivitiesInExperienceQuery,
} = ActivityUserApi;
export { ActivityUserApi };
