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
      })
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
      })
    }),

    generateStory: builder.mutation<any, any>({
      query: ({ challengeId, challengeHistoryId, user_notes, story, media_submitted }) => ({
        url: `/story`,
        method: "POST",
        params: { challengeId, challengeHistoryId },
        body: {
          user_notes,
          story,
          media_submitted,
        }
      })
    }),

    getStory: builder.query<any, any>({
      query: ({ story_id }) => ({
        url: `/story`,
        method: "GET",
        params: { story_id }
      })
    })
  }),
});

export const {
  useGetChallengeQuery,
  useGetAllChallengesQuery,
  useGetLocationsQuery,
  useGetUserSubmissionsQuery,
  useUploadInputsMutation,
  useGetProgressQuery,
  useGenerateStoryMutation,
  useGetStoryQuery,
} = JoinChallengeApi;
export { JoinChallengeApi };
