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
    CircularProgress,
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    Chip
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
    useGetAllStoryQuery,
    useGenerateStoryMutation
} from "@/libs/services/user/challenge";
import { baseUrl } from "@/app/constant";
import { Montserrat } from "next/font/google";
import { generateLocationStories } from "@/libs/services/storyGen";
import { StoryPage } from "@/app/components/challenge/StoryPage";


const StoryTable = ({ stories }) => {
    const router = useRouter();

    // If no stories, return a message
    if (!stories || stories.length === 0) {
        return (
            <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
                No stories found
            </Typography>
        );
    }

    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Challenge ID</TableCell>
                        <TableCell>User Notes</TableCell>
                        <TableCell>Media</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {stories.map((story) => (
                        <TableRow 
                            key={story.id} 
                            hover 
                            sx={{ cursor: 'pointer' }}
                            onClick={() => router.push(`/profile/user/story/${story.id}`)}
                        >
                            <TableCell>{story.challengeId}</TableCell>
                            <TableCell>
                                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                    {story.userNotes}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                {story.mediaSubmitted && story.mediaSubmitted.length > 0 ? (
                                    <Typography variant="body2">
                                        {story.mediaSubmitted.length} image(s)
                                    </Typography>
                                ) : (
                                    'No media'
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

const StoryPageUI = () => {
    const router = useRouter();
    const { data: story, error, isLoading } = useGetAllStoryQuery({});
    console.log("Story", story);

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

    // Render story page when data is available
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
                <StoryTable stories={story.data} />
            </Card>
        </Box>
    );
}

export default StoryPageUI;