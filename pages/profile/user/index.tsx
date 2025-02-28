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
} from "@mui/material";
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AvatarEditor from "@/app/components/image_picker/AvatarPicker";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/libs/services/user/profile";

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

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const [profileValues, setProfileValues] = useState<{
    username: string;
    avatarUrl: string;
    brandVoice: string;
  }>(defaultValues);

  const profileValuesRef = useRef<{
    username: string;
    avatarUrl: string;
    brandVoice: string;
  }>(defaultValues);

  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const { 
    data: profile, 
    error: profileError 
  } = useGetProfileQuery();

  // const storedValues = JSON.parse(sessionStorage.getItem("profile") as string);

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

  const onUserNameEditClicked = async (
    setIsEditing: (isEdditing: boolean) => void, 
    isEditing: boolean, 
    key: string, 
    value: string
  ) => {
    setIsEditing(!isEditing);
    if(isEditing) {
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

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        minHeight: "100%",
        backgroundColor: "#f4f4f4",
        padding: 2,
        
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
        <Typography variant="h5" sx={{fontWeight: 'bold'}}>My Profile</Typography>
        <IconButton sx={{right: 0}}>
          <SettingsOutlinedIcon sx={{color: "rgb(16, 126, 243)"}}/>
        </IconButton>
      </Box>


      <Box
       display="flex"
       flexDirection="row"
       justifyContent="space-between"
       alignItems="center"
       width={"100%"}
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
            ml: 2
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
       // border={1}
      >

        <Typography
          variant="body1"
          sx={{
            fontWeight: "bold"
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
          }}
        >
          {profileValues.brandVoice}
        </Typography>
        :<TextField
          fullWidth
          variant="outlined"
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
  );
};

export default ProfileForm;
