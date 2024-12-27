import React from "react";
import { Box, Typography, Card, CardContent, Button } from "@mui/material";
import FastForwardIcon from '@mui/icons-material/FastForward';
import ChallengeCard from "@/app/components/challenge/ChallengeCard";
import ChallengeCarousel from "@/app/components/challenge/ChallengeCarousel";
import { useRouter } from "next/router";
import { useGetChallengeQuery, useGetUserSubmissionsQuery } from "@/libs/services/user/challenge";

interface UserDashboardProps {
  totalChallenges: number;
  completedChallenges: number;
  activeChallenges: { id: string, name: string; status: string; link: string }[];
}

interface FetchForm {
  data?: any,
  error?: any
};

const UserDashboard: React.FC<UserDashboardProps> = ({
  totalChallenges,
  completedChallenges,
  activeChallenges,
}) => {
  const router = useRouter();

  const { 
    data: challengeRef, 
    error: challengeError 
  } = useGetChallengeQuery<FetchForm>({});
  const { 
    data: historyRef, 
    error: historyError 
  } = useGetUserSubmissionsQuery<FetchForm>();

  
  let challenges;

  if (challengeError?.data || historyError?.data) {
    console.log(!challengeError?.data ? historyError?.data : challengeError?.data);
  }
  if (challengeRef?.data) {
    challenges = challengeRef?.data.map((item) => {
      return {
        id: item.id,
        name: item.title,
        image: item.thumbnailUrl
      };
    })
    console.log(challenges[0].image);
  }

  if (historyRef?.data) {
    activeChallenges = historyRef?.data.map((item) => {
      return {
        id: item.challengeId,
        name: item.challengeTitle,
        status: !item.ended ? "In progress" : "Completed",
        link: !item?.reward ? "Your reward is being prepared" : item?.reward
      };
    })
    totalChallenges = activeChallenges.length;
    completedChallenges = activeChallenges.filter((item) => item.status == 'Completed').length;
  }



  const handleContinue = (challengeId) => {
    router.push(`/challenge/${challengeId}/locations`);
  };


  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 3,
        gap: 2,
        mb: 2,

      }}
    >
      {!challenges ?
        <><Typography>No Challenges Found</Typography></> :
        <ChallengeCarousel
          challenges={challenges}
          onViewAll={() => {
            router.push('/challenge')
          }}
        />}
      <Box
        sx={{
          height: "100%",
          flexDirection: "column",
          gap: 3,
          display: "flex",
          backgroundColor: "#f9f9f9",
          borderRadius: 2,
          boxShadow: 1,
          p: 3,
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ color: "#4a90e2", fontWeight: "bold" }}
        >
          Activity
        </Typography>

        {/* Challenge Dashboard */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Challenge Dashboard
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
            <Card
              sx={{
                width: "50%",
                backgroundColor: "#dff9e7",
                color: "green",
                p: 2,
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Participated
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                  {totalChallenges}
                </Typography>
              </CardContent>
            </Card>
            <Card
              sx={{
                width: "50%",
                backgroundColor: "#f3e7fc",
                color: "purple",
                p: 2,
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Completed
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                  {completedChallenges}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Active Challenges */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Active Challenges
          </Typography>
          {!activeChallenges ?
            <Typography>
              No existing participation history
            </Typography> :
            activeChallenges.length > 0 ? (
              activeChallenges.map((challenge, index) => (
                <Card
                  key={index}
                  sx={{
                    p: 2,
                    mb: 2,
                    backgroundColor: "#fff",
                    boxShadow: 1,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {challenge.name}
                  </Typography>
                  <Typography>Status: {challenge.status}</Typography>
                  <Typography>
                    Link to Reels:{" "}
                    {challenge.link || "Your video is being prepared!"}
                  </Typography>
                  {challenge.status !== 'Completed' ?
                    <Typography align='center'>
                      <Button
                        sx={{
                          borderRadius: 14,
                          width: "150px",
                          fontSize: { xs: "0.5rem", md: "1rem" },
                        }}
                        variant="contained"
                        startIcon={<FastForwardIcon />}
                        onClick={() => { handleContinue(challenge.id) }}>

                        Continue
                      </Button>
                    </Typography> : <Typography></Typography>
                  }

                </Card>
              ))
            ) : (
              <Typography>No active challenges</Typography>
            )}
        </Box>
      </Box>
    </Box>
  );
};

export default UserDashboard;
