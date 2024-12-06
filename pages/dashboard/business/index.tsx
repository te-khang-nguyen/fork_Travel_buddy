import React from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";

interface BusinessDashboardProps {
  totalChallenges: number;
  totalParticipants: number;
  participantsOverTime: { [date: string]: number }; // e.g., { "2024-01-01": 120 }
  participantsPerChallenge: { [challengeName: string]: number }; // e.g., { "Challenge A": 50 }
  peakTrafficTime: string; // e.g., "2:00 PM - 3:00 PM"
}

const BusinessDashboard: React.FC<BusinessDashboardProps> = ({
  totalChallenges = 0,
  totalParticipants = 0,
  participantsOverTime = {},
  participantsPerChallenge = {},
  peakTrafficTime = "N/A",
}) => {
  return (
    <Box
      sx={{
        p: 3,
        flexDirection: "column",
        gap: 3,
        display: "flex",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Business Dashboard
      </Typography>
      
      {/* Total Challenges */}
      <Card
        sx={{
          textAlign: "center",
          boxShadow: 3,
          p: 2,
        }}
      >
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Total Challenges Created
          </Typography>
          <Typography variant="h3">{totalChallenges}</Typography>
        </CardContent>
      </Card>

      {/* Total Participants */}
      <Card
        sx={{
          textAlign: "center",
          boxShadow: 3,
          p: 2,
        }}
      >
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Total Participants
          </Typography>
          <Typography variant="h3">{totalParticipants}</Typography>
        </CardContent>
      </Card>

      {/* Participants Over Time */}
      <Card
        sx={{
          textAlign: "center",
          boxShadow: 3,
          p: 2,
        }}
      >
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Participants Over Time
          </Typography>
          <Box sx={{ textAlign: "left" }}>
            {Object.entries(participantsOverTime).map(([date, count]) => (
              <Typography key={date}>
                {date}: {count} participants
              </Typography>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Participants Per Challenge */}
      <Card
        sx={{
          textAlign: "center",
          boxShadow: 3,
          p: 2,
        }}
      >
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Participants Per Challenge
          </Typography>
          <Box sx={{ textAlign: "left" }}>
            {Object.entries(participantsPerChallenge).map(([challenge, count]) => (
              <Typography key={challenge}>
                {challenge}: {count} participants
              </Typography>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Peak Traffic Time */}
      <Card
        sx={{
          textAlign: "center",
          boxShadow: 3,
          p: 2,
        }}
      >
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Peak Traffic Time
          </Typography>
          <Typography variant="h3">{peakTrafficTime}</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BusinessDashboard;
