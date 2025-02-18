import React, { useState } from "react";
import {
    Box,
    Typography,
    CircularProgress
} from "@mui/material";
import LocationStoryDisplay from "@/app/components/challenge/LocationStoryDisplay";
import { Montserrat } from "next/font/google";
import {
    useUpdateStoryMutation,
    useDeleteStoryMutation
} from "@/libs/services/user/story"


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

export const StoryPage = ({ 
    challengeTitle, 
    story,
    story_id,
    userMediaSubmission,
    isGenerating = false 
}: { 
    challengeTitle: string, 
    story: string,
    story_id: string,
    userMediaSubmission: string[],
    isGenerating?: boolean 
}) => {
    const [updateStory] = useUpdateStoryMutation();
    const [deleteStory] = useDeleteStoryMutation();
    const [isArchived, setIsArchived] = useState<boolean>(false);
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
    const handleSaveChanges = async (updatedStory: string) => {
        const result = await updateStory({
            storyId: story_id,
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
            storyId: story_id,
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
            storyId: story_id,
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
            ) : (
                <LocationStoryDisplay 
                    content={{ 
                        story,
                        userMediaSubmission,
                    }}
                    onSaveChanges={(e)=>handleSaveChanges(e)}
                    onArchive={isArchived? handleReactivate : handleDeleteStory}
                    isArchived={isArchived}
                />
            )}
        </Box>
    );
}