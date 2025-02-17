import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/libs/supabase/baseQuery";
import { supabase } from "../../supabase/supabase_client";
import { imgToDB, upsertNewRow } from "../utils";

interface LocationReq {
  challengeId: string;
  payload: {
    title: string;
    backgroundImages: string[] | null;
    sections: {
      title: string;
      instruction: string;
      media: string[] | null;
    }[];
  }
}

interface LocationRes {
  data?: any;
  error?: any;
}

const LocationApi = createApi({
  reducerPath: "createLocation",
  baseQuery,
  endpoints: (builder) => ({
    getAllLocations: builder.query<any, void>({
      query: () =>({
        url: `/location`
      }),
    }),
    getLocationsByChallengeId: builder.query<any, string>({
      query: (challengeId) => ({
        url: `/location`,
        params: { challengeId: challengeId }
      })
    }),

    createLocation: builder.mutation<LocationRes, LocationReq>({
      query: ({ challengeId, payload }) => ({
        url: `/location`,
        method: "POST",
        params: { challengeId: challengeId },
        body: payload,
      }),
    }),

    updateLocation: builder.mutation<LocationRes, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/location`,
        method: "PUT",
        param: { locationId: id },
        body: data
      }),
    }),

    deleteLocation: builder.mutation<any, {id: string}>({
      query: ({ id }) => ({
        url: `location`,
        params: { locationId: id },
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetLocationsByChallengeIdQuery,
  useCreateLocationMutation,
  useGetAllLocationsQuery, 
  useUpdateLocationMutation,
  useDeleteLocationMutation,
} = LocationApi;
export { LocationApi };
