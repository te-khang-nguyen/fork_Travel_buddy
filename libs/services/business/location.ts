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
        url: `/location/get-all-locations`
      }),
    }),
    getLocationsByChallengeId: builder.query<any, string>({
      query: (challengeId) => ({
        url: `/challenge/user/get-locations`,
        params: { challengeId: challengeId }
      })
    }),

    createLocation: builder.mutation<LocationRes, LocationReq>({
      query: ({ challengeId, payload }) => ({
        url: `/location/create-location/`,
        method: "POST",
        params: { challengeId: challengeId },
        body: payload,
      }),
    }),

    updateLocation: builder.mutation<LocationRes, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/location/update-location`,
        method: "POST",
        param: { locationId: id },
        body: data
      }),
    }),
  }),
});

export const {
  useGetLocationsByChallengeIdQuery,
  useCreateLocationMutation,
  useGetAllLocationsQuery, 
  useUpdateLocationMutation
} = LocationApi;
export { LocationApi };
