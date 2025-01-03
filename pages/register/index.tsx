import React from "react";
import { useForm } from "react-hook-form";
import { TextField, Button, Box, Typography, Snackbar, Alert } from "@mui/material";
import defaultBackground from "@/assets/background.jpg";
import { useSignUpMutation } from "@/libs/services/user/auth";
import { useRouter } from "next/router";

const RegistrationForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [signUp] = useSignUpMutation();
  const router = useRouter();
  // Snackbar state for errors
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<"success" | "error">("error");

  const onSubmit = async (data) => {
    try {
      const result = await signUp(data);

      if (result.error) {
        throw new Error(result.error as string || "Sign up failed");
      }

      setSnackbarMessage("Account created successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      setTimeout(() => {
        router.push('/');
      }, 1000);

    } catch (error) {
      if (error instanceof Error) {
        setSnackbarMessage(error.message);
      } else {
        setSnackbarMessage("An unknown error occurred");
      }
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box
      sx={{
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundImage: `url("${defaultBackground.src}")`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f4f4f4",
        px: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: { xs: 300, sm: 600 }, // Responsive width
          p: 3,
          border: "1px solid #ddd",
          borderRadius: 2,
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          boxShadow: { xs: 1, sm: 3 },
        }}
      >
        <Typography variant="h5" textAlign="center">
          Create Account
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography>First Name</Typography>
              <TextField
                sx={{ mt: 0.5 }}
                placeholder="Enter your first name"
                fullWidth
                {...register("firstName", {
                  required: "First name is required",
                })}
                error={!!errors.firstName}
                helperText={errors.firstName?.message as string}
              />
            </Box>
            <Box>
              <Typography>Last Name</Typography>
              <TextField
                sx={{ mt: 0.5 }}
                fullWidth
                placeholder="Enter your last name"
                {...register("lastName", { required: "Last name is required" })}
                error={!!errors.lastName}
                helperText={errors.lastName?.message as string}
              />
            </Box>
            <Box>
              <Typography>Email</Typography>
              <TextField
                sx={{ mt: 0.5 }}
                fullWidth
                placeholder="Enter your email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Invalid email address",
                  },
                })}
                error={!!errors.email}
                helperText={errors.email?.message as string}
              />
            </Box>
            <Box>
              <Typography>Phone</Typography>
              <TextField
                sx={{ mt: 0.5 }}
                fullWidth
                placeholder="Enter your phone"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^\d{10}$/,
                    message: "Phone number must be 10 digits",
                  },
                })}
                error={!!errors.phone}
                helperText={errors.phone?.message as string}
              />
            </Box>
            <Box>
              <Typography>Password</Typography>
              <TextField
                sx={{ mt: 0.5 }}
                fullWidth
                type="password"
                placeholder="Enter your password"
                {...register("password", {
                  required: "Password is required",
                  pattern: {
                    value:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                    message:
                      "Password must be at least 8 characters, include an uppercase letter, a number, and a special character",
                  },
                })}
                error={!!errors.password}
                helperText={errors.password?.message as string}
              />
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Button
                sx={{ p: 1.5 }}
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Create account
              </Button>
              <Button href="/" color="primary" fullWidth>
                Already have an account? Login here.
              </Button>
            </Box>
          </Box>
        </form>
      </Box>

      {/* Snackbar for error messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RegistrationForm;
