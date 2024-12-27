import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardMedia,
  Snackbar,
  Alert,
  Fab,
  IconButton,
} from "@mui/material";
import CustomAccordionList from "@/app/components/challenge/Section";
import defaultBackground from "@/assets/background.jpg";
import ImageUploader from "@/app/components/image_picker/ImagePicker";
import ExploreIcon from '@mui/icons-material/Explore';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationStageModal from "@/app/components/challenge/LocationStageModal";
import CunstomInputsField from "@/app/components/challenge/UserInputsField";
import { useRouter } from "next/router";
import {
  useGetChallengeQuery,
  useGetLocationsQuery,
  useUploadInputsMutation,
  useGetProgressQuery
} from "@/libs/services/user/challenge";
import { AnyARecord } from "dns";

interface FetchForm {
  data?: any,
  error?: any
};


const MainUI = () => {
  const router = useRouter();
  const { challege_id, location_id } = router.query;
  const placeholderImage =
    "https://via.placeholder.com/150?text=Image+Unavailable";

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

  let accordionItems;
  let locations;
  let chosenLocation;
  let bg;
 

  const [locationStage, setLocationStage] = useState(false);
  const [submissionUploads, setSubmissionUploads] = useState<any>([]);
  const [uploadInputs,] = useUploadInputsMutation();

  const {
    data: challengeData,
    error: challengeError
  } = useGetChallengeQuery<FetchForm>({ challengeId: challege_id });

  if (challengeError) {
    useEffect(() => {
      setSnackbar({
        open: true,
        message: challengeError?.data,
        severity: "error"
      });
    }, [snackbar, challengeError]);

  }

  if (challengeData) {
    bg = challengeData.data[0].backgroundUrl;
  }

  const {
    data: locsRef,
    error: locsError
  } = useGetLocationsQuery<FetchForm>(
    {
      challengeId: challege_id
    }
  );

  if (locsError?.data) {
    useEffect(() => {
      setSnackbar({
        open: true,
        message: locsError?.data,
        severity: "error"
      });
    }, [snackbar, locsError]);
  }

  if (locsRef) {
    locations = locsRef?.data.map((item, idx) => {
      return {
        id: item.id,
        index: idx + 1,
        title: item.title,
      }
    });
    chosenLocation = locsRef?.data.filter(e => e.id == location_id)[0];
  }

  if (chosenLocation) {
    accordionItems = chosenLocation.location_info.map((item) => {
      let display
      if (item.instruction.includes('\n')) {
        let lines = item.instruction.split('\n');
        display = lines.map((line) => {
          if (line !== '' && line !== ',') {
            return (<Typography sx={{ p: 2, color: 'white' }}>
              {line}
            </Typography>)
          }
        });
      } else {
        display = item.instruction;
      }
      return { header: item.title, content: display };
    });
  }

  const handleInputsUpload = async (userInputs) => {
    console.log("fetch",userInputs);
    setSubmissionUploads([...submissionUploads, userInputs]);
  };

  const handleSave = async () => {
    console.log("Before calling upload",submissionUploads);
    let result = await uploadInputs({
      challengeId: challege_id,
      userLocationSubmission: submissionUploads
    })

    if (result.error) {
      setSnackbar({
        open: true,
        message: result.error.data,
        severity: "error"
      });

    } else {
      setSnackbar({
        open: true,
        message: "Great sharings!\n Your notes are saved!\n Let's keep exploring",
        severity: "success"
      });
    }
  };


  const handleGoBack = () => {
    router.push(`/challenge/${challege_id}/locations`);
  };


  return (

    <Box
      sx={{
        backgroundImage: `url("${bg ? bg : defaultBackground.src}")`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100%",
        color: "white",
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
          top: "10px",
          left: "10px",
          color: "white",
          backgroundColor: "rgba(37, 31, 31, 0.91)",
          "&:hover": {
            backgroundColor: "rgba(242, 234, 234, 0.98)",
          },
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      <Card sx={{ display: 'flex', flexDirection: 'column', gap: 2, backgroundColor: " #2c3e50", width: "80%", p: 2 }}>
        <Typography variant="h3" sx={{ color: 'white' }}>{`${chosenLocation?.title}`}</Typography>
        <Box sx={{ justifyItems: 'center' }}>
          <Card
            sx={{
              //borderRadius: "8px",
              //boxShadow: 3,
              height: "60%",
              width: "100%"
            }}
          >
            <CardMedia
              component="img"
              height='250px'
              image={
                !chosenLocation ? placeholderImage : chosenLocation?.imageurls[0]
              }
              alt={`${chosenLocation?.title}` || "Location Image"}
            />
          </Card>
        </Box>
        {!accordionItems ?
          <Typography></Typography> :
          <Box>
            <CustomAccordionList items={accordionItems} onInputsUpload={handleInputsUpload}/>
          </Box>
        }
      </Card>
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
        sx={{
          mt: 2,
          display: "block",
        }}
        onClick={handleSave}
      >
        Save
      </Button>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MainUI;
