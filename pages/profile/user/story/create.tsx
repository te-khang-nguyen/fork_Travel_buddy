import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
    styled,
    Box,
    Container,
    Snackbar,
    Alert,
    Typography,
    useTheme, 
    useMediaQuery,
} from "@mui/material";
import CustomInputsField from "@/app/components/generic-component/UserInputsField";
import {
    useGenerateStoryMutation,
    useUploadStoryMutation,
} from "@/libs/services/user/story";
import { 
    useUploadImageMutation 
} from "@/libs/services/storage/upload";
import MenuDropdown from "@/app/components/generic-component/MenuDropdown";



const CreateStoryUI = () => {
    const router = useRouter();
    const [ uploadStory ] = useUploadStoryMutation();
    const [ generateStory ] = useGenerateStoryMutation();
    const [ uploadImage ] = useUploadImageMutation();
    const [ destinationId, setDestinationId ] = useState<string>("1");
    const [ options, setOptions ] = useState<{
        id: string;
        name: string;
    }[]>([
        {
            id: '1',
            name: 'Select a destination'
        },
        {
            id: '2e656158-8a46-40ea-8dc2-8ce0b027920a',
            name: 'Ho Chi Minh City'
        }
    ]);

    const persistedDesId = sessionStorage.getItem("destinationId");
    // const persistedChoice = sessionStorage.getItem("destinationId");

    useEffect(()=>{
        setDestinationId(persistedDesId ?? "1");
    },[persistedDesId]);

    const [isConfirmClicked, setIsConfirmClicked] = useState<boolean>(false);

    const [snackbar, setSnackbar] = useState<{
            open: boolean;
            message: string;
            severity: "success" | "error";
        }>({
            open: false,
            message: "",
            severity: "success",
        });

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const commonComponentWidth = isMobile? "100%": "60%"

    const attractionsTitles = `
        Crescent Mall\n
        Crescent Lake\n
        Vincom Dong Khoi\n
        Banh Mi Huynh Hoa\n
        Golden Lotus Healing Spa Land
    `

    const handleInputsUpload = async (userInputs) => {
        setIsConfirmClicked(true);
        // getPayLoadSize([userInputs]);
    
        const results = Promise.all(userInputs
          .userMediaSubmission
          .map(async (img, index) => {
          // getPayLoadSize([img]);
          const result = await uploadImage({
            imageBase64: img,
            title: `ind-${index}`,
            bucket: 'challenge',
          });
    
          if (result.error) {
            return false;
          }
    
          if (result.data) {
            return result.data?.signedUrl;
          }
        }));
    
        const storageUrls = await results;
    
        // getPayLoadSize(storageUrls);

        const { data: generatedStory } = await generateStory({
            payload: {
                userNotes: userInputs.userQuestionSubmission,
                attractions: attractionsTitles,
            }
        });

        if(generatedStory?.data) {
            const finalStory = generatedStory?.data?.replace(/\*/g,'');
            const { 
                data: submissionResult
            } = await uploadStory({
                destinationId: destinationId,
                payload: {
                    userNotes: userInputs.userQuestionSubmission,
                    storyFull: finalStory,
                    mediaSubmitted: storageUrls,
                }
            });

            if (submissionResult) {
                setIsConfirmClicked(false);
                  setSnackbar({
                    open: true,
                    message:
                      `Great sharings!\n
                      This chapter will be wonderful!\n
                      Let's keep exploring while we craft your story!`,
                    severity: "success",
                  });
          
                router.push(`/profile/user/story/${submissionResult?.data?.id}`);
                sessionStorage.removeItem("notes");
                sessionStorage.removeItem("destinationId");
          
              } else {
                setIsConfirmClicked(false);
                setSnackbar({
                  open: true,
                  message: "Fail to generate new story!",
                  severity: "error",
                });
              }
        }
    
        
      } 

    const handleCloseSnackbar = () => setSnackbar({ 
        ...snackbar, 
        open: false 
    });

    return (
    <Box
        sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflow: "auto",
            maxHeight: "80vh"
        }}
    >
        <Box
            sx={{
                m:2,
                display:"flex",
                justifyContent:"center"
            }}
        >
            <Typography
                variant= {isMobile? "h5":"h4"}
                sx={{
                    fontWeight: "bold",
                }}
            >
                Share Your Travel Story
            </Typography>
        </Box>

        <Box
            sx={{
                display:"flex",
                flexDirection:"column",
                justifyContent:"center",
                width: commonComponentWidth,
                height: "auto"
            }}
        >

        <Box
            sx={{
                display:"flex",
                flexDirection:"column",
                justifyContent:"center",
                m:2
            }}
        >
                <Typography
                    variant="h6"
                
                >
                Destination
                </Typography>
        
                <MenuDropdown
                    selectedId={destinationId}
                    label=''
                    onSort={(id) => {
                        setDestinationId(id);
                        sessionStorage.setItem("destinationId", id)
                    }}
                    options={options}
                    sx={{
                        border:1,
                        width: "100%",
                        left: 0,
                }}
                />  
            </Box>

            <CustomInputsField
              withConfirmButton={true}
              index={1}
              onInputsUpload={handleInputsUpload}
              confirmStatus={isConfirmClicked}
              buttonText="Submit Your Story"
              sx={{
                // maxHeight: "120vh",
                height: "100%",
                width: "100%",
                p: 2,
                backgroundColor: "rgb(255, 255, 255)",
                borderRadius: 1,
                // overflowY: "auto",
              }}
            />

        </Box>
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
    )
}

export default CreateStoryUI