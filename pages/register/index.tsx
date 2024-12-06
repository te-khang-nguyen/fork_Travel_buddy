import React from "react";
import { useForm } from "react-hook-form";
import { TextField, Button, Box, Typography } from "@mui/material";

const RegistrationForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    // Simulate a unique email validation
    const uniqueEmails = ["test@example.com"];
    if (uniqueEmails.includes(data.email)) {
      alert("Email is already in use!");
      return;
    }

    console.log("Registration Successful:", data);
    alert("Registration Successful!");
  };

  return (
    <Box
      sx={{
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
          Register
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              {...register("firstName", { required: "First name is required" })}
              error={!!errors.firstName}
              helperText={errors.firstName?.message as string}
            />
            <TextField
              fullWidth
              label="Last Name"
              {...register("lastName", { required: "Last name is required" })}
              error={!!errors.lastName}
              helperText={errors.lastName?.message as string}
            />
            <TextField
              fullWidth
              label="Email"
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
            <TextField
              fullWidth
              label="Phone"
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
            <TextField
              fullWidth
              type="password"
              label="Password"
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
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Button
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
    </Box>
  );
};

export default RegistrationForm;
