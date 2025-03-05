import React from "react";
import { Grid, Box, Typography } from "@mui/material";

const IconicPhotos = ({ photos }) => {
  return (
    <>
    <Typography variant="h4" gutterBottom align="center" sx={{ mt: 6 }}>
        Iconic Photos
    </Typography>
    <Grid container spacing={5} sx={{ mt: 4 }}>
      {photos.map((photo) => (
        <Grid item xs={6} key={photo.id}>
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: 300, // fixed height for standardization
              overflow: "hidden",
              cursor: "pointer",
              transition: "transform 0.3s",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          >
            <Box
              component="img"
              src={photo.url}
              alt={photo.name}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: "10%", // occupies bottom 10% of the container
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(128, 128, 128, 0.3)",
                transition: "background-color 0.3s",
                "&:hover": {
                  backgroundColor: "rgba(128, 128, 128, 0.6)",
                },
              }}
            >
              <Typography variant="subtitle1" sx={{ color: "#fff" }}>
                {photo.name}
              </Typography>
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
    </>
  );
};

export default IconicPhotos;
