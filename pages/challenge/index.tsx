import React from "react";
import { Box } from "@mui/material";
import ChallengeCard from "@/app/components/challenge/ChallengeCard";

function ChallengeList() {
  const challenges = [
    { id: 1, name: "Challenge 1" },
    { id: 2, name: "Challenge 2" },
    { id: 3, name: "Challenge 3" },
    { id: 4, name: "Challenge 4" },
    { id: 5, name: "Challenge 5" },
    { id: 6, name: "Challenge 6" },
    { id: 7, name: "Challenge 7" },
    { id: 7, name: "Challenge 7" },

    { id: 7, name: "Challenge 7" },

    { id: 7, name: "Challenge 7" },

    { id: 7, name: "Challenge 7" },

    { id: 7, name: "Challenge 7" },
    { id: 7, name: "Challenge 7" },
    { id: 7, name: "Challenge 7" },
    { id: 7, name: "Challenge 7" },
    { id: 7, name: "Challenge 7" },
    { id: 7, name: "Challenge 7" },
    { id: 7, name: "Challenge 7" },
    

  ];

  return (
    <Box
      sx={{
        m: 2,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "flex-start",
      }}
    >
      {challenges.map((challenge, index) => (
        <Box
          key={index}
          sx={{
            flex: "0 0 25%", // Each item takes 25% of the container width (4 columns)
            maxWidth: "25%", // Ensures consistent column sizing
            boxSizing: "border-box",
            padding: "8px", // Add spacing between cards
          }}
        >
          <ChallengeCard challenge={challenge} />
        </Box>
      ))}
    </Box>
  );
}

export default ChallengeList;
