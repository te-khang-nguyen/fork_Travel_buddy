import React from "react";
import { Box, Typography, Card, Avatar } from "@mui/material";

interface BusinessDashboardProps {
  totalChallenges: number;
  activeParticipants: number;
  completedChallenges: number;
  activeChallenges: {
    challengeName: string;
    participants: number;
    entries: {
      user: string;
      location: string;
      comment: string;
      avatarUrl?: string;
    }[];
  }[];
}

const BusinessDashboard: React.FC<BusinessDashboardProps> = ({
  totalChallenges = 0,
  activeParticipants = 0,
  completedChallenges = 0,
  activeChallenges = [ {
    challengeName: "Nature Photography Contest",
    participants: 45,
    entries: [
      {
        user: "JohnDoe",
        location: "Yosemite National Park",
        comment: "Captured this amazing sunrise!",
        avatarUrl: "https://randomuser.me/api/portraits/men/1.jpg",
      },
      {
        user: "JaneSmith",
        location: "Grand Canyon",
        comment: "The view here is breathtaking!",
        avatarUrl: "https://randomuser.me/api/portraits/women/2.jpg",
      },
      {
        user: "Alex90",
        location: "Yellowstone",
        comment: "Loving the wildlife here.",
      },
    ],
  },],
}) => {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: 3,
      }}
    >
      <Box
        sx={{
          p: 3,
          height: "100%",
          flexDirection: "column",
          gap: 3,
          display: "flex",
          backgroundColor: "#f9f9f9",
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Challenge Dashboard
        </Typography>

        {/* Top Stats Panel */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            mt: 2,
          }}
        >
          {[
            {
              label: "Total Challenges",
              value: totalChallenges,
              bgColor: "#dceefb",
              color: "blue",
            },
            {
              label: "Active Participants",
              value: activeParticipants,
              bgColor: "#d4f4dd",
              color: "green",
            },
            {
              label: "Completed Challenges",
              value: completedChallenges,
              bgColor: "#f3e8ff",
              color: "purple",
            },
          ].map((stat, index) => (
            <Card
              key={index}
              sx={{
                flex: "1 1 30%",
                p: 2,
                backgroundColor: stat.bgColor,
                color: stat.color,
                boxShadow: 2,
                borderRadius: 2,
                minWidth: "200px",
              }}
            >
              <Typography variant="h6" gutterBottom>
                {stat.label}
              </Typography>
              <Typography variant="h3">{stat.value}</Typography>
            </Card>
          ))}
        </Box>

        {/* Active Challenges */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Active Challenges
          </Typography>
          {activeChallenges.map((challenge, index) => (
            <Card
              key={index}
              sx={{
                mb: 3,
                p: 2,
                boxShadow: 2,
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" gutterBottom>
                {challenge.challengeName}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Participants: {challenge.participants}
              </Typography>
              {challenge.entries.map((entry, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                    gap: 2,
                  }}
                >
                  {entry.avatarUrl ? (
                    <Avatar src={entry.avatarUrl} alt={entry.user} />
                  ) : (
                    <Avatar>{entry.user[0]}</Avatar>
                  )}
                  <Box>
                    <Typography variant="subtitle1">{entry.user}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {entry.location}
                    </Typography>
                    <Typography variant="body2">{entry.comment}</Typography>
                  </Box>
                </Box>
              ))}
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default BusinessDashboard;
