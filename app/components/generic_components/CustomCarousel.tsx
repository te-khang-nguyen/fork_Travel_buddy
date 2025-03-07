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
import CustomCard from "./MediaCardWithText"; // Adjust the path as needed

export interface Content {
  id: string;
  name: string;
  image: string;
}

interface Props {
  contents: Content[];
  header: string;
  onCardSelect: (id: string) => void;
  onViewAll: () => void; // Callback for "View All" button
}

const CustomCarousel: React.FC<Props> = ({ contents, header, onCardSelect, onViewAll }) => {
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
        boxShadow: 0,
        p: 2,
      }}
    >
      {/* Header with View All Button */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography
          variant="h4"
          gutterBottom
          sx={{ 
            color: "#4a90e2", 
            fontWeight: "bold",
            fontSize: {xs: "h5.fontSize", sm: "h5.fontSize", md: "h4.fontSize", lg: "h4.fontSize"}
          }}
        >
          {header}
        </Typography>
        <Button
          sx={{ 
            color: "#4a90e2", 
            fontWeight: "bold",
            fontSize: "body1"
          }}
          variant="outlined"
          onClick={onViewAll}
        >
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
              backgroundColor: "rgba(226, 226, 226, 0.31)",
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
          {contents.map((content) => (
            <Box
              key={content.id}
              sx={{
                minWidth: { xs: "65vw", sm: "300px" }, // Adjust card width for mobile and larger screens
                maxWidth: "100%",
              }}
            >
              <CustomCard 
                content={content}
                onCardSelect={onCardSelect}
              />
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
              backgroundColor: "rgba(226, 226, 226, 0.31)",
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

export default CustomCarousel;
