import React, { useState } from "react";
import { useRouter } from "next/router";
import {
    Box,
    Typography,
    CircularProgress,
    Snackbar,
    Alert,
} from "@mui/material";
import LocationStoryDisplay from "@/app/components/story/LocationStoryDisplay";
import { Montserrat } from "next/font/google";
import {
    useUpdateStoryMutation,
    useDeleteStoryMutation
} from "@/libs/services/user/story"
import ShareButton from "../generic-component/ShareButton";
import AlertDialog from "../generic-component/AlertDialogBox";


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
    title, 
    story,
    storyId,
    destination,
    media,
    channelType, 
    isPublic,
    isGenerating = false 
}: { 
    title: string;
    story: string;
    storyId: string;
    destination: string;
    media: string[];
    channelType: string;
    isPublic?: boolean;
    isGenerating?: boolean 
}) => {
    const router = useRouter();
    const [isDialogOpened, setIsDialogOpened] = useState<boolean>(false);
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
    const handleSaveChanges = async (updatedData: {title: string, updatedStory: string}) => {
        const result = await updateStory({
            storyId: storyId,
            payload: {
                seo_title_tag: updatedData.title,
                story_content: updatedData.updatedStory
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

    const handlePublishing = async () => {
        setIsDialogOpened(false);

        const result = await updateStory({
            storyId: storyId,
            payload: {
                status: "PUBLISHED"
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
                  "Your story is now published to the chosen channel!",
                severity: "success",
            });
            
        }
    }

    const handleDeleteStory = async () => {
        const result = await deleteStory({
            storyId: storyId,
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
            storyId: storyId,
            // challengeHistoryId: matchedSubmission?.id,
            payload: {
                status: "DRAFT"
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
                backgroundColor: "rgb(255, 255, 255)",
                backgroundRepeat: "repeat",
                p: 2,
                fontSize: '1.2rem',
                justifyContent: "space-between",
                alignItems: "center",
                // height: "90%",
                maxHeight: "90%",
                overflow:"auto",
            }}
        >

            
            {!isGenerating ?(
                <LocationStoryDisplay 
                    content={{ 
                        story,
                        media,
                        title,
                        destination,
                    }}
                    onSaveChanges={(e)=>handleSaveChanges(e)}
                    onTrigger={isArchived? handleReactivate : handleDeleteStory}
                    onPublished={()=>
                        channelType === "Travel Buddy"? 
                        setIsDialogOpened(true) 
                        : handlePublishing()}
                    isTriggered={isArchived}
                    isPublic={isPublic}
                />
            ) : (
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
            )}

            <ShareButton
                texts={{title: `My ${title || 'Travel'} Diaries`}}
                disabled
            />
            <AlertDialog
                open={isDialogOpened}
                onClose={()=>setIsDialogOpened(false)}
                title="Travel Buddy Website publishing"
                body={`You are publishing your story to our Travel Buddy website.\n
                        If you want to proceed, choose Agree.\n
                        Otherwise, choose Disgree`}
                onAgree={handlePublishing}
            />
            <Snackbar
                open={snackbar.open}
                autoHideDuration={10000}
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
}