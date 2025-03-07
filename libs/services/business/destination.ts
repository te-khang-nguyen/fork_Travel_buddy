import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/libs/supabase/baseQuery";

export interface Destination {
    id: string;
    created_by?: string;
    name: string;
    primary_photo: string;
    photos?: string[];
    address?: string;
    status?: string;
    created_at?: string; // Consider using Date type if you want to handle dates
    updated_at?: string; // Consider using Date type if you want to handle dates
    primary_keyword?: string;
    url_slug?: string;
    description?: string;
    thumbnail_description?: string;
    primary_video?: string;
    parent_destination?: string | null; // Use null for optional fields
}

interface DestinationResponse {
    data: Destination;
    error?: string;
}

export type DestinationReq = Omit<Destination, 'id' | 'created_at' | 'updated_at' | 'created_by'>;

const DestinationBusinessApi = createApi({
  reducerPath: "createDestination",
  baseQuery,
  endpoints: (builder) => ({
    createDestination: builder.mutation<DestinationResponse, DestinationReq>({
      query: ({
            name,
            primary_photo,
            photos,
            address,
            primary_keyword,
            url_slug,
            description,
            thumbnail_description,
            primary_video,
            parent_destination
        }) => ({
            url: `/destination`,
            method: "POST",
            body: {
                name,
                primary_photo,
                photos,
                address,
                primary_keyword,
                url_slug,
                description,
                thumbnail_description,
                primary_video,
                parent_destination,
            },
      }),
    }),
    updateDestination: builder.mutation<DestinationResponse, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/destination`,
        params: {destination_id: id},
        method: "PUT",
        body: data,
      }),
    }),
    createDestinationDetails: builder.mutation<any, any>({
      query: ({
          destination_id,
          type,
          name,
          text,
          media,
        }) => ({
            url: `/destination/details`,
            method: "POST",
            body: {
              destination_id,
              type,
              name,
              text,
              media,
            },
      }),
    }),
  }),
});

export const { 
  useCreateDestinationMutation,
  useUpdateDestinationMutation,
  useCreateDestinationDetailsMutation,
} = DestinationBusinessApi;
export { DestinationBusinessApi };
