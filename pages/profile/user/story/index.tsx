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
import Image from 'next/image';
import ImageCarousel from "@/app/components/challenge/ImageCarousel";
import StatusChip from "@/app/components/challenge/StatusChip";
import { formatDate } from "@/app/utils/date";

const StoryTable = ({ stories }) => {
    const router = useRouter();

    const tableHeaders = [
        { key: 'date', label: 'Date' },
        { key: 'challengeName', label: 'Challenge Name' },
        { key: 'story', label: 'Story' },
        { key: 'media', label: 'Media' },
        { key: 'status', label: 'Status' }
    ];
        

    // If no stories, return a message
    if (!stories || stories.length === 0) {
        return (
            <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
                No stories found
            </Typography>
        );
    }

    const sortedStories = [...stories].sort((a, b) => {
        // First, sort by status (ASC)
        const statusComparison = a.status.localeCompare(b.status);
        if (statusComparison !== 0) return statusComparison;
        
        // If statuses are the same, sort by createdAt (DESC)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return (
        <TableContainer sx={{ 
            maxHeight: 'calc(100vh - 100px)', 
            overflowY: 'auto',
        }}>
            <Table>
                <TableHead>
                    <TableRow>
                        {tableHeaders.map((header) => (
                            <TableCell key={header.key}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                    {header.label}
                                </Typography>
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedStories.map((story) => (
                        <TableRow 
                            key={story.id} 
                            hover 
                        >
                            <TableCell>
                                <Typography variant="body2">
                                    {formatDate(story.createdAt)}
                                </Typography>
                            </TableCell>
                            <TableCell
                                sx={{ cursor: 'pointer' }}
                                onClick={() => router.push(`/profile/user/story/${story.id}`)}
                            >
                                <Typography variant="body2">
                                    {story.challenges.title}
                                </Typography>
                            </TableCell>
                            <TableCell
                                sx={{ cursor: 'pointer' }}
                                onClick={() => router.push(`/profile/user/story/${story.id}`)}
                            >
                                <Typography variant="body2" sx={{ maxWidth: 400 }}>
                                    {story.storyFull}
                                </Typography>
                            </TableCell>
                            <TableCell sx={{ maxWidth: 500 }}>
                                <ImageCarousel height={200} images={story.mediaSubmitted} />
                            </TableCell>
                            <TableCell>
                                <StatusChip status={story.status} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

const StoryPageUI = () => {
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