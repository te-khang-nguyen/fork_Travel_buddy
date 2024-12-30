import React from "react";
import { Box, Typography } from "@mui/material";
import ChallengeCard from "@/app/components/challenge/ChallengeCard";
import { useGetChallengeQuery } from "@/libs/services/user/challenge";


interface FetchForm{
  data?: any,
  error?: any
}

function ChallengeList() {

  const {
    data: challengeData, 
    error: challengeError
  } = useGetChallengeQuery<FetchForm>({});

  let challenges: any;
  
  if(challengeError?.data) throw challengeError?.data;

  if(challengeData?.data !== undefined){
    challenges = challengeData?.data.map((item) => {
      return {id: item.id, name: item.title, image:item.thumbnailUrl};
    });
  }

  return (
    <Box
      sx={{
        m: 2,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "flex-start",
      }}
    >
      {(challenges == undefined)? 
      <Typography>
        No Existing Challenge
      </Typography>:
      challenges.map((challenge, index) => (
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
