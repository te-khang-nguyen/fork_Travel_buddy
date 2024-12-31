import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "../../supabase/supabase_client";
import { imgToDB, upsertNewRow } from "../utils";

interface LocationReq {
  challengeId: string;
  title: string;
  backgroundImages: string[] | null;
  sections: {
    title: string;
    instruction: string;
    media: string[] | null;
  }[];
}

interface LocationRes {
  data?: any;
  error?: any;
}

const LocationApi = createApi({
  reducerPath: "createLocation",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getAllLocations: builder.query<any, void>({
      queryFn: async () => {
        try {
          const { data, error } = await supabase.from("locations").select("*");

          if (error) {
            return { error: { error } };
          }

          return { data };
        } catch (error) {
          return { error };
        }
      },
    }),
    getLocationsByChallengeId: builder.query<any, string>({
      queryFn: async (challengeId) => {
        try {
          const { data, error } = await supabase
            .from("locations")
            .select("*")
            .eq("challengeid", challengeId);

          if (error) {
            return { error: { error } };
          }

          return { data };
        } catch (error) {
          return { error };
        }
      },
    }),
    
    createLocation: builder.mutation<LocationRes, LocationReq>({
      queryFn: async ({ challengeId, title, backgroundImages, sections }) => {
        try {
          const { data, error } = await supabase.from("locations").insert([
            {
              challengeid: challengeId,
              title,
              imageurls: [
                backgroundImages
                  ? await imgToDB(backgroundImages[0], title)
                  : null,
              ],
              location_info: await Promise.all(
                sections.map(async (section) => ({
                  title: section.title,
                  instruction: section.instruction,
                  media: section.media
                    ? await Promise.all(section.media.map(imgToDB))
                    : null,
                }))
              ),
            },
          ]);

          if (error) {
            return { error: { error } };
          }

          return { data: { data } };
        } catch (error) {
          return { error };
        }
      },
    }),
    updateLocation: builder.mutation<LocationRes, { id: string; data: any }>({
      queryFn: async ({ id, data }) => {
        try {
          const result = await upsertNewRow({ entity: "locations", id, ...data });
          if (result.error) {
            return { error: result.error };
          }
          return { data: result.data };
        } catch (error) {
          return { error };
        }
      },
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
