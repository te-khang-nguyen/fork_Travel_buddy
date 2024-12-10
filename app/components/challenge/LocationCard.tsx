import { useState } from "react";
import { Box, Card, CardContent, CardMedia, Typography } from "@mui/material";

const LocationCard = ({ location }) => {
  const [imageError, setImageError] = useState(false);

  // Fallback image URL
  const placeholderImage =
    "https://via.placeholder.com/150?text=Image+Unavailable";

  return (
    <Box
      key={location.id}
      sx={{
        flex: "1 1 calc(100% - 1.5rem)", // Full width on small screens
        maxWidth: {
          sm: "calc(50% - 1.5rem)",
          md: "calc(33.33% - 1.5rem)",
        },
        
      }}
    >
      <Card
        sx={{
          borderRadius: "8px",
          boxShadow: 3,
          height: "100%",
        }}
      >
        <CardMedia
          component="img"
        height='250px'
          image={
            imageError || !location.image ? placeholderImage : location.image
          }
          alt={location.name || "Location Image"}
          onError={() => setImageError(true)} // Handle image load error
        />
        <CardContent>
          <Typography variant="h6" fontWeight="bold">
            {location.name || "Unknown Location"}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {location.sections || 0} sections
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LocationCard;
