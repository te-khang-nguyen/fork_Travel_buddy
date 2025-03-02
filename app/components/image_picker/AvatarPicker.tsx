import React, { useEffect, useState, useMemo, ChangeEvent } from "react";
import { BsPersonBoundingBox } from "react-icons/bs";
import { BsCamera2 } from "react-icons/bs";
import { GiPhotoCamera } from "react-icons/gi";
import { AiOutlineCamera } from "react-icons/ai";
import { 
  Box, 
  Button, 
  Typography, 
  CardActionArea,
  CardMedia, 
  useTheme, 
  useMediaQuery,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { File } from "openai/_shims/index.mjs";
import { handleImageUpload } from "./ImagePicker";
import avatarPlaceholder from "@/assets/avatarPH1.webp";


interface AvatarEditorProps {
  onImageUpload: (images: Array<{ image: string | null; name: string | null }>) => void;
  variant?: "image" | "name"; // New prop for variants
  fetchImages?: Array<{ image: string | null; name: string | null }>;
  withResize?: boolean;
}

const AvatarEditor: React.FC<AvatarEditorProps> =
  ({
    onImageUpload,
    variant = "image",
    fetchImages = [],
    withResize = false,
  }) => {
    const [selectedImages, setSelectedImages] = useState<
      Array<{ image: string | null; name: string | null }>
    >([]);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    useEffect(() => {
      if (fetchImages.length > 0) {
        setSelectedImages(fetchImages);
      }
    },[fetchImages])

    const [imageError, setImageError] = useState(false);

    const paramObj = {
      withResize,
      selectedImages,
      setImageError,
      setSelectedImages,
      onImageUpload,
    }
    
    return (
      <Box sx={{ display: "flex", flexDirection: "column" }}>
         {variant === "image" && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "nowrap",
              gap: 2,
              mt: 1,
              mb: 1,
            }}
          >
              <Box
                sx={{
                  width: isMobile?"85px":100,
                  height: isMobile?"85px":100,
                  overflow: "hidden",
                  borderRadius: "50%",
                  border: "1px solid #ccc",
                  position: "relative",
                }}
              >
                <CardActionArea
                  component="label"
                  // onClick={(e) => handleImageUpload({
                  //   acceptedFiles: e.target.files,
                  //   ...paramObj
                  // })}
                >
                <CardMedia
                  component="img"
                  src={
                    imageError || !selectedImages?.[0]?.image
                      ? avatarPlaceholder.src
                      : selectedImages?.[0]?.image
                  }
                  alt={selectedImages?.[0]?.name || "Uploaded"}
                  onError={() => setImageError(true)}
                  sx={{
                    minWidth: isMobile?40:100,
                    minHeight: isMobile?40:100,
                    // width: "50%",
                    // height: "100%",
                    objectFit: "cover",
                  }}
                />
                <input 
                  type="file" 
                  hidden 
                  onChange={(e) => handleImageUpload({
                    acceptedFiles: e.target.files,
                    ...paramObj
                  })} 
                />
                </CardActionArea>
              </Box>
          </Box>
          )}
      </Box>
    );
  };

export default AvatarEditor;
