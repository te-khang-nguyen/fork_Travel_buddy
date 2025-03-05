import React, { useState, useRef, useEffect, useMemo } from "react";
import {
    styled,
    Box,
    Typography,
    Card,
    CircularProgress,
} from "@mui/material";
import { useRouter } from "next/router";

import {
    useGetAllStoryQuery,
} from "@/libs/services/user/story"
import GenericTable from "@/app/components/generic_components/Table";


const StoryPageUI = () => {
    const router = useRouter();
    const { data: story, error, isLoading } = useGetAllStoryQuery();
    const [ storyData, setStoryData ] = useState<{
        [x: string]: string | number | string[] | undefined
    }[]>([]);

    useEffect(()=>{
        if(story?.data){
            setStoryData(story?.data?.map((item) => ({
                id: item.id,
                createdAt: item.created_at,
                title: item.title,
                text: item.story_content,
                media: item.media_assets?.map((item)=>item.url),
                status: item.status,
            })));
        }
    },[story?.data]);

    const tableHeaders = [
        { key: 'date', label: 'Date' },
        { key: 'challengeName', label: 'Challenge Name' },
        { key: 'story', label: 'Story' },
        { key: 'media', label: 'Media' },
        { key: 'status', label: 'Status' }
    ];

    const handleRowClicks = (storyId: string) => {
        router.push(`/profile/user/story/${storyId}`);
    }

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
    if (!story || !story.data ) {
        return (
            <Box>
                <Card>No story data available</Card>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "rgb(252, 241, 216)",
                backgroundRepeat: "repeat",
                p: 2,
                fontSize: '1.2rem',
                alignItems: "center",
                height: "100%",
                overflow:"auto",
            }}
        >
            <Card>
                <GenericTable 
                    contents={storyData} 
                    headers={tableHeaders}
                    withMedia
                    onRowClick={(e) => handleRowClicks(e ?? '1')}
                />
            </Card>
        </Box>
    );
}

export default StoryPageUI;