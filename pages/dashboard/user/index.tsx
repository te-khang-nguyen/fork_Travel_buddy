import React from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";

interface UserDashboardProps {
  totalChallenges: number;
  completedChallenges: number;
}

const UserDashboard: React.FC<UserDashboardProps> = ({
  totalChallenges = 0,
  completedChallenges = 0,
}) => {
  return (
    <Box
      sx={{
        p: 3,
        flexDirection: "column",
        gap: 2,
        display: "flex",
      }}
    >
      <Typography variant="h4" gutterBottom>
        User Dashboard
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "row", gap: 10 }}>
        <Card
          sx={{
            width: "90%",
            maxWidth: 500,

            textAlign: "center",
            boxShadow: 3,
            p: 2,
          }}
        >
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Total Challenges
            </Typography>
            <Typography variant="h3">{totalChallenges}</Typography>
          </CardContent>
        </Card>
        <Card
          sx={{
            width: "90%",
            maxWidth: 500,

            textAlign: "center",
            boxShadow: 3,
            p: 2,
          }}
        >
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Completed Challenges
            </Typography>
            <Typography variant="h3">{completedChallenges}</Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default UserDashboard;
