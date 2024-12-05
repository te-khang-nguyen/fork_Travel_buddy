import React, { useState } from "react";
import { TextField, Button, Typography, Container, Box } from "@mui/material";
import { useRouter } from "next/router";

function AccountRecoveryPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    // Simulate form submission
    console.log(`Recovery email sent to: ${email}`);
    setSubmitted(true);
  };

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        {!submitted ? (
          <>
            <Typography variant="h4" gutterBottom>
              Account Recovery
            </Typography>
            <Typography variant="body1" paragraph>
              Enter your email address, and we'll send you a link to recover
              your account.
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ width: "100%", mt: 2 }}
            >
              <TextField
                label="Email Address"
                variant="outlined"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
              >
                Send Recovery Email
              </Button>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              justifyItems: "center",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <Typography variant="h5" color="primary" textAlign="center">
              {`A recovery email has been sent to ${email}.`}
              <br />
              Please check your inbox.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                router.push("/");
              }}
            >
              Go To Login
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default AccountRecoveryPage;
