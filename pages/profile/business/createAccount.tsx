import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import useFormPersist from "react-hook-form-persist";
import { Box, TextField, Typography, Button, Paper } from "@mui/material";
import { useSignUpMutation } from "@/libs/services/business/auth";

interface SignUpFormInputs {
  businessName: string;
  email: string;
  phone: string;
  password: string;
}

const SignUpForm = () => {
  const [signUp, { isLoading }] = useSignUpMutation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const defaultValues = {
    businessName: "",
    email: "",
    phone: "",
    password: "",
  };

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignUpFormInputs>();

  useFormPersist("adminRegister", {
    watch, 
    setValue,
    exclude: ['password']
  });

  const onSubmit = async (formData: SignUpFormInputs) => {
    setServerError(null);
    setSuccessMessage(null);

    const { businessName, email, phone, password } = formData;

    try {
      const response = await signUp({
        businessName,
        email,
        phone,
        password,
      });

      if ((response as any).data) {
        setSuccessMessage("Account created successfully!");
      } else if ((response as any).error) {
        setServerError(
          (response as any).error.data || "An unknown error occurred."
        );
      }
    } catch (err) {
      setServerError("An unexpected error occurred. Please try again.");
    }
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
          maxWidth: 600,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", marginBottom: 2 }}>
          Sign Up
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              { name: "businessName", label: "Business Name" },
              { name: "email", label: "Email", type: "email" },
              { name: "phone", label: "Phone" },
              { name: "password", label: "Password", type: "password" },
            ].map((field) => (
              <Box key={field.name}>
                <Typography
                  variant="body2"
                  sx={{ marginBottom: 0.5, fontWeight: 500 }}
                >
                  {field.label}{" "}
                  <Typography
                    component="span"
                    color="error"
                    sx={{ marginLeft: 0.5 }}
                  >
                    *
                  </Typography>
                </Typography>
                <Controller
                  name={field.name as keyof SignUpFormInputs}
                  control={control}
                  rules={{ required: `${field.label} is required` }}
                  render={({ field: controllerField }) => (
                    <TextField
                      {...controllerField}
                      fullWidth
                      type={field.type || "text"}
                      variant="outlined"
                      error={!!errors[field.name as keyof SignUpFormInputs]}
                      helperText={
                        errors[field.name as keyof SignUpFormInputs]?.message
                      }
                    />
                  )}
                />
              </Box>
            ))}
          </Box>
          <Box sx={{ marginTop: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ textTransform: "none", width: "100%", padding: 1.5 }}
              disabled={isLoading}
            >
              {isLoading ? "Signing Up..." : "Sign Up"}
            </Button>
          </Box>
          {serverError && (
            <Typography color="error" sx={{ marginTop: 2 }}>
              {serverError}
            </Typography>
          )}
          {successMessage && (
            <Typography color="success" sx={{ marginTop: 2 }}>
              {successMessage}
            </Typography>
          )}
        </form>
      </Paper>
    </Box>
  );
};

export default SignUpForm;
