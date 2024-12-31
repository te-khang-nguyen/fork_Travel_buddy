import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "../../supabase/supabase_client";
import {
  upsertNewRow,
  getDataByField,
  getRowById,
  uploadToStorage,
  base64toBinary,
  //uploadToStorageResummable,
} from "../../services/utils";

// Define TypeScript interfaces for the request and response data
interface ChallengeReq {
  entity?: string;
  challengeId?: string | string[];
  locationId?: string;
  title?: string;
  thumbnailurl?: string;
  backgroundurl?: string;
  challenge_title?: string;
  status?: string;
  value?: string | null;
  userLocationSubmission?:
    | {
        userQuestionSubmission?: string;
        userMediaSubmission?: (string | undefined)[] | null;
      }[]
    | any;
}

interface ChallengeRes {
  data?: any;
  error?: any;
}

const JoinChallengeApi = createApi({
  reducerPath: "joinchallenge",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    // ------------------QUERY CHALLENGE--------------------------
    getChallenge: builder.query<ChallengeRes, ChallengeReq>({
      queryFn: async ({ challengeId }) => {
        try {
          let challengeQuery;

          challengeQuery = {
            entity: "challenges",
            searchField: !challengeId ? "price" : "id",
            value: !challengeId ? 0 : challengeId,
          };

          const { data: queryData, error: queryError } = await getDataByField(
            challengeQuery
          );

          if (queryError) {
            return { error: { data: queryError } };
          }

          return { data: { data: queryData } };
        } catch (err: any) {
          return { error: { data: (err as Error).message } };
        }
      },
    }),

    // ------------------QUERY LOCATIONS--------------------------
    getLocations: builder.query<ChallengeRes, ChallengeReq>({
      queryFn: async ({ challengeId }) => {
        try {
          let locationReq = {
            entity: "locations",
            searchField: "challengeid",
            value: challengeId,
          };

          const { data: locationData, error: locationError } =
            await getDataByField(locationReq);

          if (locationError) {
            return { error: { data: locationError } };
          }

          return {
            data: {
              data: locationData,
            },
          };
        } catch (err) {
          return { error: { data: (err as Error).message } };
        }
      },
    }),

    // ------------------QUERY CHALLENGE HISTORY--------------------------
    getUserSubmissions: builder.query<ChallengeRes, void>({
      queryFn: async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        try {
          let challengeQuery;

          challengeQuery = {
            entity: "challengeHistories",
            searchField: "userId",
            value: user!.id,
          };

          const { data: queryData, error: queryError } = await getDataByField(
            challengeQuery
          );

          if (queryError) {
            return { error: { data: queryError } };
          }

          return { data: { data: queryData } };
        } catch (err: any) {
          return { error: { data: (err as Error).message } };
        }
      },
    }),

    //  ----------------CREATE CHALLENGE MODULE---------------------------------
    joinChallenge: builder.mutation<ChallengeRes, ChallengeReq>({
      queryFn: async ({ challengeId, title }) => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        try {
          const newHistoryData = {
            entity: "challengeHistories",
            challengeId: challengeId,
            challengeTitle: title,
            userId: user!.id,
            userChallengeSubmission: [],
          };

          const { data: uploadRessponse, error: uploadError } =
            await upsertNewRow(newHistoryData);

          if (uploadError) {
            return { error: { data: uploadError.error } };
          } else {
            return { data: { data: uploadRessponse.data } };
          }
        } catch (error) {
          return { error: { data: (error as Error).message } };
        }
      },
    }),

    //  ----------------UPDATE CHALLENGE MODULE--------------------------------
    uploadInputs: builder.mutation<ChallengeRes, ChallengeReq>({
      queryFn: async ({ challengeId, userLocationSubmission }) => {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        try {
          for (const [ii, items] of userLocationSubmission.entries()) {
            let imgUrls: (string | undefined)[] | null = [];

            if (items?.userMediaSubmission) {
              for (const [jj, item] of items.userMediaSubmission.entries()) {
                const bytesArray =
                  typeof item === "string" ? base64toBinary(item) : item;
                const toStorageUpload = {
                  bucket: "challenge",
                  title: `${challengeId}id=${jj}`,
                  location: `userSubmit${jj}`,
                  data: bytesArray,
                };

                try {
                  const storageURL = await uploadToStorage(toStorageUpload);
                  imgUrls.push(storageURL.data);
                } catch (error) {
                  console.error(
                    `Error uploading to storage for item ${jj}:`,
                    error
                  );
                  imgUrls.push(undefined); // Add undefined if upload fails
                }
              }
            } else {
              imgUrls = null;
            }

            // Update userMediaSubmission for the current item
            userLocationSubmission[ii].userMediaSubmission = imgUrls;
          }

          try {
            const { data: historyData, error: historyError } =
              await await supabase
                .from("challengeHistories")
                .select()
                .eq("challengeId", challengeId)
                .eq("userId", user!.id)
                .single();

            const oldSubmissions = historyData?.userChallengeSubmission || [];



            const mergedSubmissions = [
              ...userLocationSubmission,
              ...oldSubmissions.filter(
                (oldItem) =>
                  !userLocationSubmission.some(
                    (newItem) => newItem.locationId === oldItem.locationId
                  )
              ),
            ];

            const insertData = {
              challengeId: challengeId,
              userId: user!.id,
              userChallengeSubmission: mergedSubmissions,

              ...(historyData ? { id: historyData.id } : {}),
            };

            const { data: updateData, error: updateError } = await upsertNewRow(
              { entity: "challengeHistories", ...insertData }
            );

            if (updateError) {
              console.log("After Submission with ERr:", updateError);
              return { error: { data: updateError } };
            } else {
              console.log("After Submission with Data:", updateData);
              return { data: { data: updateData } };
            }
          } catch (err: any) {
            return { error: { data: (err as Error).message } };
          }
        } catch (err: any) {
          return { error: { data: (err as Error).message } };
        }
      },
    }),

    getProgress: builder.query<ChallengeRes, ChallengeReq>({
      queryFn: async ({ challengeId }) => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        let challengeQuery;

        try {
          challengeQuery = {
            entity: "challengeHistories",
            searchField: ["challengeId", "userId"],
            value: [challengeId, user!.id],
          };

          const queryData = await getDataByField(challengeQuery, true);
          if (queryData.error) {
            return { error: queryData.error };
          }
          return { data: queryData.data };
        } catch (error) {
          return { error: error };
        }
      },
    }),
  }),
});

export const {
  useGetChallengeQuery,
  useGetLocationsQuery,
  useGetUserSubmissionsQuery,
  useJoinChallengeMutation,
  useUploadInputsMutation,
  useGetProgressQuery,
} = JoinChallengeApi;
export { JoinChallengeApi };
