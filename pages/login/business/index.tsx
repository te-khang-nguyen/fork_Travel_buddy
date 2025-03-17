import React from "react";
import { Box, TextField, Button, Typography, Alert, Snackbar, Link, Divider } from "@mui/material";
import { useRouter } from "next/router";
import { useLogInMutation } from "@/libs/services/business/auth";
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
  const handleLogin = async () => {
    const result = await logIn({ email, password });

    if (result.error) {
      setSnackbarMessage((result.error as any)?.data?.error || "Login failed");
      setSnackbarOpen(true);
    } else {
      const accessToken = (result.data as any).access_token;
      const userId = (result.data as any).userId;
      setRole("business");
      localStorage.setItem("role", "business");
      localStorage.setItem("jwt", accessToken);
      localStorage.setItem("account", userId);
      router.push("/dashboard/business");
    }
  };

  React.useEffect(() => {
    // Ensure this page is only accessible for business login
    if (router.pathname !== '/login/business') {
      router.push('/login/business');
    }
  }, [router]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100%",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "600px",
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "white",
        }}
      >
        <Typography variant="h4" color="primary" align="center" gutterBottom>
          Business Login
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
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
        </Box>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={handleLogin}
        >
          Login
        </Button>

        <Box textAlign="center" mt={2}>
          <Link href="/recovery">Forgot Password?</Link>
        </Box>

        {/* <Divider sx={{ my: 3 }} />

        <Typography variant="body1" align="center" gutterBottom>
          Or sign in with:
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            justifyContent: "center",
          }}
        >
        </Box>

        <Box textAlign="center" mt={3}>
          <Link href="/register" sx={{ textDecoration: "none" }}>
            Have not registered yet? Join us!
          </Link>
        </Box> */}
      </Box>

      {/* Snackbar for error messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
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
