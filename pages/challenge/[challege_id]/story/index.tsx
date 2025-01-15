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
    MenuItem
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
    useGetLocationsQuery 
} from "@/libs/services/user/challenge";
import { baseUrl } from "@/app/constant";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
    weight: '400',
    subsets: ['latin']
});

const StoryPageUI = () => {
    const [locationIndex, setLocationIndex] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { challege_id } = router.query;

    const {data: challengeData} = useGetChallengeQuery({challengeId: challege_id})
    const challengeTitle = challengeData? challengeData?.data?.[0].title : "";

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleShareClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({
        open: false,
        message: "",
        severity: "success",
    });
    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    const handleClick = (id) => {
        setLocationIndex(id);
        setIsOpen(true);
    };
    const {
        data: locationData,
        error: locationError,
        isLoading: isLocationLoading
      } = useGetLocationsQuery({
        challengeId: challege_id
      });
    const { data: userSubmissionData, isLoading: isUserSubmissionLoading } = useGetUserSubmissionsQuery();
    const historyData1 = isUserSubmissionLoading ? [] : userSubmissionData?.data.filter(
        submission => submission.challengeId === challege_id
    ).flatMap(submission => submission.userChallengeSubmission);
    const historyData2 = historyData1 ? historyData1.map(({ index, ...rest }) => ({
        id : index,
        ...rest,
    })) : [];
    const historyData = isLocationLoading ? [] :historyData2.map(itemB => {
        // Find the corresponding item in arrayA based on id
        const matchingItemA = locationData?.data.find(itemA => itemA.id === itemB.locationId);
        
        // Merge the "name" from arrayA into arrayB's item
        return {
          ...itemB,
          title: matchingItemA ? matchingItemA.title : null // Handle cases where no match is found
        };
      });
    
    const [isGenerating, setIsGenerating] = useState(true);
    const [story, setStory] = useState([{"locationId": "", "story": ""}]);
    const hasGeneratedRef = useRef(false);
    useEffect(() => {
        if (historyData2.length > 0 && locationIndex === null) {
            setLocationIndex(historyData2[0].locationId);
        }
        // Only run if historyData is not null and not an empty array
        if (historyData && historyData.length > 0) {
            const generateStory = async () => {
                if (hasGeneratedRef.current) return;
                hasGeneratedRef.current = true;

                try {
                const response = await fetch('/api/python/generating-location-story', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notes: historyData }),
                });

                if (!response.ok) {
                    throw new Error('Story generation failed');
                }

                const data = await response.json();
                setStory(data);
                setIsGenerating(false);
                } catch (error) {
                    console.error('Error generating story:', error);
                    setIsGenerating(false);
                }
            };

            generateStory();
        }
    }, [historyData2, historyData, locationIndex, isGenerating]);

    const historyDataFinal = isGenerating ? [] :historyData.map(itemB => {
        // Find the corresponding item in arrayA based on id
        const matchingItemA = story.find(itemA => itemA.locationId === itemB.locationId);
        
        // Merge the "name" from arrayA into arrayB's item
        return {
          ...itemB,
          story: matchingItemA ? matchingItemA.story : null // Handle cases where no match is found
        };
      });
    
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "rgb(252, 241, 216)",
                p: 2,
                fontSize: '1.2rem',
                alignItems: "center",
                height: "100%"
            }}
        >

            <Box
                position="relative"
                justifyContent="center"
                sx={{
                    display: "inline-flex",
                    borderRadius: 2,
                    backgroundColor: "rgba(255, 220, 171, 0)",
                    p: 4,
                    mb: 3,
                }}
            >
                <Typography
                    variant="h2"
                    sx={{
                        fontSize: { xs: "h5.fontSize", sm: "h4.fontSize", md: "h3.fontSize", lg: "h2.fontSize" },
                        fontFamily: montserrat.style.fontFamily,
                        color: "black",
                        textAlign: "center"
                    }}>
                    {`Your ${challengeTitle||'Travel'} Diaries`}
                </Typography>
            </Box>

            {/* Location Cards Container */}
            <Box display="flex" alignItems="center" justifyContent="center" position="relative" width="80%">

                {/* Stack Image Buttons */}
                <Stack
                    spacing={{ xs: 1, sm: 1, md: 1, lg: 2 }}
                    direction={{ xs: 'column', sm: 'column', md: 'column', lg: 'row' }}
                    useFlexGap
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                        display: "flex",
                        gap: "1rem",
                        scrollBehavior: "smooth",
                        width: "80%",
                        overflowX: "auto",
                        "&::-webkit-scrollbar": { display: "none" }, // Optional: Hide scrollbar
                        pb: 1,
                        flexWrap: 'wrap'
                    }}
                >
                    {historyDataFinal?.map((content, index) => (
                        <CustomButton
                            key={index}
                            content={content}
                            onClick={() => { handleClick(content.locationId) }}
                        />
                    ))}
                </Stack>
            </Box>
            {isGenerating ? (
                <Typography>Loading submissions...</Typography>
            ) : historyDataFinal.length === 0 ? (
                <Typography>No submissions found for this challenge.</Typography>
            ) : (
                <LocationStoryDisplay 
                    content={historyDataFinal.find(item => item.locationId === locationIndex)}
                    open={isOpen}
                    onClose={() => { setIsOpen(false) }}
                />
            )}
            <Fab
                size="small"
                sx={{
                    position: "absolute",
                    top: "12%",
                    right: "2%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(251, 146, 0, 0.2)"
                }}
                onClick={handleShareClick}
            >
                <Share
                    sx={{
                        color: "rgb(0, 0, 0)",
                        "&:hover": {
                            color: "rgb(77, 147, 244)",
                        },
                    }}

                />
            </Fab>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                sx={{
                    
                    justifyContent: "center",
                    alignItems: "center",
                }}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
                slotProps={{
                    paper: {
                      elevation: 0,
                      sx: {
                        borderRadius: 7,
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        backgroundColor: "rgb(255, 255, 255)",
                        ml: 1.6,
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                          width: 32,
                          height: 32,
                          ml: -0.5,
                          mr: 1,
                        },
                        '&::before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          left: "43%",
                          width: 10,
                          height: 10,
                          bgcolor: "rgb(255, 255, 255)",
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                        },
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem sx={{borderRadius: 100}}>
                    <FacebookShareButton
                        url={`${baseUrl + router.asPath}`}
                        quote={`My amazing blog for the ${challengeTitle} trip.`}
                        hashtag={`#${challengeTitle}:\n ${baseUrl + router.asPath}`}
                    >
                        <FacebookIcon size={32} round />
                    </FacebookShareButton>
                </MenuItem>
                <MenuItem sx={{borderRadius: 100}}>
                    <TwitterShareButton 
                        url={`${baseUrl + router.asPath}`}
                        title={`My amazing blog for the ${challengeTitle} trip.`}
                    >
                        <TwitterIcon size={32} round />
                    </TwitterShareButton>
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default StoryPageUI;