import React from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useLogInMutation } from "@/libs/services/auth";

function AdminLogin() {
  const router = useRouter()
  const [logIn, {data, error, isLoading}] = useLogInMutation();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      let result = await logIn({email, password}).unwrap();
      console.log(result);
    } catch (error) {
      console.log('Login failed', error);
      alert(error);
    }
    router.push('/dashboard/business')
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
    </Box>
  );
}

export default AdminLogin;
