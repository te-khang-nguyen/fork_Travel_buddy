import { useState } from "react";
import { Box, Card, CardActionArea, CardContent, CardMedia, Typography } from "@mui/material";
import { useRouter } from "next/router";

const LocationCard = ({ location }) => {
  const router = useRouter();
  const { challege_id } = router.query;
  const [imageError, setImageError] = useState(false);
  
  const handleClick = (value) => {
      router.push(`/challenge/${challege_id}/locations/${value}`);
  };

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
        <CardActionArea onClick={() => handleClick(location.id)}>
          <CardMedia
            component="img"
            height='250px'
            image={
              !location.image ? placeholderImage : location.image
            }
            alt={location.title || "Location Image"}
            onError={() => setImageError(true)} // Handle image load error
          />
          <CardContent>
            <Typography variant="h6" fontWeight="bold">
              {location.title || "Unknown Location"}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {location.location_info.length || 0} sections
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  );
};

export default LocationCard;
