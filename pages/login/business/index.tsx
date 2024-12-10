import React from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { useRouter } from "next/router";

function AdminLogin() {
  const router = useRouter()
  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    router.push('/dashboard/admin')
    // Add login logic here
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
        <Box  sx={{textAlign:'center'}}>
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
    </Box>
  );
}

export default AdminLogin;
