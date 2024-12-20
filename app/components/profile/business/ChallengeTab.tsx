import React, { useState } from "react";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Typography,
} from "@mui/material";
import QRModal from "../../challenge/QRModal";

// Define the Challenge interface
interface Challenge {
  id: number;
  title: string;
  image: string;
}

const ChallengesTab: React.FC = () => {
  // Example challenge data
  const challenges: Challenge[] = [
    {
      id: 1,
      title: "Demo Challenge",
      image: "https://via.placeholder.com/300x140",
    },
    {
      id: 2,
      title: "Another Challenge",
      image: "https://via.placeholder.com/300x140",
    },
  ];

  const [modalOpen, setModalOpen]= useState(false)

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Challenges
      </Typography>

      {/* Challenges List */}
      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        {challenges.map((challenge) => (
          <Card key={challenge.id} sx={{ width: 300 }}>
            <CardMedia
              component="img"
              height="140"
              image={challenge.image}
              alt={challenge.title}
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {challenge.title}
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: "space-between", p: 2 }}>
              <Button variant="contained" color="primary">
                Edit Challenge
              </Button>
              <Button 
              onClick={()=>{setModalOpen(true)}}
              variant="contained" color="success">
                View QR Code
              </Button>
            </CardActions>
          </Card>
        ))}

        {/* Create New Challenge Card */}
        <Card
          sx={{
            width: 300,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "2px dashed #ccc",
          }}
        >
          <CardContent>
            <Typography variant="h6" color="primary" align="center">
              + Create new challenge
            </Typography>
          </CardContent>
        </Card>
      </Box>
      <QRModal open={modalOpen} onClose={()=>{setModalOpen(false)}}/>
    </Box>
  );
};

export default ChallengesTab;
