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
import LocationStoryDisplay from "@/app/components/challenge/LocationStoryDisplay";
import {
    useGetChallengeQuery,
    useGetUserSubmissionsQuery,
    useGetLocationsQuery,
    useGenerateStoryMutation
} from "@/libs/services/user/challenge";
import {
    useUpdateStoryMutation,
    useDeleteStoryMutation
} from "@/libs/services/user/story"
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
    const router = useRouter();
    const { challege_id, challengeHistoryId } = router.query;

    const [updateStory] = useUpdateStoryMutation();
    const [deleteStory] = useDeleteStoryMutation();

    const [locationIndex, setLocationIndex] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isArchived, setIsArchived] = useState<boolean>(false);

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
    const { 
        data: userSubmissionData, 
        isLoading: isUserSubmissionLoading 
    } = useGetUserSubmissionsQuery();

    const matchedSubmission = userSubmissionData?.data?.find(
        submission => submission.challengeId === challege_id
    );

    const historyData1 = isUserSubmissionLoading ? [] : 
                        matchedSubmission?.userChallengeSubmission

    const historyData2 = historyData1 ? historyData1.map(({ index, ...rest }) => ({
        id: index,
        ...rest,
    })) : [];

    const locationDataUnsorted = isLocationLoading ? [] : locationData?.data;
    const locationDataSorted = [...locationDataUnsorted].sort(
        (a,b)=> (Date.parse(a?.created)) - (Date.parse(b?.created)));
    
    const locationTitles = locationDataSorted.map(item => item.title).join("\n");
    
    const matchItem = historyData2.find(itemA => itemA.locationId === undefined);
    const historyData = {
        
        locations: locationTitles,
        notes: matchItem?.userQuestionSubmission,
        userMediaSubmission: matchItem?.userMediaSubmission
    }

    const [isGenerating, setIsGenerating] = useState(true);
    const [story, setStory] = useState([{locationId: '', story: ''}]);
    const [createStory] = useGenerateStoryMutation();
    const hasGeneratedRef = useRef(false);
    useEffect(() => {
        if (historyData2.length > 0 && locationIndex === null) {
            setLocationIndex(historyData2[0].locationId);
        }
        // Only run if historyData is not null
        if (historyData.locations 
            && historyData.notes 
            && historyData.userMediaSubmission 
            && tourSchedule !== "") {
            const generateStory = async () => {
                if (hasGeneratedRef.current) return;
                hasGeneratedRef.current = true;

                try {
                    const response = await generateLocationStories(
                        tourSchedule, 
                        historyData
                    );
                    const cleanedOutput = response
                        .replace(/^```json\s*/, '')  // Remove leading ```json
                        .replace(/```\s*$/, '')      // Remove trailing ```
                        .trim();
                    const finalStory = JSON.parse(cleanedOutput).map((item) => item.story).join('\n\n')
                    await createStory({
                        challengeId: challege_id,
                        challengeHistoryId,
                        user_notes: historyData.notes,
                        story: finalStory,
                        media_submitted: historyData.userMediaSubmission,
                    });
                    setStory(JSON.parse(cleanedOutput));
                    setIsGenerating(false);
                } catch (error) {
                    console.error('Error generating story:', error);
                    setIsGenerating(false);
                }
            };

            generateStory();
        }
    }, [historyData2, historyData, locationIndex, isGenerating, tourSchedule]);

    const historyDataFinal = isGenerating ? {} : 
        {
            ...historyData,
            story: story.map((item)=>item.story).join("\n\n") ?? null
        };

    const handleSaveChanges = async (updatedStory: string) => {
        const result = await updateStory({
            storyId: "76a83d09-b1c0-49bc-af09-0bd0f8a0ff3d",
            // challengeHistoryId: matchedSubmission?.id,
            payload: {
                storyFull: updatedStory
            }
        })

        if(result?.error){
            setSnackbar({
                open: true,
                message:
                  "Fail to save the latest changes!",
                severity: "error",
            });
        } else {
            setSnackbar({
                open: true,
                message:
                  "Your story is updated!",
                severity: "success",
            });
        }
    }

    const handleDeleteStory = async () => {
        const result = await deleteStory({
            storyId: "76a83d09-b1c0-49bc-af09-0bd0f8a0ff3d",
            // challengeHistoryId: matchedSubmission?.id
        });

        setIsArchived(true);

        if(result?.error){
            setSnackbar({
                open: true,
                message:
                  `Fail to archive story due to ${result?.error}`,
                severity: "error",
            });
        } else {
            setSnackbar({
                open: true,
                message:
                  "Your story is put to Archive mode and will not be displayed publically!",
                severity: "success",
            });
        }
    };

    const handleReactivate = async () => {
        const result = await updateStory({
            storyId: "76a83d09-b1c0-49bc-af09-0bd0f8a0ff3d",
            // challengeHistoryId: matchedSubmission?.id,
            payload: {
                status: "ACTIVE"
            }
        });

        setIsArchived(false);

        if(result?.error){
            setSnackbar({
                open: true,
                message:
                  "Fail to reactivate your story!",
                severity: "error",
            });
        } else {
            setSnackbar({
                open: true,
                message:
                  `Your story is reactivated! 
                  You can now edit the story and share it!`,
                severity: "success",
            });
        }
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
                
            ) : !historyDataFinal? (
                <Typography>No submissions found for this challenge.</Typography>
            ) : (
                <LocationStoryDisplay
                    content={historyDataFinal}
                    onSaveChanges={(e)=>handleSaveChanges(e)}
                    onArchive={isArchived? handleReactivate : handleDeleteStory}
                    isArchived={isArchived}
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
                disabled={isArchived}
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