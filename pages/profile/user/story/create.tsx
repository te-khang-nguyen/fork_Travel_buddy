import React, { useState, useEffect } from "react";
import { RiQuillPenAiLine } from "react-icons/ri";
import { RiQuillPenAiFill } from "react-icons/ri";
import { useRouter } from "next/router";
import {
    Box,
    Snackbar,
    Alert,
    Typography,
    useTheme, 
    useMediaQuery,
    LinearProgress,
    CircularProgress
} from "@mui/material";
import CustomInputsField from "@/app/components/generic_components/UserInputsField";
import {
    useGenerateStoryMutation,
    useUploadStoryMutation,
} from "@/libs/services/user/story";
import { 
    useUploadImageMutation 
} from "@/libs/services/storage/upload";
import {
    useGetAllDestinationsQuery,
    useGetAttractionsQuery,
} from "@/libs/services/user/destination";
import {
    useGetAllChannelsQuery
} from "@/libs/services/user/channel";
import {
    useGetProfileQuery,
} from "@/libs/services/user/profile";
import MenuDropdown from "@/app/components/generic_components/MenuDropdown";
import writeAnimation from "@/assets/feather-pen.gif";
import Image from 'next/image';


const CreateStoryUI = () => {
    const router = useRouter();
    const [ uploadStory ] = useUploadStoryMutation();
    const [ generateStory ] = useGenerateStoryMutation();
    const [ uploadImage ] = useUploadImageMutation();
    const [ destinationId, setDestinationId ] = useState<string>("1");
    const [ channelId, setChannelId ] = useState<string>("1");
    const [ options, setOptions ] = useState<{
        id: string;
        name: string;
    }[]>([
        {
            id: '1',
            name: 'Select a destination'
        },
    ]);

    const [ channelOptions, setChannelOptions ] = useState<{
        id: string;
        name: string;
    }[]>([
        {
            id: '1',
            name: 'Select a channel'
        },
    ]);

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
    const commonComponentWidth = isMobile? "100%": "60%";
    const [attractionsTitles, setAttractionsTitles] = useState<string>("");

    const persistedDesId = sessionStorage.getItem("destinationId");
    const persistedChannelId = sessionStorage.getItem("channelId");
    
    const {
        data: destinationsData,
        error: destinationsErr,
        isFetching: destinationsFetching,
    } = useGetAllDestinationsQuery();

    const {
        data: channelsData,
        error: channelsErr,
        isFetching: channelsFetching
    } = useGetAllChannelsQuery();

    const { 
        data: attractionsData
    } = useGetAttractionsQuery({
        id: destinationId
    }, 
    {
        skip: !destinationId || destinationId === "1"
    });

    useEffect(()=>{
        setDestinationId(persistedDesId ?? "1");
    },[persistedDesId]);

    useEffect(()=>{
        setChannelId(persistedChannelId ?? "1");
    },[persistedChannelId]);

    useEffect(()=>{
        if(destinationsData){
            setOptions([
                {
                    id: '1',
                    name: 'Select a destination'
                },
                ...destinationsData?.map((item) =>({
                    id: item.id,
                    name: item.name
                }))
            ]);
        }
    },[destinationsData]);

    useEffect(()=>{
        if(channelsData){
            setChannelOptions([
                {
                    id: '1',
                    name: 'Select a channel'
                },
                ...channelsData?.data?.map((item) =>({
                    id: item.id || '',
                    name: item.name || ''
                })) ?? []
            ]);
        }
    },[channelsData]);

    useEffect(()=>{
        if(attractionsData){
            setAttractionsTitles(
                attractionsData?.map(
                    (item)=>item.title
                ).join('\n')
            );
        }   
    },[attractionsData]);

    const handleInputsUpload = async (userInputs) => {
        if(destinationId === "1"){
            setSnackbar({
                open: true,
                message: "Please choose a destination for your story!",
                severity: "error",
            });
            return;
        }
        setIsConfirmClicked(true);
        // getPayLoadSize([userInputs]);
    
        const results = Promise.all(userInputs
          .userMediaSubmission
          .map(async (img: string, index: number) => {
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

        const matchedChannel = channelsData?.data?.find(e => e.id === channelId);

        const { data: generatedStory } = await generateStory({
            payload: {
                notes: userInputs.userQuestionSubmission,
                attractions: attractionsTitles,
                brandVoice: matchedChannel?.["brand_voice"],
                channelType: matchedChannel?.["channel_type"],
            }
        });

    
        if(generatedStory?.data) {
            const { story_content, ...rest } = generatedStory?.data
            const finalStory = story_content.replace(/\*/g,'');
            const { 
                data: submissionResult
            } = await uploadStory({
                payload: {
                    destination_id: destinationId,
                    channel_id: channelId,
                    notes: userInputs.userQuestionSubmission,
                    story_content: finalStory,
                    media: storageUrls,
                    ...rest
                }
            });

            if (submissionResult) {
                router.push(`/profile/user/story/${submissionResult?.data?.id}`);
                sessionStorage.removeItem("notes");
                sessionStorage.removeItem("destinationId");
                sessionStorage.removeItem("channelId");
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

    const generationScreen = (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mt: isMobile? 5 : 10,
                gap: 12
            }}
        >
            <Typography
                variant= {isMobile? "h5":"h3"}
                width={isMobile? "80%": "100%"}
            >
                <RiQuillPenAiFill/> {"Generating your beautiful travel story..."}
            </Typography>

            <Image
                src={writeAnimation}
                alt="Content Placeholder"
                width={150}
                height={150}
                style={{ borderRadius: '10px' }}
                unoptimized
            />

            <Box sx={{ width: '80%' }}>
                <LinearProgress />
            </Box>
        </Box>
    )

    return (
    <Box
        sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflow: "auto",
            maxHeight: isMobile? "80vh":"150vh"
        }}
    >
        {isConfirmClicked? 
        generationScreen:
        <>
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
                {destinationsFetching? 
                <CircularProgress/>:
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
                />  }
            </Box>

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
                Channel
                </Typography>
        
                {channelsFetching? 
                <CircularProgress/>:
                <MenuDropdown
                    selectedId={channelId}
                    label=''
                    onSort={(id) => {
                        setChannelId(id);
                        sessionStorage.setItem("channelId", id)
                    }}
                    options={channelOptions}
                    sx={{
                        border:1,
                        width: "100%",
                        left: 0,
                }}
                /> }
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
        </>
        }
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