import React, { useState } from "react";
import { Box, Button, Typography, CardMedia } from "@mui/material";

interface ImageUploaderProps {
  onImageUpload: (image: string | null, name: string | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageName(file.name);
        setSelectedImage(reader.result as string);
        setImageError(false);
        onImageUpload(reader.result as string, file.name); // Notify parent component
      };
      reader.onerror = () => setImageError(true);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box display="flex" alignItems="center" gap={2}>
        <Button
          variant="contained"
          component="label"
          sx={{
            backgroundColor: "#4285F4",
            color: "white",
            textTransform: "none",
            padding: "8px 16px",
            fontSize: "14px",
            borderRadius: "4px",
            "&:hover": {
              backgroundColor: "#357ae8",
            },
          }}
        >
          Choose Files
          <input type="file" multiple hidden onChange={handleImageUpload} />
        </Button>
        <Typography
          sx={{ maxWidth: "300px" }}
          variant="body2"
          color="textSecondary"
        >
          {selectedImage ? imageName : "No file chosen"}
        </Typography>
      </Box>
      <Box
        sx={{
          width: "100%",
          height: "300px",
          overflow: "hidden",
          borderRadius: "8px",
          border: "1px solid #ccc",
          position: "relative",
        }}
      >
        <CardMedia
          component="img"
          src={
            imageError || !selectedImage
              ? "https://via.placeholder.com/600x300?text=No+Image+Available"
              : selectedImage
          }
          alt="Uploaded"
          onError={() => setImageError(true)}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Box>
    </Box>
  );
};

export default ImageUploader;
