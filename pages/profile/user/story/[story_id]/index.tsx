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

import { StoryPage } from "@/app/components/challenge/StoryPage";

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
    if (!story || !story.data || !story.data.storyFull) {
        return (
            <Box>
                <Card>No story data available</Card>
            </Box>
        );
    }

    // Render story page when data is available
    return (
        <StoryPage 
            story_id={Array.isArray(story_id) ? story_id[0] : story_id || ''}
            title={story.data.title ?? ''} 
            story={story.data.storyFull}
            userMediaSubmission={story.data.mediaSubmitted ?? []}
        />
    );
}

export default StoryPageUI;