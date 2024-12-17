import React, { useRef } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ChallengeCard from "./ChallengeCard"; // Adjust the path as needed

interface Challenge {
  id: number;
  name: string;
}

interface Props {
  challenges: Challenge[];
  onViewAll: () => void; // Callback for "View All" button
}

const ChallengeCarousel: React.FC<Props> = ({ challenges, onViewAll }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Scroll to the left
  const handlePrev = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft -= 300;
    }
  };

  // Scroll to the right
  const handleNext = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft += 300;
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        flexDirection: "column",
        gap: 3,
        display: "flex",
        backgroundColor: "#f9f9f9",
        borderRadius: 2,
        boxShadow: 1,
        p: 2,
      }}
    >
      {/* Header with View All Button */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ color: "#4a90e2", fontWeight: "bold" }}
        >
          Featured Challenges
        </Typography>
        <Button variant="outlined" onClick={onViewAll}>
          View All
        </Button>
      </Box>

      {/* Carousel Container */}
      <Box display="flex" alignItems="center" position="relative">
        {/* Left Navigation Button */}
        {!isMobile && (
          <IconButton
            onClick={handlePrev}
            sx={{
              position: "absolute",
              left: 0,
              zIndex: 1,
              backgroundColor: "white",
              boxShadow: 1,
            }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>
        )}

        {/* Scrollable Cards */}
        <Box
          ref={carouselRef}
          sx={{
            display: "flex",
            gap: "1rem",
            scrollBehavior: "smooth",
            width: "100%",
            overflowX: "auto",
            "&::-webkit-scrollbar": { display: "none" }, // Optional: Hide scrollbar
            pb: 1,
          }}
        >
          {challenges.map((challenge) => (
            <Box
              key={challenge.id}
              sx={{
                minWidth: { xs: "85vw", sm: "300px" }, // Adjust card width for mobile and larger screens
                maxWidth: "100%",
              }}
            >
              <ChallengeCard challenge={challenge} />
            </Box>
          ))}
        </Box>

        {/* Right Navigation Button */}
        {!isMobile && (
          <IconButton
            onClick={handleNext}
            sx={{
              position: "absolute",
              right: 0,
              zIndex: 1,
              backgroundColor: "white",
              boxShadow: 1,
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default ChallengeCarousel;
