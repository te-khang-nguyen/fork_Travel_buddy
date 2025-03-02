import React, { useState } from "react";
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

interface Props {
  content: {
    id: string;
    name: string;
    image: string;
  }
  onCardSelect?: (id: string) => void;
}

const CustomCard: React.FC<Props> = ({ content, onCardSelect }) => {
  const router = useRouter();
  const [contentName, setContentName] = useState("");

  const [imageError, setImageError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const handleViewQRCode = (content) => {
    setModalOpen(true);
    setContentName(content.name);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setContentName("");
  };

  // Fallback image URL
  const placeholderImage =
    "https://via.placeholder.com/150?text=Image+Unavailable";

  return (
    <Box
      key={content.id}
      sx={{
        flex: 1,
        position: "relative",
      }}
    >
      <QRModal
        open={modalOpen}
        onClose={handleCloseModal}
        contentId={content.id}
        backgroundImage={content.image}
        displayText={contentName}
      />
      <Card
        sx={{
          borderRadius: "8px",
          boxShadow: 1,
        }}
      >
        <CardActionArea onClick={() => onCardSelect?.(content.id)}>
          <CardMedia
            component="img"
            height="250px"
            image={
              imageError || !content.image
                ? placeholderImage
                : content.image
            }
            alt={content.name || "Location Image"}
            onError={() => setImageError(true)} // Handle image load error
          />
          <CardContent>
            <Typography variant="h6" fontWeight="bold">
              {content.name || "Unknown Content"}
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
          onClick={() => handleViewQRCode(content)}
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

export default CustomCard;
