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
    {
      header: "Share your experience",
      content: (
        <Box sx={{ p: 2 }}>
          <Typography sx={{ color: "white" }}>Your Story</Typography>
          <TextField
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            placeholder="Your Story... leave your notes and we will write it for you!"
            sx={{
              backgroundColor: "#fff",
              color: "#000",
              borderRadius: 1,
              mt: 2,
            }}
          />
          <Button
            variant="contained"
            color="primary"
            sx={{
              mt: 2,
              display: "block",
            }}
          >
            Confirm
          </Button>
        </Box>
      ),
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
      <Card sx={{ display:'flex', flexDirection:'column', gap:2, backgroundColor: " #2c3e50", width: "100%", p: 2  }}>
        <Typography variant="h3" sx={{color:'white'}}>Train Street Hanoi</Typography> 
       <Box sx={{  justifyItems:'center' }}>
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
