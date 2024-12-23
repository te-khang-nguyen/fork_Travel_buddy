import React from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import { Google, Facebook, Instagram } from "@mui/icons-material";
import defaultBackground from "@/assets/background.jpg";
import { useRouter } from "next/router";
import { useLogInMutation } from "@/libs/services/user/auth";
import { useGlobalContext } from "@/app/GlobalContextProvider";

function Login() {
  const { setRole } = useGlobalContext();
  const router = useRouter();
  const [logIn] = useLogInMutation();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  // Snackbar state for errors
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");

  const handleLogin = async () => {
    const result = await logIn({ email, password });

    if (result.error) {
      setSnackbarMessage((result.error as string) || "Login failed");
      setSnackbarOpen(true);
    } else {
      setRole("user");
      router.push("/dashboard/user");
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
        height: "100vh",
        width: "100%",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "max-content",
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "white",
        }}
      >
        <Typography variant="h4" color="primary" align="center" gutterBottom>
          User Login
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

        <Divider sx={{ my: 3 }} />

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
          <Button
            variant="outlined"
            startIcon={<Google />}
            onClick={() => console.log("Login with Google")}
            fullWidth={true}
          >
            Google
          </Button>
          <Button
            variant="outlined"
            startIcon={<Facebook />}
            onClick={() => console.log("Login with Facebook")}
            fullWidth={true}
          >
            Facebook
          </Button>
          <Button
            variant="outlined"
            startIcon={<Instagram />}
            onClick={() => console.log("Login with Instagram")}
            fullWidth={true}
          >
            Instagram
          </Button>
        </Box>

        <Box textAlign="center" mt={3}>
          <Link href="/register" sx={{ textDecoration: "none" }}>
            Have not registered yet? Join us!
          </Link>
        </Box>
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

export default Login;
