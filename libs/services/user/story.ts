import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/libs/supabase/baseQuery";

interface StoryReq {
    storyId?: string;
    challengeId?: string;
    challengeHistoryId?: string;
    payload?: {
        challengeId?: string;
        challengeHistoryId?: string;
        userNotes?: string;
        storyFull?: string;
        mediaSubmitted?: string;
        status?: string;
        locations?: string;
        tourSchedule?: string;
        storyLength?: number;
    }
}

interface StoryRes {
    data?: {
        id?: string;
        status?: string;
        createAt?: string;
        userId?: string;
        challengeId?: string;
        challengeHistoryId?: string;
        userNotes?: string;
        storyFull?: string;
        mediaSubmitted?: string;
    }
    error?: any;
}

const StoryApi = createApi({
    reducerPath: "story",
    baseQuery,
    endpoints: (builder) => ({
        generateStory: builder.mutation<any, StoryReq>({
            query: ({ payload }) => ({
              url: `/story/generate`,
              method: "POST",
              body: {
                schedule: payload?.tourSchedule,
                locations: payload?.locations,
                notes: payload?.userNotes,
                story_length: payload?.storyLength
              }
            })
          }),

        uploadStory: builder.mutation<any, any>({
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
        }),
      
        getAllStory: builder.query<any, any>({
            query: ({}) => ({
              url: `/story`,
            })
        }),
        //--------------------UPDATE A STORY-------------------
        updateStory: builder.mutation<StoryRes, StoryReq>({
            query: ({ storyId, challengeHistoryId, payload }) => ({
                url: `story`,
                params: {story_id: storyId, submission_id: challengeHistoryId},
                method: 'PUT',
                body: payload
            })
        }),
        //--------------------DELETE A STORY-------------------
        deleteStory: builder.mutation<StoryRes, StoryReq>({
            query: ({ storyId, challengeHistoryId }) => ({
                url: `story`,
                params: {story_id: storyId, submission_id: challengeHistoryId},
                method: 'DELETE',
            })
        })
    })
});

export const {
    useGenerateStoryMutation,
    useUploadStoryMutation,
    useGetStoryQuery,
    useGetAllStoryQuery,
    useUpdateStoryMutation,
    useDeleteStoryMutation
} = StoryApi;

export { StoryApi };
