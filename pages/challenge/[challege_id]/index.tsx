import React from "react";
import { Box, Typography, Container, Button, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/router";

import defaultBackground from "@/assets/background.jpg"; // Replace with the actual background image path

function JoinChallenge() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <Box
      sx={{
        backgroundImage: `url("${defaultBackground.src}")`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        color: "white",
        textAlign: "center",
        padding: "20px",
        gap: 4,
        position: "relative",
      }}
    >
      {/* Go Back Button */}
      <IconButton
        onClick={handleGoBack}
        sx={{
          position: "absolute",
          top: "20px",
          left: "20px",
          color: "white",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          },
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      {/* Main Content */}
      <Container maxWidth="md">
        <Typography
          variant="h1"
          component="h1"
          sx={{ fontSize: { xs: "3rem", md: "4.5rem" }, fontWeight: "bold" }}
          gutterBottom
        >
          Demo Challenge
        </Typography>
        <Typography
          variant="h4"
          component="h2"
          sx={{ fontSize: { xs: "1.5rem", md: "2.5rem" }, mt: 2 }}
          gutterBottom
        >
          Welcome aboard!
        </Typography>
        <Typography
          variant="body1"
          sx={{ fontSize: { xs: "1rem", md: "1.5rem" }, mt: 2, mb: 4 }}
        >
          Let&apos;s capture your traveling moments together!
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: "1rem", md: "1.5rem" },
            fontStyle: "italic",
            mb: 4,
          }}
        >
          Description: This is an example for a challenge creation
        </Typography>
      </Container>
      <Button
        sx={{
          borderRadius: 14,
          width: "150px",
          fontSize: { xs: "0.5rem", md: "1rem" },
        }}
        variant="contained"
      >
        Begin
      </Button>
    </Box>
  );
}

export default JoinChallenge;
