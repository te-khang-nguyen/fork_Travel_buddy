import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "@/libs/supabase/baseQuery";

export interface StoryReq {
    storyId?: string;
    destinationId?: string;
    payload?: {
        destination_id?: string;
        channel_id?: string;
        title?: string;
        notes?: string;
        story_content?: string;
        media?: string[];
        status?: string;
        attractions?: string;
        tourSchedule?: string;
        storyLength?: number;
        brandVoice?: string;
        channelType?: string;
        seo_title_tag?: string;
        seo_meta_desc?: string;
        seo_excerpt?: string;
        seo_slug?: string;
        long_tail_keyword?: string;
        hashtags?: string[];
    }
}

export interface StoryProps {
  id?: string;
  status?: string;
  title?: string;
  created_at?: string;
  user_id?: string;
  destination_id?: string;
  channel_id?: string;
  notes?: string;
  story_content?: string;
  media_assets?: {url:string}[];
  seo_title_tag?: string;
  seo_meta_desc?: string;
  seo_excerpt?: string;
  seo_slug?: string;
  long_tail_keyword?: string;
  hashtags?: string[];
  destinations?: {
    name?: string;
  };
  channels?: {
    channel_type: string;
    name?: string;
  }
}

export interface StoryRes {
  data?: StoryProps[];
  error?: any;
}

export interface StorySingleRes {
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
                notes: payload?.notes,
                brand_voice: payload?.brandVoice,
                story_length: payload?.storyLength,
                channel_type: payload?.channelType,
              }
            })
          }),

        uploadStory: builder.mutation<StorySingleRes, StoryReq>({
            query: ({ payload }) => ({
              url: `/story`,
              method: "POST",
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

        getAllPublishedStory: builder.query<StoryRes, void>({
          query: () => ({
            url: `/story/public/`,
          })
        }),

        getSinglePublishedStory: builder.query<StorySingleRes, StoryReq>({
          query: ({ storyId }) => ({
            url: `/story/public`,
            method: "GET",
            params: { "story-id": storyId }
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
    useDeleteStoryMutation,
    useGetAllPublishedStoryQuery,
    useGetSinglePublishedStoryQuery,
} = StoryApi;

export { StoryApi };
