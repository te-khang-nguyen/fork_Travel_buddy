import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/libs/supabase/baseQuery";
import { ActivityInfo } from "../user/experience";

export interface Activity {
    id: string;
    experience_id: string;
    title: string;
    primary_photo: string;
    primary_photo_id?: string;
    photos?: string[];
    hours?: string;
    description: string;
    description_thumbnail: string;
    activity_info?: ActivityInfo[];
    order_of_appearance: number;
}


interface ActivityResponse {
    data: Activity;
    error?: string;
}

export type ActivityReq = Omit<Activity, 'id' >;

const ActivityBusinessApi = createApi({
  reducerPath: "createActivity",
  baseQuery,
  endpoints: (builder) => ({
    createActivity: builder.mutation<ActivityResponse, ActivityReq>({
      query: ({
            experience_id,
            title,
            primary_photo,
            primary_photo_id,
            photos,
            hours,
            description,
            description_thumbnail,
            order_of_appearance=-1
        }) => ({
            url: `/activities`,
            method: "POST",
            body: {
                experience_id,
                title,
                primary_photo,
                primary_photo_id,
                photos,
                hours,
                description,
                description_thumbnail,
                order_of_appearance
            },
      }),
    }),
    updateActivity: builder.mutation<ActivityResponse, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/activities`,
        params: {"activity-id": id},
        method: "PUT",
        body: data,
      }),
    }),
  }),
});

export const { 
  useCreateActivityMutation,
  useUpdateActivityMutation,
} = ActivityBusinessApi;
export { ActivityBusinessApi };
