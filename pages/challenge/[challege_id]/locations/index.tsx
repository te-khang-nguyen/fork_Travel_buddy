import React from "react";
import {
  Box,
  Typography,
  Container,
  Button,
  IconButton,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/router";

import defaultBackground from "@/assets/background.jpg"; // Replace with the actual background image path
import LocationCard from "@/app/components/challenge/LocationCard";

function JoinChallenge() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const locations = [
    {
      id: 1,
      name: "Train Street Hanoi",

      sections: 3,
    },
    { id: 2, name: "Hoan Kiem Lake", sections: 3 },
    {
      id: 3,
      name: "St. Joseph's Cathedral",

      sections: 3,
    },
  ];

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
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexWrap: "wrap",
          gap: "1.5rem",
          justifyContent: { xs: "center", sm: "space-between" },
        }}
      >
        {locations.map((location) => (
          <LocationCard location={location} />
        ))}
      </Box>
    </Box>
  );
}

export default JoinChallenge;
