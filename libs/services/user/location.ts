import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/libs/supabase/baseQuery";
import { Location } from "../user/experience";

interface GetLocationResponse {
    data: {
        locations : Location;
    }[];
}

const LocationUserApi = createApi({
  reducerPath: "getLocation",
  baseQuery,
  endpoints: (builder) => ({
    getLocationsInExperience: builder.query<Location[], { experience_id: string }>({
      query: ({ experience_id }) => ({
        url: `/locations/experience`,
        params: {"experience-id": experience_id},
        method: "GET",
      }),
      transformResponse: (response: GetLocationResponse): Location[] =>
        response.data.map((item) => item.locations),
    }),
  }),
});

export const { 
  useGetLocationsInExperienceQuery,
} = LocationUserApi;
export { LocationUserApi };
