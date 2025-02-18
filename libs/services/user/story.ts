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
    useUpdateStoryMutation,
    useDeleteStoryMutation
} = StoryApi;

export { StoryApi };
