import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/libs/supabase/baseQuery";
import { Experience } from "../business/experience";

export type Feature = {
  id: string;
  type: string;
  name: string;
  text: string;
  media: string[];
  startIcon: string;
};


interface ExperienceResponse {
    data: Experience;
}

interface ExperienceResponseList {
    data: Experience[];
}

export interface LocationInfo {
    description: string;
    description_thumbnail: string;
}

export interface ActivityInfo {
  description: string;
  description_thumbnail: string;
}

export interface Location {
    id: string;
    experience_id: string;
    title: string;
    primary_photo: string;
    photos: string[];
    hours: string;
    status: string;
    location_info: LocationInfo[];
    description: string;
    description_thumbnail: string;
    order_of_appearance: number;
}

export interface Activity {
  id: string;
  experience_id: string;
  title: string;
  primary_photo: string;
  photos: string[];
  hours: string;
  status: string;
  location_info: ActivityInfo[];
  description: string;
  description_thumbnail: string;
  order_of_appearance: number;
}

interface LocationResponseList {
    data: Location[];
}

export interface ExperienceDetails {
    id: string;
    experience_id: string;
    type?: string;
    name?: string;
    text?: string;
    media?: string[];
    created_at?: string;
    updated_at?: string;
}

export interface ExperienceDetailsRes {
    data: ExperienceDetails[];
}

interface IconicPhotos {
    id: string;
    experience_id: string;
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

export function convertExperienceDetailsToFeature(details: ExperienceDetails): Feature {
  if (!details || !details.id || !details.type || !details.name || !details.text || !details.media) {
    throw new Error("Missing required properties in details object");
}
  return {
        id: details.id,
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

export function convertExperienceDetailsToFeatures(detailsList: ExperienceDetails[]): Feature[] {
    return detailsList.map(convertExperienceDetailsToFeature);
}
  

const ExperienceApi = createApi({
  reducerPath: "experience",
  baseQuery,
  endpoints: (builder) => ({
    // ------------------QUERY CHALLENGE BY ID--------------------------
    getAllExperiences: builder.query<Experience[], void>({
      query: () => ({
        url: `/experiences`
      }),
      transformResponse: ((res: ExperienceResponseList) => res.data)
    }),
    getExperience: builder.query<Experience, {id: string}>({
      query: ({id}) => ({
        url: `/experiences`,
        params: {"experience-id" : id},
      }),
      transformResponse: ((res: ExperienceResponse) => res.data)
    }),
    getExperienceDetails: builder.query<ExperienceDetails[], {id: string, type?: string}>({
      // This function returns all experience_details except for iconic_photos (which requires further data transformation)
      query: ({id, type}) => ({
        url: `/experiences/details`,
        params: {"experience-id" : id, type},
      }),
      transformResponse: ((res: ExperienceDetailsRes) => res.data)
    }),
    getChildrenExperiences: builder.query<Experience[], {id:string}>({
      query: ({id}) => ({
        url: `/experiences/children`,
        params: {parent_experience_id : id},
      }),
      transformResponse: ((res: ExperienceResponseList) => res.data)
    }),
    getLocations: builder.query<Location[], {id: string}>({
      query: ({id}) => ({
        url: `/experiences/locations`,
        params: {"experience-id" : id},
      }),
      transformResponse: ((res: LocationResponseList) => res.data)
    }),
    getIconicPhotos: builder.query<IconicPhotos[], {id: string}>({
      query: ({id}) => ({
        url: `/experiences/iconicPhotos`,
        params: {"experience-id" : id},
      }),
      transformResponse: ((res: IconicPhotosResponseList) => res.data)
    }),

    // ------------------QUERY CHALLENGE BY ID--------------------------
    getAllExperiencesPublic: builder.query<Experience[], void>({
      query: () => ({
        url: `/experiences/public`
      }),
      transformResponse: ((res: ExperienceResponseList) => res.data)
    }),
    getExperiencePublic: builder.query<Experience, { id: string }>({
      query: ({ id }) => ({
        url: `/experiences/public`,
        params: { "experience-id": id },
      }),
      transformResponse: ((res: ExperienceResponse) => res.data)
    }),
    getExperienceDetailsPublic: builder.query<ExperienceDetails[], { id: string, type?: string }>({
      // This function returns all experience_details except for iconic_photos (which requires further data transformation)
      query: ({ id, type }) => ({
        url: `/experiences/public/details`,
        params: { "experience-id": id, type },
      }),
      transformResponse: ((res: ExperienceDetailsRes) => res.data)
    }),
    getChildrenExperiencesPublic: builder.query<Experience[], { id: string }>({
      query: ({ id }) => ({
        url: `/experiences/public/children`,
        params: { parent_experience_id: id },
      }),
      transformResponse: ((res: ExperienceResponseList) => res.data)
    }),
    getLocationsPublic: builder.query<Location[], { id: string }>({
      query: ({ id }) => ({
        url: `/experiences/public/locations`,
        params: { "experience-id": id },
      }),
      transformResponse: ((res: LocationResponseList) => res.data)
    }),
    getIconicPhotosPublic: builder.query<IconicPhotos[], { id: string }>({
      query: ({ id }) => ({
        url: `/experiences/public/iconicPhotos`,
        params: { "experience-id": id },
      }),
      transformResponse: ((res: IconicPhotosResponseList) => res.data)
    }),
    getExperienceByBusiness: builder.query<Experience, {id: string}>({
      query: ({id}) => ({
        url: `/experiences/business`,
        params: {"business-id" : id},
      }),
      transformResponse: ((res: ExperienceResponse) => res.data)
    }),
  }),
});

export const {
  useGetAllExperiencesQuery,
  useGetExperienceQuery,
  useGetExperienceDetailsQuery,
  useGetChildrenExperiencesQuery,
  useGetLocationsQuery,
  useGetIconicPhotosQuery,
  useGetAllExperiencesPublicQuery,
  useGetExperiencePublicQuery,
  useGetExperienceDetailsPublicQuery,
  useGetChildrenExperiencesPublicQuery,
  useGetLocationsPublicQuery,
  useGetIconicPhotosPublicQuery,
  useGetExperienceByBusinessQuery,
} = ExperienceApi;
export { ExperienceApi };
