import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/libs/supabase/baseQuery";

interface StoryReq {
    storyId?: string;
    destinationId?: string;
    payload?: {
        destinationId?: string;
        title?: string;
        userNotes?: string;
        storyFull?: string;
        mediaSubmitted?: string[];
        status?: string;
        attractions?: string;
        tourSchedule?: string;
        storyLength?: number;
    }
}

interface StoryProps {
  id?: string;
  status?: string;
  title?: string;
  createdAt?: string;
  userId?: string;
  destinationId?: string;
  challengeHistoryId?: string;
  userNotes?: string;
  storyFull?: string;
  mediaSubmitted?: string[];
  seoTitleTag?: string;
  seoMetaDesc?: string;
  seoSlug?: string;
  longTailKeyWord?: string;
  hashtag?: string;
  destinations?: {
    name?: string;
  };
}

interface StoryRes {
    data?: StoryProps[];
    error?: any;
}

interface StorySingleRes {
  data?: StoryProps;
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
                attractions: payload?.attractions,
                notes: payload?.userNotes,
                story_length: payload?.storyLength
              }
            })
          }),

        uploadStory: builder.mutation<StorySingleRes, StoryReq>({
            query: ({ destinationId, payload }) => ({
              url: `/story`,
              method: "POST",
              params: { destinationId },
              body: payload
            })
          }),
      
        getStory: builder.query<StorySingleRes, StoryReq>({
            query: ({ storyId }) => ({
              url: `/story`,
              method: "GET",
              params: { "story-id": storyId }
            })
        }),
      
        getAllStory: builder.query<StoryRes, void>({
            query: () => ({
              url: `/story`,
            })
        }),
        //--------------------UPDATE A STORY-------------------
        updateStory: builder.mutation<StorySingleRes, StoryReq>({
            query: ({ storyId, payload }) => ({
                url: `story`,
                params: {"story-id": storyId},
                method: 'PUT',
                body: payload
            })
        }),
        //--------------------DELETE A STORY-------------------
        deleteStory: builder.mutation<StorySingleRes, StoryReq>({
            query: ({ storyId }) => ({
                url: `story`,
                params: {"story-id": storyId},
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
