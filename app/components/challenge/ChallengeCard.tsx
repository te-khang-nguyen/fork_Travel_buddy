import { useState } from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { useRouter } from "next/router";
import QRModal from "./QRModal";

const ChallengeCard = ({ challenge }) => {
  const router = useRouter();
  const [challengeName, setChallengeName] = useState("");

  const [imageError, setImageError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const handleViewQRCode = (challenge) => {
    setModalOpen(true);
    setChallengeName(challenge.name);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setChallengeName("");
  };
  const handleClick = (value) => {
    router.push(`/challenge/${value}/locations`);
  };

  // Fallback image URL
  const placeholderImage =
    "https://via.placeholder.com/150?text=Image+Unavailable";

  return (
    <Box
      key={challenge.id}
      sx={{
        flex: 1,
        position: "relative",
      }}
    >
      <QRModal
        open={modalOpen}
        onClose={handleCloseModal}
        challengeId={challenge.id}
        backgroundImage={challenge.image}
        displayText={challengeName}
      />
      <Card
        sx={{
          borderRadius: "8px",
          boxShadow: 3,
        }}
      >
        <CardActionArea onClick={() => handleClick(challenge.id)}>
          <CardMedia
            component="img"
            height="250px"
            image={
              imageError || !challenge.image
                ? placeholderImage
                : challenge.image
            }
            alt={challenge.name || "Location Image"}
            onError={() => setImageError(true)} // Handle image load error
          />
          <CardContent>
            <Typography variant="h6" fontWeight="bold">
              {challenge.name || "Unknown Challenge"}
            </Typography>
          </CardContent>
        </CardActionArea>
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => handleViewQRCode(challenge)}
        >
          <QrCode2Icon
            sx={{
              color: "rgb(0, 182, 249)",

              "&:hover": {
                color: "rgb(246, 101, 101)",
              },
            }}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default ChallengeCard;
