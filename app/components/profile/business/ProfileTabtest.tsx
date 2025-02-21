/* eslint-disable */

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/libs/services/business/profile";

interface ProfileFormInputs {
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  facebook: string;
  instagram: string;
  x: string;
  phone: string;
}

const ProfileTab = () => {
  const storedValues = JSON.parse(sessionStorage.getItem("adminProfile") as string);
  const [updateProfile] = useUpdateProfileMutation();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const defaultValues = {
    businessname: "",
    description: "",
    email: "",
    facebook: "",
    instagram: "",
    x: "",
    phone: "",
  };
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProfileFormInputs>();

  const {
    data: profile,
    error: profileError,
    isLoading: profileLoad,
  } = useGetProfileQuery();

  if (profileError) {
    setSnackbar({
      open: true,
      message: `Service error: ${profileError}`,
      severity: "error",
    });
  }
  
  useEffect(() => {
    if (profile) {
      for (const [key, value] of Object.entries(profile.data)) {
        if (key in defaultValues) {
          setValue(key as any, (
            storedValues && storedValues[key] !== ""
            ? storedValues[key] : value
          ) || "");
        }
      }
    }
  }, [profile, setValue]);
  
  useEffect(()=>{
    if(profile){
      const subscription = watch((value)=>{
        if(!Object.values(profile.data).includes(value)){
          sessionStorage.setItem("adminProfile", JSON.stringify(value));
        }
      });
      return () => subscription.unsubscribe();
    }
  },[watch, profile]);

  const onSubmit = async (profileData: ProfileFormInputs) => {
    const result = await updateProfile(profileData).unwrap();

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
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100%",
        backgroundColor: "#f4f4f4",
        padding: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          borderRadius: 2,
          width: "100%",
          maxWidth: 800,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", marginBottom: 2 }}>
          Business Information
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            {[
              { name: "businessname", label: "Business Name", required: true },
              { name: "email", label: "Email", required: true },
              { name: "facebook", label: "Facebook", required: false },
              { name: "instagram", label: "Instagram", required: false },
              { name: "x", label: "X", required: false },
              { name: "phone", label: "Phone", required: true },
              { name: "description", label: "Description", required: true },
            ].map((field) => (
              <Box
                key={field.name}
                sx={{
                  flex: "1 1 calc(50% - 16px)", // Two-column layout
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ marginBottom: 0.5, fontWeight: 500 }}
                >
                  {field.label}
                  {field.required && (
                    <Typography
                      component="span"
                      color="error"
                      sx={{ marginLeft: 0.5 }}
                    >
                      *
                    </Typography>
                  )}
                </Typography>

                <Controller
                  name={field.name as keyof ProfileFormInputs}
                  control={control}
                  rules={
                    field.required
                      ? { required: `${field.label} is required` }
                      : undefined
                  }
                  render={({ field: controllerField }) =>
                    field.name !== "description" ? (
                      <TextField
                        {...controllerField}
                        fullWidth
                        variant="outlined"
                        error={!!errors[field.name as keyof ProfileFormInputs]}
                        helperText={
                          errors[field.name as keyof ProfileFormInputs]?.message
                        }
                      />
                    ) : (
                      <TextField
                        {...controllerField}
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        error={!!errors[field.name as keyof ProfileFormInputs]}
                        helperText={
                          errors[field.name as keyof ProfileFormInputs]?.message
                        }
                      />
                    )
                  }
                />
              </Box>
            ))}
          </Box>
          <Box sx={{ marginTop: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ textTransform: "none", width: "250px", padding: 1.5 }}
              disabled={profileLoad}
            >
              Save Changes
            </Button>
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfileTab;
