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
    useGetLocationsQuery
} from "@/libs/services/user/challenge";
import { baseUrl } from "@/app/constant";
import { Montserrat } from "next/font/google";
import { generateLocationStories } from "@/libs/services/storyGen";

const montserrat = Montserrat({
    weight: '400',
    subsets: ['latin']
});

function GradientCircularProgress() {
    return (
      <React.Fragment>
        <svg width={0} height={0}>
          <defs>
            <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e01cd5" />
              <stop offset="100%" stopColor="#1CB5E0" />
            </linearGradient>
          </defs>
        </svg>
        <CircularProgress
            size="2rem"
            sx={{ 
                'svg circle': { stroke: 'url(#my_gradient)' },
                size: {xs:"30px", sm: "30px", md: "70px", lg: "100px"},
                mb:10,
            }} 
        />
      </React.Fragment>
    );
  }

const StoryPageUI = () => {
    const [locationIndex, setLocationIndex] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { challege_id } = router.query;

    const { data: challengeData } = useGetChallengeQuery({ challengeId: challege_id })
    const challengeTitle = challengeData ? challengeData?.data?.[0].title : "";
    const tourSchedule = challengeData ? challengeData?.data?.[0].tourSchedule : "";

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
        id: index,
        ...rest,
    })) : [];

    const locationDataUnsorted = isLocationLoading ? [] : locationData?.data;
    const locationDataSorted = [...locationDataUnsorted].sort((a,b)=> (Date.parse(a?.created)) - (Date.parse(b?.created)));
    
    const historyData = locationDataSorted.map(itemB => {
        // Find the corresponding item in arrayA based on id
        const matchingItemA = historyData2.find(itemA => itemA.locationId === itemB.id);

        // Merge the "name" from arrayA into arrayB's item
        return {
            ...matchingItemA,
            title: matchingItemA ? itemB.title : null // Handle cases where no match is found
        };
    });

    const [isGenerating, setIsGenerating] = useState(true);
    const [story, setStory] = useState([{ locationId: "", story: "" }]);
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
                    const tourSchedule = `
                Hanoi Vespa Food Tour Itinerary
                8:30 AM: Hotel pick-up. Your guide arrives on a vintage Vespa to start your culinary journey through Hanoi’s vibrant streets. Brief introduction and safety instructions before departing.
                9:00 AM: Pho Ba Muoi on Hang Bai Street. There will be Pho Bo (beef pho) and Pho Ga (chicken pho). Pho Ga will is light-hearted, while Pho Bo is more savory. Guests can enjoy the hot bowl of pho, drink one cup of tea, and soak in the morning atmosphere of Hanoi.
                10:30 AM: Bun Cha Huong Lien. Famed for being Obama's lunch spot with Anthony Bourdain when he visited Hanoi for a business trip. Relish a plate of Hanoi's iconic Bun Cha with grilled pork patties, fresh vermicelli, and dipping sauce at a family-run restaurant.
                12:00 PM: Hotel drop-off. Return safely to your hotel with a heart full of memories and a belly full of Hanoi's finest flavors.
                `

                    const response = await generateLocationStories(tourSchedule, historyData);
                    const cleanedOutput = response
                        .replace(/^```json\s*/, '')  // Remove leading ```json
                        .replace(/```\s*$/, '')      // Remove trailing ```
                        .trim();
                    setStory(cleanedOutput);
                    setIsGenerating(false);
                } catch (error) {
                    console.error('Error generating story:', error);
                    setIsGenerating(false);
                }
            };

            generateStory();
        }
    }, [historyData2, historyData, locationIndex, isGenerating, tourSchedule]);

    const historyDataFinal = isGenerating ? [] : historyData.map(itemB => {
        // Find the corresponding item in arrayA based on id
        const storyArray = JSON.parse(story as any);

        const matchingItemA = storyArray?.find(itemA => itemA.locationId === itemB.locationId);

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
                backgroundRepeat: "repeat",
                p: 2,
                fontSize: '1.2rem',
                alignItems: "center",
                height: "100%",
                overflow:"auto"
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
                    {`My ${challengeTitle || 'Travel'} Diaries`}
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
                <Box
                    display='flex'
                    flexDirection='row'
                    gap={2}
                >
                    {GradientCircularProgress()}
                    <Typography
                        variant='h5'
                        sx={{
                            fontSize: { xs: "body1.fontSize", sm: "h6.fontSize", md: "h5.fontSize", lg: "h5.fontSize" },
                            fontFamily: montserrat.style.fontFamily,
                            color: "black",
                            textAlign: "center"
                        }}
                    >
                        Loading submissions...
                    </Typography>
                </Box>
                
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
                <MenuItem sx={{ borderRadius: 100 }}>
                    <FacebookShareButton
                        url={`${baseUrl + router.asPath}`}
                        quote={`My amazing blog for the ${challengeTitle} trip.`}
                        hashtag={`#${challengeTitle}:\n ${baseUrl + router.asPath}`}
                    >
                        <FacebookIcon size={32} round />
                    </FacebookShareButton>
                </MenuItem>
                <MenuItem sx={{ borderRadius: 100 }}>
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