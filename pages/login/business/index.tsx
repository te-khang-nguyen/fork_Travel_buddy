import React from "react";
import { Box, TextField, Button, Typography, Alert, Snackbar } from "@mui/material";
import { useRouter } from "next/router";
import { useLogInMutation } from "@/libs/services/business/auth";
  import { setCookie } from 'cookies-next';
  import { useGlobalContext } from "@/app/GlobalContextProvider";

function AdminLogin() {
  const router = useRouter();
  const [logIn, ] = useLogInMutation();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  const {setRole} = useGlobalContext()
  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault(); 
    const result = await logIn({ email, password });

    if (result.error) {
      setSnackbarMessage((result.error as any)?.data || "Login failed");
      setSnackbarOpen(true);
    } else {
      setRole("business");
      setCookie('role', 'business');
      router.push("/dashboard/business");
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "#f0f0f0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100%",
      }}
    >
      <Box
        component="form"
        onSubmit={handleLogin}
        sx={{
          width: { xs: "90%", sm: "500px" },
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "white",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h4" gutterBottom>
            Admin Portal
          </Typography>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Sign in to manage your business
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3 }}>
          <Box>
            <Typography>Email</Typography>
            <TextField
              sx={{ mt: 0.5 }}
              fullWidth
              margin="normal"
              variant="outlined"
              placeholder="Enter Your Email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </Box>
          <Box>
            <Typography>Password</Typography>
            <TextField
              sx={{ mt: 0.5 }}
              fullWidth
              margin="normal"
              type="password"
              variant="outlined"
              placeholder="Enter Your Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Box>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Login
          </Button>
        </Box>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{border:'1px solid red' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="error"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AdminLogin;
