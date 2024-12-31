import React, { useState } from "react";
import { Box, 
  Button, 
  IconButton, 
  Fab, 
  Typography,
  Snackbar,
  Alert 
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/router";

import defaultBackground from "@/assets/background.jpg"; // Replace with the actual background image path
import LocationCard from "@/app/components/challenge/LocationCard";
import ReviewNotesComponent from "@/app/components/challenge/ReviewModal";
import ExploreIcon from '@mui/icons-material/Explore';
import LocationStageModal from "@/app/components/challenge/LocationStageModal";
import { useGetChallengeQuery, useGetLocationsQuery, useGetProgressQuery } from "@/libs/services/user/challenge";

interface FetchForm {
  data?: any,
  error?: any
};

function JoinChallenge() {
  const router = useRouter();
  const { challege_id } = router.query;

  const [snackbar, setSnackbar] = useState<{
      open: boolean;
      message: string;
      severity: "success" | "error";
    }>({
      open: false,
      message: "",
      severity: "success",
    });
  
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });
  
  let locations;
  let bgImage = "";

  const {
    data: historyData,
    error: historyError
  } = useGetProgressQuery({ challengeId: challege_id });


  const {
    data: challengeRef, 
    error: challengeError
  } = useGetChallengeQuery<FetchForm>(
    {
      challengeId: challege_id,
    });

  

  if (challengeRef?.data) {
    bgImage = challengeRef?.data[0].backgroundurl;
  }

  const {
    data: locationsRef, 
    error: locationsError
  } = useGetLocationsQuery<FetchForm>(
    {
      challengeId: challege_id,
    });

  if(locationsError?.data) alert(locationsError?.data);

  if (locationsRef?.data) {
    const history = historyData as Array<any>;
    locations = locationsRef?.data.map((item, idx) => {
      return {
        id: item.id,
        index: idx + 1,
        title: item.title, 
        image: item.imageurls[0], 
        location_info: item.location_info,
        status: history?.map((submission)=>{
          if(item.id == submission.userChallengeSubmission[0].locationId){
            return true;
          }
        })[0]
      };
    });
  }

  const handleGoBack = () => {
    router.back();
  };


  const [modalOpen, setModalOpen] = useState(false);
  const [locationStage, setLocationStage] = useState(false);

  return (
    <Box
      sx={{
        backgroundImage: `url("${ bgImage? bgImage : defaultBackground.src }")`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100%",
        color: "white",
        textAlign: "center",
        padding: "20px",
        gap: 4,
        position: "relative",
      }}
    >
      {/* Go Back Button */}
      <IconButton
        onClick={handleGoBack}
        sx={{
          position: "absolute",
          top: "20px",
          left: "20px",
          color: "white",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          },
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      {/* Main Content */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexWrap: "wrap",
          gap: "1.5rem",
          justifyContent: { xs: "center", sm: "space-between" },
        }}
      >
        {!locations?<Typography></Typography>:
        locations.map((location,index) => (
          <LocationCard key={index} location={location} />
        ))}
      </Box>
      <ReviewNotesComponent
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      <LocationStageModal
        open={locationStage}
        onClose={() => setLocationStage(false)}
        locations={locations}
      />
      <Fab
        onClick={() => setLocationStage(true)}
        variant="extended"
        color="primary"
        aria-label="add"
        sx={{
          position: "fixed",
          bottom: 16,
          left: 16,
          borderRadius: 2, // Adjust the border radius to make the corners more or less rounded
          padding: "8px 16px", // Adjust padding for desired button size
          boxShadow: 3, // Optional, to give it a shadow for a raised effect
        }}
      >
        <ExploreIcon />
      </Fab>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setModalOpen(true)}
      >
        Submit
      </Button>
    </Box>
  );
}

export default JoinChallenge;
