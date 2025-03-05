import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/libs/supabase/baseQuery";
import { Feature } from "@/app/components/destination/DestinationDetails";

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
    description: string;
    description_thumbnail: string;
}

interface AttractionResponseList {
    data: Attraction[];
}

export interface DestinationDetails {
    id: string;
    destination_id: string;
    type: string;
    name: string;
    text: string;
    media: string[];
    created_at: string;
    updated_at: string;
}

interface DestinationDetailsRes {
    data: DestinationDetails[];
}

interface IconicPhotos {
    id: string;
    destination_id: string;
    type: string;
    name: string;
    text: string;
    created_at: string;
    updated_at: string;
    media_id: string;
    url: string;
}

interface IconicPhotosResponseList {
    data: IconicPhotos[];
}

export function convertDestinationDetailsToFeature(details: DestinationDetails): Feature {
    return {
        type: details.type,
        name: details.name,
        text: details.text,
        media: details.media,
        startIcon: details.type === "historical_context" 
        ? "https://example.com/iconHistorical" 
        : details.type === "famous_visitors" 
            ? "https://example.com/iconFamousVisitors" 
            : "https://example.com/defaultIcon"
    };
}

export function convertDestinationDetailsToFeatures(detailsList: DestinationDetails[]): Feature[] {
    return detailsList.map(convertDestinationDetailsToFeature);
}
  

const DestinationApi = createApi({
  reducerPath: "destination",
  baseQuery,
  endpoints: (builder) => ({
    // ------------------QUERY CHALLENGE BY ID--------------------------
    getAllDestinations: builder.query<Destination[], void>({
      query: () => ({
        url: `/destination`
      }),
      transformResponse: ((res: DestinationResponseList) => res.data)
    }),
    getDestination: builder.query<Destination, {id: string}>({
      query: ({id}) => ({
        url: `/destination`,
        params: {"destination-id" : id},
      }),
      transformResponse: ((res: DestinationResponse) => res.data)
    }),
    getDestinationDetails: builder.query<DestinationDetails[], {id: string, type?: string}>({
      // This function returns all destination_details except for iconic_photos (which requires further data transformation)
      query: ({id, type}) => ({
        url: `/destination/details`,
        params: {destination_id : id, type},
      }),
      transformResponse: ((res: DestinationDetailsRes) => res.data)
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
    }),
    getIconicPhotos: builder.query<IconicPhotos[], {id: string}>({
      query: ({id}) => ({
        url: `/destination/iconic-photos`,
        params: {destination_id : id},
      }),
      transformResponse: ((res: IconicPhotosResponseList) => res.data)
    }),
  }),
});

export const {
  useGetAllDestinationsQuery,
  useGetDestinationQuery,
  useGetDestinationDetailsQuery,
  useGetChildrenDestinationsQuery,
  useGetAttractionsQuery,
  useGetIconicPhotosQuery,
} = DestinationApi;
export { DestinationApi };
