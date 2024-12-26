import React, { useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Card,
  CardMedia
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

interface ImageCarouselProps {
  images: string[];
  height?: number | string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ 
  images, 
  height = 250 
}) => {
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

  if (images.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: height,
      }}
    >
      {/* Navigation Buttons */}
      {images.length > 1 && !isMobile && (
        <>
          <IconButton
            onClick={handlePrev}
            sx={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 1,
              backgroundColor: "rgba(255,255,255,0.7)",
            }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>
          
          <IconButton
            onClick={handleNext}
            sx={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 1,
              backgroundColor: "rgba(255,255,255,0.7)",
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </>
      )}

      {/* Scrollable Images */}
      <Box
        ref={carouselRef}
        sx={{
          display: "flex",
          gap: "1rem",
          overflowX: "auto",
          width: "100%",
          height: "100%",
          scrollBehavior: "smooth",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {images.map((imageUrl, index) => (
          <Box
            key={index}
            sx={{
              minWidth: { xs: "85vw", sm: "300px" },
              maxWidth: "100%",
              height: "100%",
            }}
          >
            <Card 
              sx={{ 
                height: "100%", 
                width: "100%",
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <CardMedia
                component="img"
                image={imageUrl}
                alt={`Submitted photo ${index + 1}`}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ImageCarousel;