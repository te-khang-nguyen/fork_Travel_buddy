import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/libs/supabase/baseQuery";

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
  token?: string | null;
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
  baseQuery,
  endpoints: (builder) => ({
    // ------------------QUERY CHALLENGE--------------------------
    getChallenge: builder.query<ChallengeRes, ChallengeReq>({
      query: ({ challengeId }) => ({
        url: `/challenge/user/get-challenge`,
        params: {challengeId: challengeId? challengeId : undefined}
      })
    }),

    // ------------------QUERY LOCATIONS--------------------------
    getLocations: builder.query<ChallengeRes, ChallengeReq>({
      query: ({ challengeId }) => ({
          url: `/challenge/user/get-locations`,
          params: {challengeId: challengeId}
        })
    }),

    // ------------------QUERY CHALLENGE HISTORY--------------------------
    getUserSubmissions: builder.query<ChallengeRes, void>({
      query: () => ({
        url: "/challenge/user/get-user-submissions",
      })
    }),

    //  ----------------UPLOAD USER SUBMISSION DATA--------------------------------
    uploadInputs: builder.mutation<ChallengeRes, ChallengeReq>({
      query: ({ challengeId, userLocationSubmission }) => ({
        url: `/challenge/user/upload-user-submission`,
        method: "POST",
        body: JSON.stringify({challengeId: challengeId, userLocationSubmission: userLocationSubmission})
      }),
    }),

    //  ----------------QUERY USERS' PROGRESS BY CHALLENGE ID--------------------------------
    getProgress: builder.query<ChallengeRes, ChallengeReq>({
      query: ({ challengeId }) => ({
        url: `/challenge/user/get-user-progress`,
        params: {challengeId: challengeId}
      })
    }),
  }),
});

export const {
  useGetChallengeQuery,
  useGetLocationsQuery,
  useGetUserSubmissionsQuery,
  useUploadInputsMutation,
  useGetProgressQuery,
} = JoinChallengeApi;
export { JoinChallengeApi };
