import React, { useEffect, useState } from "react";
import { Box, Typography, Skeleton} from "@mui/material";
import LoadingSkeleton from "@/app/components/kits/LoadingSkeleton";
import ChallengeCard from "@/app/components/challenge/ChallengeCard";
import { useGetChallengeQuery } from "@/libs/services/user/challenge";


interface Challenge {
  id: string;
  // add other challenge properties here
}


function ChallengeList() {
  
  const { 
    data: challengeData, 
    isLoading: isChallengeLoading, 
    error: challengeError 
  } = useGetChallengeQuery({});

  const [isLoading, setIsLoading] = useState(true);
  const [challenges, setChallenges] = useState();

  useEffect(() => {
    setIsLoading(isChallengeLoading);
    
    if (challengeData?.data) {
      setChallenges(challengeData?.data.map((item) => {
        return { id: item.id, name: item.title, image: item.thumbnailUrl };
      }));
    }
  }, [isChallengeLoading, challengeData]);

  // Handle error state
  if (challengeError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6" color="error">
          Error Loading Challenge
        </Typography>
      </Box>
    )
  }

  // If still loading, show loading state
  if (isLoading) {
    return (
      <LoadingSkeleton
        isLoading={isLoading}
      />
    );
  }

  // Render challenges when not loading
  return (
    <Box
      sx={{
        m: 2,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: !isLoading ?"flex-start":"center",
      }}
    >
      {!challenges ?
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Typography variant="h6" color="error">
            No Existing Challenge
          </Typography>
        </Box> :
        (challenges as any).map((challenge, index) => (
          <Box
            key={index}
            sx={{
              flex: {xs: "0 0 100%",sm: "0 0 50%", md: "0 0 25%", lg: "0 0 25%"}, // Each item takes 25% of the container width (4 columns)
              maxWidth: {xs: "100%", sm: "50%", md: "25%", lg: "25%"}, // Ensures consistent column sizing
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
