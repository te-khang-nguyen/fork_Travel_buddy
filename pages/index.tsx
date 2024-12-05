import React from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Divider,
} from '@mui/material';
import { Google, Facebook, Instagram } from '@mui/icons-material';

function Login() {
  const handleLogin = () => {
    // Add login logic here
  };

  const handlePasswordRecovery = () => {
    // Add password recovery logic here
  };

  const handleRegistration = () => {
    // Add registration navigation logic here
  };

  const handleSocialLogin = (platform:unknown) => {
    console.log(`Login with ${platform}`);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f4f4f4',
        px: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 'max-content',
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: 'white',
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Login
        </Typography>

        <TextField
          fullWidth
          margin="normal"
          label="Email or Username"
          variant="outlined"
        />
        <TextField
          fullWidth
          margin="normal"
          label="Password"
          type="password"
          variant="outlined"
        />

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
          <Link href="#" onClick={handlePasswordRecovery}>
            Forgot Password?
          </Link>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body1" align="center" gutterBottom>
          Or sign in with:
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            justifyContent: 'center',
          }}
        >
          <Button
            variant="outlined"
            startIcon={<Google />}
            onClick={() => handleSocialLogin('Google')}
            fullWidth={true}
          >
            Google
          </Button>
          <Button
            variant="outlined"
            startIcon={<Facebook />}
            onClick={() => handleSocialLogin('Facebook')}
            fullWidth={true}
          >
            Facebook
          </Button>
          <Button
            variant="outlined"
            startIcon={<Instagram />}
            onClick={() => handleSocialLogin('Instagram')}
            fullWidth={true}
          >
            Instagram
          </Button>
        </Box>

        <Box textAlign="center" mt={3}>
          <Typography variant="body2">
            Do not have an account?{' '}
            <Link href="#" onClick={handleRegistration}>
              Register here
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default Login;
