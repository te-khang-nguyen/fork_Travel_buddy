import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/libs/supabase/baseQuery";

export interface Destination {
    id: string;
    created_by: string;
    name: string;
    primary_photo: string;
    photos: string[];
    address: string;
    status: string;
    created_at: string; // Consider using Date type if you want to handle dates
    updated_at: string; // Consider using Date type if you want to handle dates
    primary_keyword: string;
    url_slug: string;
    description: string;
    thumbnail_description: string;
    primary_video: string;
    parent_destination: string | null; // Use null for optional fields
}

interface DestinationResponse {
    data: Destination;
}

interface DestinationResponseList {
    data: Destination[];
}

export interface AttractionInfo {
    description: string;
    description_thumbnail: string;
}

export interface Attraction {
    id: string;
    destination_id: string;
    title: string;
    primary_photo: string;
    photos: string[];
    hours: string;
    status: string;
    attraction_info: AttractionInfo[];
}

interface AttractionResponseList {
    data: Attraction[];
}

const DestinationApi = createApi({
  reducerPath: "destination",
  baseQuery,
  endpoints: (builder) => ({
    // ------------------QUERY CHALLENGE BY ID--------------------------
    getAllDestinations: builder.query<any, void>({
      query: () => ({
        url: `/destination`,
      })
    }),
    getDestination: builder.query<Destination, {id: string}>({
      query: ({id}) => ({
        url: `/destination`,
        params: {destination_id : id},
      }),
      transformResponse: ((res: DestinationResponse) => res.data)
    }),
    getChildrenDestinations: builder.query<Destination[], {id:string}>({
      query: ({id}) => ({
        url: `/destination/children`,
        params: {parent_destination_id : id},
      }),
      transformResponse: ((res: DestinationResponseList) => res.data)
    }),
    getAttractions: builder.query<any, {id: string}>({
      query: ({id}) => ({
        url: `/destination/attractions`,
        params: {destination_id : id},
      }),
      transformResponse: ((res: AttractionResponseList) => res.data)
    })
  }),
});

export const {
  useGetAllDestinationsQuery,
  useGetDestinationQuery,
  useGetChildrenDestinationsQuery,
  useGetAttractionsQuery,
} = DestinationApi;
export { DestinationApi };
