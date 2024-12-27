import React from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
} from "@mui/material";
import CustomAccordionList from "@/app/components/challenge/Section";
import defaultBackground from "@/assets/background.jpg";
import ImageDisplay from "@/app/components/kits/Image";
import BenThanhLoc from "@/assets/BenThanhLoc.jpg";

const MainUI = () => {


  const accordionItems = [
    {
      header: "Context",
      content: "Content for Context",
    },
    {
      header: "Famous Visitors",
      content: "Content for Famous Visitors",
    },
    {
      header: "Photo Posing Guide",
      content: "Content for Photo Posing Guide",
    },
  ];

  return (
    <Box
      sx={{
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundImage: `url("${defaultBackground.src}")`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        p: 2,
      }}
    >
      <Card sx={{
        mb: 4,
        boxShadow: 3,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        backgroundColor: "rgba(197, 195, 218, 0.45)",
        width: "100%",
        p: 2,
      }}>
        <Card

          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            backgroundColor: "rgba(31, 177, 255, 0.23)",
            width: "100%",
            p: 2,
            textAlign: "center",
            borderRadius: 7
          }}
        >
          <Typography
            variant="h2"
            align="center"
            sx={{
              color: "rgb(255, 253, 253)",
            }}
          > Train Street Hanoi
          </Typography>
        </Card>
        <Box sx={{ justifyItems: 'center' }}>
          <ImageDisplay
            src="" // Main image
            alt="Example Image"
          />
        </Box>
        <CustomAccordionList items={accordionItems} />
      </Card>
    </Box>
  );
};

export default MainUI;