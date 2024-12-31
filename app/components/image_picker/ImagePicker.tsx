import React, { useState } from "react";
import { Box, Button, Typography, CardMedia, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

interface ImageUploaderProps {
  onImageUpload: (images: Array<{ image: string | null; name: string | null }>) => void;
  variant?: "image" | "name"; // New prop for variants
  allowMultiple?: boolean; // New prop for choosing and displaying multiple images
  allowAddNew?: boolean;
  fetchImages?: Array<{ image: string | null; name: string | null }>;
}

const ImageUploader: React.FC<ImageUploaderProps> =
  ({
    onImageUpload,
    variant = "image",
    allowMultiple = false,
    allowAddNew = true,
    fetchImages = []
  }) => {
    const [selectedImages, setSelectedImages] = useState<
      Array<{ image: string | null; name: string | null }>
    >(fetchImages);

    const [imageError, setImageError] = useState(false);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
        const files = Array.from(event.target.files);
        const images = files.map((file) => {
          const reader = new FileReader();
          return new Promise<{ image: string | null; name: string | null }>((resolve) => {
            reader.onload = () => {
              resolve({ image: reader.result as string, name: file.name });
            };
            reader.onerror = () => {
              setImageError(true);
              resolve({ image: null, name: file.name });
            };
            reader.readAsDataURL(file);
          });
        });

        Promise.all(images).then((uploadedImages) => {
          const updatedImages = allowMultiple ? [...selectedImages, ...uploadedImages] : uploadedImages;
          setSelectedImages(updatedImages);
          setImageError(false);
          onImageUpload(updatedImages); // Notify parent component
        });
      }
    };

    const handleRemoveImage = (index: number) => {
      const updatedImages = selectedImages.filter((_, i) => i !== index);
      setSelectedImages(updatedImages);
      onImageUpload(updatedImages); // Notify parent component
    };

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box display="flex" alignItems="center" gap={2}>
          {!allowAddNew ?
            <Typography></Typography> :
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
              {allowMultiple ? "Choose Files" : "Choose File"}
              <input type="file" multiple={allowMultiple} hidden onChange={handleImageUpload} />
            </Button>}

          <Typography
            sx={{ maxWidth: "300px" }}
            variant="body2"
            color="textSecondary"
          >
            {selectedImages.length > 0
              ? selectedImages.map((img) => img.name).join(", ")
              : "No files chosen"}
          </Typography>
        </Box>
        {variant === "image" && (
          <Box
            sx={{
              display: "flex",
              flexWrap: allowMultiple ? "wrap" : "nowrap",
              gap: 2,
              marginTop: 2,
            }}
          >
            {selectedImages.map((img, index) => (
              <Box
                key={index}
                sx={{
                  width: allowMultiple ? "100px" : "100%",
                  height: allowMultiple ? "100px" : "100%",
                  overflow: "hidden",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  position: "relative",
                }}
              >
                <CardMedia
                  component="img"
                  src={
                    imageError || !img.image
                      ? "https://via.placeholder.com/100x100?text=No+Image"
                      : img.image
                  }
                  alt={img.name || "Uploaded"}
                  onError={() => setImageError(true)}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <IconButton
                  onClick={() => handleRemoveImage(index)}
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    color: "white",
                    padding: "4px",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    );
  };

export default ImageUploader;
