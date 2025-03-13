import React, { useState, useRef, useEffect, useMemo } from "react";
import {
    Box,
    Typography,
    Card,
    CircularProgress
} from "@mui/material";
import { useRouter } from "next/router";

import {
    useGetStoryQuery
} from "@/libs/services/user/story";

import { StoryPage } from "@/app/components/story/StoryPage";

const StoryPageUI = () => {
    const router = useRouter();
    const { story_id } = router.query;
    const { 
        data: story, 
        error, 
        isLoading 
    } = useGetStoryQuery({
        storyId: story_id as string
    });

    // Handle loading state
    if (isLoading) {
        return (
            <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                height="100vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    // Handle error state
    if (error) {
        return (
            <Box>
                <Typography color="error">Error loading story</Typography>
            </Box>
        );
    }

    // Handle no data state
    if (!story || !story.data || !story.data.story_content) {
        return (
            <Box>
                <Card>No story data available</Card>
            </Box>
        );
    }

    // Render story page when data is available
    return (
        <StoryPage 
            storyId={Array.isArray(story_id) ? story_id[0] : story_id || ''}
            title={story.data.seo_title_tag ?? ''} 
            story={story.data.story_content}
            media={story.data.media_assets?.map((item)=>item.url) ?? []}
            destination={story.data.experiences?.name ?? ""}
            channelType={story.data.channels?.channel_type ?? ""}
        />
    );
}

export default StoryPageUI;