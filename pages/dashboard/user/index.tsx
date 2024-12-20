import React from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import ChallengeCarousel from "@/app/components/challenge/ChallengeCarousel";
import { useRouter } from "next/router";

interface UserDashboardProps {
  totalChallenges: number;
  completedChallenges: number;
  activeChallenges: { name: string; status: string; link: string }[];
}

const UserDashboard: React.FC<UserDashboardProps> = ({
  totalChallenges = 0,
  completedChallenges = 0,
  activeChallenges = [{ name: "Test", status: "done", link: "https:123.com" }],
}) => {
  const router = useRouter()
  const challenges = [
    {
      id: 1,
      name: "Challenge 1",
    },
    { id: 2, name: "Challenge 2" },
    {
      id: 3,
      name: "Challenge 3",
    },
    {
      id: 3,
      name: "Challenge 3",
    },
    {
      id: 3,
      name: "Challenge 3",
    },
    {
      id: 3,
      name: "Challenge 3",
    },
    {
      id: 3,
      name: "Challenge 3",
    },
    {
      id: 3,
      name: "Challenge 3",
    },

  ];
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
      <ChallengeCarousel
        challenges={challenges}
        onViewAll={() => {
          router.push('/challenge')
        }}
      />
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
          {activeChallenges.length > 0 ? (
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
