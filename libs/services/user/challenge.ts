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
  tagTypes: ['Submission'],
  keepUnusedDataFor: 1,
  endpoints: (builder) => ({
    // ------------------QUERY CHALLENGE BY ID--------------------------
    getChallenge: builder.query<ChallengeRes, ChallengeReq>({
      query: ({ challengeId }) => ({
        url: `/challenge/user`,
        params: {challenge_id: challengeId}
      })
    }),

    // ------------------QUERY ALL AVAILABLE CHALLENGES--------------------------
    getAllChallenges: builder.query<ChallengeRes, void>({
      query: () => ({
        url: `/challenge/user`
      })
    }),

    // ------------------QUERY LOCATIONS--------------------------
    getLocations: builder.query<ChallengeRes, ChallengeReq>({
      query: ({ challengeId }) => ({
          url: `/location`,
          params: {challenge_id: challengeId}
      })
    }),

    // ------------------QUERY CHALLENGE HISTORY--------------------------
    getUserSubmissions: builder.query<ChallengeRes, void>({
      query: () => ({
        url: "/submission",
      }),
      providesTags: ['Submission']
    }),

    //  ----------------UPLOAD USER SUBMISSION DATA--------------------------------
    uploadInputs: builder.mutation<ChallengeRes, ChallengeReq>({
      query: ({ challengeId, userLocationSubmission }) => ({
        url: `/submission`,
        params: {challenge_id: challengeId},
        method: "POST",
        body: {userLocationSubmission}
      }),
    }),

    //  ----------------QUERY USERS' PROGRESS BY CHALLENGE ID--------------------------------
    getProgress: builder.query<ChallengeRes, ChallengeReq>({
      query: ({ challengeId }) => ({
        url: `/submission`,
        params: {challenge_id: challengeId}
      }),
      providesTags: ['Submission']
    }),

    
  }),
});

export const {
  useGetChallengeQuery,
  useGetAllChallengesQuery,
  useGetLocationsQuery,
  useGetUserSubmissionsQuery,
  useUploadInputsMutation,
  useGetProgressQuery,
} = JoinChallengeApi;
export { JoinChallengeApi };
