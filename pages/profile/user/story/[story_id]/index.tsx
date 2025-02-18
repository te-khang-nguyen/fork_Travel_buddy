import React, { useState, useRef, useEffect, useMemo } from "react";
import {
    styled,
    Box,
    Typography,
    Card,
    Snackbar,
    Alert,
    Stack,
    Fab,
    Menu,
    MenuItem,
    CircularProgress
} from "@mui/material";
import { Share } from "@mui/icons-material";
import {
    FacebookShareButton,
    FacebookIcon,
    TwitterShareButton,
    TwitterIcon,
} from 'next-share';
import CustomButton from "@/app/components/kits/CustomButton";
import { useRouter } from "next/router";
import LocationStoryDisplay from "@/app/components/challenge/LocationStoryDisplay";
import {    
    useGetChallengeQuery,
    useGetUserSubmissionsQuery,
    useGetLocationsQuery,
    useGetStoryQuery,
    useGenerateStoryMutation
} from "@/libs/services/user/challenge";
import { baseUrl } from "@/app/constant";
import { Montserrat } from "next/font/google";
import { generateLocationStories } from "@/libs/services/storyGen";
import { StoryPage } from "@/app/components/challenge/StoryPage";

const historyDataFinal = {
    "locations": "Cho Ben Thanh\nFront Gate\nPost Office Saigon\nTest Location 2",
    "notes": "Market was crowded\nPost Office trip was hot\nStreet food gives me stomachache but it's ok",
    "userMediaSubmission": [
        "https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/challenge/88c59643-d03e-466b-a64a-2eaba98d75d4/59f3ce3b-79c8-47dd-906b-24034d935dff-ind0/c6cf470ef8dea7320c7e48a3e6ddfac2.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjaGFsbGVuZ2UvODhjNTk2NDMtZDAzZS00NjZiLWE2NGEtMmVhYmE5OGQ3NWQ0LzU5ZjNjZTNiLTc5YzgtNDdkZC05MDZiLTI0MDM0ZDkzNWRmZi1pbmQwL2M2Y2Y0NzBlZjhkZWE3MzIwYzdlNDhhM2U2ZGRmYWMyLmpwZyIsImlhdCI6MTczOTg3MjA1OSwiZXhwIjoxNzcxNDA4MDU5fQ.WCw4dQJzLXllyOkdz3HgAl27FoHr0kL3aT3UEux-u8A",
        "https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/challenge/88c59643-d03e-466b-a64a-2eaba98d75d4/59f3ce3b-79c8-47dd-906b-24034d935dff-ind1/c1c027d36fc6980cfeea48271ae74930.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjaGFsbGVuZ2UvODhjNTk2NDMtZDAzZS00NjZiLWE2NGEtMmVhYmE5OGQ3NWQ0LzU5ZjNjZTNiLTc5YzgtNDdkZC05MDZiLTI0MDM0ZDkzNWRmZi1pbmQxL2MxYzAyN2QzNmZjNjk4MGNmZWVhNDgyNzFhZTc0OTMwLmpwZyIsImlhdCI6MTczOTg3MjA2MCwiZXhwIjoxNzcxNDA4MDYwfQ.zHRBq3-YvfJJW4c0nDlmWOR74_eKBPBpQIRqlgk1h3E"
    ],
    "story": "Cho Ben Thanh bustled with vibrant energy, a vivid kaleidoscope of colors and aromas, and I immersed myself in the chaos. The market was crowded, but every corner was a discovery that enthralled my senses, turning the tangle of shoppers into an exhilarating adventure.\n\nAt the Front Gate, the majestic facade of Post Office Saigon loomed, enhancing the aura of history surrounding us. While the heat was intense, this grand landmark’s charm offered shade, a reminder of timeless architectural beauty amidst the bustling, sunlit city.\n\nTaste-testing street food at Test Location 2 led to a small stomachache, yet each bite was a culinary journey. Despite the brief discomfort, the delightful flavors and cheerful vendors brought a sense of cultural connection, leaving a sweet memory on my palate."
};

const StoryPageUI = () => {
    const router = useRouter();
    const { story_id } = router.query;
    const { data: story, error, isLoading } = useGetStoryQuery({story_id});

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
            challengeTitle={story.data.challengeTitle} 
            story={story.data.storyFull}
            userMediaSubmission={story.data.mediaSubmitted}
        />
    );
}

export default StoryPageUI;