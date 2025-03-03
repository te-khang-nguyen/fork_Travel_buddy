import React, { useEffect, useState, useRef } from "react";
import { PiNotePencilBold } from "react-icons/pi";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import StyledContentCard from "@/app/components/generic-component/StyledContentCard";
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AvatarEditor from "@/app/components/image_picker/AvatarPicker";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/libs/services/user/profile";
import {
  useGetAllStoryQuery
} from "@/libs/services/user/story";

import LoadingSkeleton from "@/app/components/kits/LoadingSkeleton";

interface ProfileFormInputs {
  username?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  facebook?: string;
  instagram?: string;
  x?: string;
  phone?: string;
}

const ProfileForm = () => {
  const defaultValues = {
    username: "",
    avatarUrl: "",
    brandVoice: "",
  };

  const role = localStorage.getItem("role");
  const [isEditingName, setIsEdtingName] = useState<boolean>(false); 
  const [isEditingVoice, setIsEdtingVoice] = useState<boolean>(false); 
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

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const [profileValues, setProfileValues] = useState<{
    username: string;
    avatarUrl: string;
    brandVoice: string;
  }>(defaultValues);

  const [ storyData, setStoryData ] = useState<{
    [x: string]: string | number | string[] | undefined
  }[]>([]);

  const profileValuesRef = useRef<{
    username: string;
    avatarUrl: string;
    brandVoice: string;
  }>(defaultValues);

  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const { 
    data: profile, 
    error: profileError,
    isLoading: isLoadingProfile,
    isFetching
  } = useGetProfileQuery();

  const {
    data: story, 
    error: storyError
  } = useGetAllStoryQuery();

  useEffect(() => {
    if (profile) {
      for (const [key, value] of Object.entries(profile.data)) {
        if (key in defaultValues) {
          const storedValues = sessionStorage.getItem(key);
          const valueToSet = storedValues 
            && storedValues !== ""
            ? storedValues : value;

          const newObj = {
              ...profileValuesRef.current,
              [key]: valueToSet
          };

          profileValuesRef.current = newObj;

          setProfileValues({
            ...profileValuesRef.current,
            [key]: valueToSet,
          });
        }
      }
    }
  }, [profile]);
  
  useEffect(()=>{
          if(story?.data){
              setStoryData(story?.data?.map((item) => ({
                  id: item.id,
                  createdAt: item.createdAt,
                  title: item.title,
                  text: item.storyFull,
                  media: item.mediaSubmitted,
                  status: item.status,
              })));
          }
  },[story?.data]);

  const onUserNameEditClicked = async (
    setIsEditing: (isEdditing: boolean) => void, 
    isEditing: boolean, 
    key: string, 
    value: string
  ) => {
    setIsEditing(!isEditing);
    if(isEditing && profile?.data[key] !== value) {
      const result = await updateProfile({
        [key]: value
      }).unwrap();
      
      if (result.data) {
        setSnackbar({
          open: true,
          message: "Profile updated successfully!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Failed to update profile. Please try again.",
          severity: "error",
        });
      }
    }
  };

  const handleAvatarUpload = async (uploadedAvatar: 
    {image: string | null; name:string | null}[]
  ) => {
    const result = await updateProfile({
      avatarUrl: uploadedAvatar?.[0]?.image || ""
    }).unwrap();

    if (result.data) {
      setSnackbar({
        open: true,
        message: "Avatar updated successfully!",
        severity: "success",
      });
    } else {
      setSnackbar({
        open: true,
        message: "Failed to update avatar! Please try again!",
        severity: "error",
      });

    }
  }

  if(isLoadingProfile) {
    return (<LoadingSkeleton isLoading={isLoadingProfile}/>);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        minHeight: "100%",
        backgroundColor: "#f4f4f4",
        padding: 2,
        gap: 5
      }}
    >
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        minHeight: "100%",
        width: isMobile? "100%":"50%",
        backgroundColor: "#f4f4f4",
        padding: 2,
        gap: 5
      }}
    >
      <Box
       display="flex"
       flexDirection="row"
       justifyContent="space-between"
       alignItems="center"
       width={"100%"}
       // border={1}
      >
        <Typography variant="h3" sx={{
          fontWeight: 'bold',
          fontSize: isMobile ? "h5.fontSize": "h4.fontSize",
          }}>My Profile</Typography>
        <IconButton sx={{right: 0}}>
          <SettingsOutlinedIcon 
            sx={{
              color: "rgb(16, 126, 243)",
              fontSize: {xs: "30px", sm: "30px", md: "40px", lg: "40px"}
            }}/>
        </IconButton>
      </Box>


      <Box
       display="flex"
       flexDirection="row"
       justifyContent={isMobile?"space-between":"flex-start"}
       alignItems="center"
       width={"100%"}
       gap={isMobile? 0 : 3}
       sx={{
        mt: 0,
       }}
       // border={1}
      >
        <AvatarEditor
          onImageUpload={(e) => handleAvatarUpload(e)}
          fetchImages={[{
              image: profileValues.avatarUrl,
              name: "User's avatar"
          }]}
        />

        {!isEditingName?
        <Typography
          variant="h6"
          sx={{
            fontSize:  {
              xs:'h6.fontSize',
              sm:'h6.fontSize',
              md:'h5.fontSize',
              lg:'h5.fontSize'
            },
            color: "black",
            fontWeight:"bold"
          }}
        >
          {profileValues.username}
        </Typography>
        :<TextField
          fullWidth
          variant="outlined"
          sx={{
            ml: 2,
            '.MuiInputBase-input': {                           
                fontSize: {
                  xs:'h6.fontSize',
                  sm:'h6.fontSize',
                  md:'h5.fontSize',
                  lg:'h5.fontSize'
                }
            },
            '.MuiOutlinedInput-notchedOutline':{
              borderColor:"black",
              borderWidth: "2px"
            }
          }}
          value={profileValues.username}
          onChange={(e) => {
            sessionStorage.setItem("username", e.target.value);
            setProfileValues({
              ...profileValues,
              username: e.target.value,
            })
          }}
          />}
        
        <IconButton
          onClick={() => onUserNameEditClicked(
            setIsEdtingName,
            isEditingName,
            "username",
            profileValues.username
          )}
        >
          <PiNotePencilBold style={{fontSize: "20px"}}/>
        </IconButton>

      </Box>

      <Box
       display="flex"
       flexDirection="column"
       justifyContent="space-between"
       alignItems="flex-start"
       width={"100%"}
       sx={{
        mt: 0,
        gap: 2
       }}
       // border={1}
      >

        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            fontSize: {
              xs:'h6.fontSize',
              sm:'h6.fontSize',
              md:'h5.fontSize',
              lg:'h5.fontSize'
            },
          }}
        >
          Brand Voice
        </Typography>
        <Box
       display="flex"
       flexDirection="row"
       justifyContent="space-between"
       alignItems="center"
       width={"100%"}
       // border={1}
      >
        {!isEditingVoice?
        <Typography
          variant="body1"
          sx={{
            color: "black",
            fontSize:  {
              xs:'h6.fontSize',
              sm:'h6.fontSize',
              md:'h5.fontSize',
              lg:'h5.fontSize'
            },
          }}
        >
          {profileValues.brandVoice}
        </Typography>
        :<TextField
          fullWidth
          variant="outlined"
          sx={{
            '.MuiInputBase-input': {
                                            
              fontSize: {
                xs:'h6.fontSize',
                sm:'h6.fontSize',
                md:'h5.fontSize',
                lg:'h5.fontSize'
              }
            },
            '.MuiOutlinedInput-notchedOutline':{
              borderColor:"black",
              borderWidth: "2px"
            }
          }}
          value={profileValues.brandVoice}
          onChange={(e) => {
            sessionStorage.setItem("brandVoice", e.target.value);
            setProfileValues({
              ...profileValues,
              brandVoice: e.target.value,
            })
          }}
          />}
        
        <IconButton
          onClick={() => onUserNameEditClicked(
            setIsEdtingVoice,
            isEditingVoice,
            "brandVoice",
            profileValues.brandVoice
          )}
        >
          <PiNotePencilBold style={{fontSize: "20px"}}/>
        </IconButton>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection:"column",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            alignSelf: "center",
            overflowY: "auto",
            mt: 3,
            width: "100%",
            maxHeight: 400,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              fontSize: {
                xs:'h6.fontSize',
                sm:'h6.fontSize',
                md:'h5.fontSize',
                lg:'h5.fontSize'
              },
              mb: 2
            }}
          >
            Your Stories
          </Typography>
          {storyData.map((item, index)=>(
            <StyledContentCard 
              key={index}
              content={item}
              route={`/profile/user/story/${item.id}`}
            />
          ))}
        </Box>
        

      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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
    </Box>
  );
};

export default ProfileForm;
