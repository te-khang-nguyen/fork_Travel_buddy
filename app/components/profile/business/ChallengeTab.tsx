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
import { useRouter } from "next/router";
import { useGetAllChallengesQuery } from "@/libs/services/business/challenge";

// Define the Challenge interface
interface Challenge {
  id: string;
  businessid: string;
  description: string;
  thumbnailUrl: string;
  backgroundUrl: string;
  qrurl: string | null;
  price: number;
  created: string;
  title: string;
}

const ChallengesTab: React.FC = () => {
  const { data : allChallenge } = useGetAllChallengesQuery();
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const [challengeName, setChallengeName] = useState("");   

  const { chanllenge_Id, location_Id } = router.query;
  const challengeId = Array.isArray(chanllenge_Id)
    ? chanllenge_Id[0]
    : chanllenge_Id || "";
  const locationId = Array.isArray(location_Id)
    ? location_Id[0]
    : location_Id || "";

  const handleCreateNewChallenge = () => {
    router.push("/challenge/create");
  };

  const handleViewQRCode = (challenge) => {
    setModalOpen(true);
    setChallengeName(challenge.title); 
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setChallengeName("");
  };

  const handleOnClickEditChallenge = (challenge) => {
    router.push(`/challenge/create/${challenge.id}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Challenges
      </Typography>

      {/* Challenges List */}
      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        {allChallenge?.data?.map((challenge) => (
            <Card
              key={challenge.id}
              sx={{
                width: 300,
                opacity: challenge.status==='ACTIVE' ? 1 : 0.3,
              }}
            >
            <CardMedia
              component="img"
              height="140"
              image={challenge.thumbnailUrl}
              alt={challenge.title}
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {challenge.title}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {challenge.description}
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: "space-between", p: 2 }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => handleOnClickEditChallenge(challenge)}
              >
                Edit Challenge
              </Button>
              <Button
                onClick={()=>handleViewQRCode(challenge)}
                variant="contained"
                color="success"
              >
                View QR Code
              </Button>
            </CardActions>
          </Card>
        ))}

        {/* Create New Challenge Card */}
        <Card
          onClick={handleCreateNewChallenge}
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
      <QRModal
        open={modalOpen}
        onClose={handleCloseModal}
        chanllengeId={challengeId}
        displayText={challengeName}
      />
    </Box>
  );
};

export default ChallengesTab;
