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
    TextField,
    Button,
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
import LocationStoryDisplay from "@/app/components/story/LocationStoryDisplay";
import {
    useGetChallengeQuery,
    useGetProgressQuery,
    useGetLocationsQuery,
} from "@/libs/services/user/challenge";

import {
    useGenerateStoryMutation,
    useUploadStoryMutation,
} from "@/libs/services/user/story";

import { baseUrl } from "@/app/constant";
import { Montserrat } from "next/font/google";

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
    // store.dispatch(JoinChallengeApi.util.resetApiState());
    const router = useRouter();
    const [generateStoryApi] = useGenerateStoryMutation();
    const [createStory] = useUploadStoryMutation();

    const { challege_id, challengeHistoryId } = router.query;
    const [isGenerating, setIsGenerating] = useState(true);
    const hasGeneratedRef = useRef(false);
    // const [locationIndex, setLocationIndex] = useState(null);
    // const [isOpen, setIsOpen] = useState(false);
    const [storyId,  setStoryId] = useState<string>('');
    const [historyData, setHistoryData] = useState<any>();
    const [challengeTitle, setChallengeTitle] = useState<string>('');
    const [tourSchedule, setTourSchedule] = useState<string>('');


    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [open, setOpen] = useState<boolean>(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({
        open: false,
        message: "",
        severity: "success",
    });


    const { 
        data: challengeData, 
    } = useGetChallengeQuery({ 
        challengeId: challege_id 
    });

    const {
        data: locationData,
        isLoading: isLocationLoading,
    } = useGetLocationsQuery({
        challengeId: challege_id
    });

    const { 
        data: userSubmissionData, 
        isLoading: isUserSubmissionLoading,
        refetch: submissionRefetch
    } = useGetProgressQuery({
        challengeId: challege_id
    });
    
    useEffect(() => {
        if(challengeData && challengeData?.data){
            setChallengeTitle(challengeData?.data?.[0]?.title);
            setTourSchedule(challengeData?.data?.[0]?.tourSchedule);
        }
    }, [challengeData, challengeData?.data]);
    

    useEffect(() => {
        // Only run if historyData is not null
        submissionRefetch();
        if (userSubmissionData?.data 
            && locationData?.data
            && tourSchedule !== "") {

            const locationDataUnsorted = locationData?.data;
            const locationDataSorted = [...locationDataUnsorted].sort(
                (a,b)=> (Date.parse(a?.created)) - (Date.parse(b?.created)));
        
            const locationTitles = locationDataSorted.map(item => item.title).join("\n");
        
            const submittedData = userSubmissionData?.data?.[0]?.userChallengeSubmission;
    
            const matchItem = submittedData?.find(itemA => 
                itemA.locationId === undefined
            );

            const generateStory = async () => {
                if (hasGeneratedRef.current) return;
                hasGeneratedRef.current = true;
                try {
                    const { data: generatedStory } = await generateStoryApi({
                        payload: { 
                            notes: matchItem?.userQuestionSubmission,
                            attractions: locationTitles,
                        }
                    });

                    if(generatedStory){
                        const finalStory = generatedStory?.data?.replace(/\*/g,'');
                        const {
                            data: newStoryData
                        } = await createStory({
                            destinationId: challege_id as string,
                            payload: {
                                notes: matchItem?.userQuestionSubmission,
                                story_content: finalStory,
                                media: matchItem?.userMediaSubmission,
                            }
                        });
    
                        setIsGenerating(false);
                        setStoryId(newStoryData?.data?.id as string);
                        setHistoryData({
                            locations: locationTitles,
                            notes: matchItem?.userQuestionSubmission,
                            userMediaSubmission: matchItem?.userMediaSubmission,
                            story: finalStory
                        });
                    }
                    
                } catch (error) {
                    console.error('Error generating story:', error);
                    setIsGenerating(false);
                }
            };

            generateStory();
        }
    }, [JSON.stringify(locationData?.data), JSON.stringify(userSubmissionData?.data)]);


    const handleShareClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setOpen(true);
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
        setOpen(false);
    };

    const handleCloseSnackbar = () => setSnackbar({ 
        ...snackbar, 
        open: false 
    });

    // const handleClick = (id) => {
    //     setLocationIndex(id);
    //     setIsOpen(true);
    // };

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
                        fontSize: { 
                            xs: "h5.fontSize", 
                            sm: "h4.fontSize", 
                            md: "h3.fontSize", 
                            lg: "h2.fontSize" 
                        },
                        fontFamily: montserrat.style.fontFamily,
                        color: "black",
                        textAlign: "center",
                    }}>
                    {`My ${challengeTitle || 'Travel'} Diaries`}
                </Typography>
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
                
            ) : !historyData? (
                <Typography>No submissions found for this challenge.</Typography>
            ) : (
                <LocationStoryDisplay
                    content={historyData}
                    onTrigger={()=>{router.push(`/profile/user/story/${storyId}`)}}
                />
            )}

            {/* Sharing To Social Channels*/ }

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
                disabled={true}
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
            

            <Snackbar
                open={snackbar.open}
                autoHideDuration={20000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default StoryPageUI;