import { useState } from "react";
import { Box, Card, CardActionArea, CardContent, CardMedia, Typography } from "@mui/material";
import { useRouter } from "next/router";

const LocationCard = ({ location, onClick }) => {
  const router = useRouter();
  const params = router.query;
  const [imageError, setImageError] = useState(false);

  console.log(location);

  const handleClick = (value) => {
    const role = localStorage.getItem("role");
    if(role === 'user'){
      router.push(`/challenge/${params?.challege_id}/locations/${value}`);
    } else {
      router.push(`/challenge/create/${params?.id}/location`);
    }
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
          opacity: location.status==='ACTIVE' ? 1 : 0.3,
        }}
      >
        <CardActionArea onClick={onClick}>
          <CardMedia
            component="img"
            height='250px'
            image={
              !location.imageurls[0] ? placeholderImage : location.imageurls[0]
            }
            alt={location.title || "Location Image"}
            onError={() => setImageError(true)} // Handle image load error
          />
          <CardContent>
            <Typography variant="h6" fontWeight="bold">
              {location.title || "Unknown Location"}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {location.location_info?.length || 0} sections
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  );
};

export default LocationCard;
