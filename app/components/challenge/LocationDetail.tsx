import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  IconButton,
  Typography,
  Card,
  Snackbar,
  Alert,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  useGetProgressQuery,
  useGetLocationsQuery,
  useUploadInputsMutation,
} from "@/libs/services/user/challenge";
import { useRouter } from "next/router";
import Image from "next/image";

interface LocationDetailProps {
    index: number;
    location: {
        title: string;
        imageurls: string[];
        location_info: {
            title: string;
            instruction: string;
            media: string[];
        }[];
    };
}

const LocationDetail: React.FC<LocationDetailProps> = ({
    index, 
    location
}) => {

        return (
            <Box key={index} sx={{ mb: 4 }}>
              <Card
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  backgroundColor: "rgba(31, 177, 255, 0.23)",
                  width: "100%",
                  p: 2,
                  textAlign: "center",
                  borderRadius: 7,
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
                    fontWeight: "bold",
                    color: "darkblue",
                    textAlign: "center",
                    mb: { xs: 0.5, sm: 1, md: 1 },
                  }}
                >
                  {location.title}
                </Typography>
              </Card>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  height: "300px",
                  position: "relative",
                }}
              >
                {location.imageurls?.[0] && (
                  <Box
                    sx={{
                      position: "relative",
                      width: "50%",
                      height: "100%",
                      maxWidth: "400px",
                    }}
                  >
                    <Image
                      src={location.imageurls[0]}
                      alt={location.title}
                      layout="fill"
                      objectFit="contain"
                      priority
                    />
                  </Box>
                )}
              </Box>
              {location.location_info.map((section, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    width: "100%",
                    gap: { xs: 1, sm: 2 },
                    mb: 2,
                    flexDirection: {
                      xs: "row", // Change to row on mobile
                      sm: "row",
                    },
                    alignItems: "flex-start", // Align items to the top
                  }}
                >
                  {/* Image on the left */}
                  <Box
                    sx={{
                      width: {
                        xs: "120px",
                        sm: "200px",
                      },
                      height: {
                        xs: "120px",
                        sm: "200px",
                      },
                      position: "relative",
                      flexShrink: 0,
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    {section.media?.[0] && (
                      <Image
                        src={section.media[0]}
                        alt={section.title}
                        layout="fill"
                        objectFit="cover"
                        priority
                      />
                    )}
                  </Box>

                  {/* Text content on the right */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                      flex: 1, // Take remaining space
                      pl: { xs: 2, sm: 0 }, // Add left padding on mobile
                    }}
                  >
                    {/* Title on top right */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        mb: 1,
                        textAlign: { xs: "left", sm: "left" },
                        fontSize: {
                          xs: "1rem",
                          sm: "1.5rem",
                        },
                      }}
                    >
                      {section.title}
                    </Typography>

                    {/* Instruction on bottom right */}
                    <Typography
                      variant="body2"
                      sx={{
                        textAlign: { xs: "left", sm: "left" },
                        whiteSpace: "pre-line",
                        fontSize: {
                          xs: "0.75rem",
                          sm: "1rem",
                        },
                      }}
                    >
                      {section.instruction}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
        )

}

export default LocationDetail;