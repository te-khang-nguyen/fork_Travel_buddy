import React, { useState } from "react";
import { Box } from "@mui/material";
import Image from "next/image";
import placeholder from "@/assets/placeholder.jpg";

type ImageDisplayProps = {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  placeholderSrc?: string;
};

const ImageDisplay: React.FC<ImageDisplayProps> = ({
  src = "",
  alt,
  width,
  height,
  placeholderSrc = placeholder, // Local placeholder
}) => {
  const [currentSrc, setCurrentSrc] = useState(src || placeholderSrc);

  return (
    <Box width={width} height={height}>
      <Image
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        onError={() => setCurrentSrc(placeholderSrc)} // Fallback to placeholder
      />
    </Box>
  );
};

export default ImageDisplay;
