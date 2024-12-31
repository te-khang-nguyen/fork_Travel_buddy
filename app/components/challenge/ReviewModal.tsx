import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Modal,
  Snackbar,
  Alert
} from "@mui/material";
import ImageUploader from "../image_picker/ImagePicker";
import { useRouter } from "next/router";
import {
  useGetProgressQuery,
  useGetLocationsQuery
} from "@/libs/services/user/challenge";

type ReviewNotesComponentProps = {
  open: boolean;
  onClose: () => void;
};

const ReviewNotesComponent: React.FC<ReviewNotesComponentProps> = ({
  open,
  onClose,
}) => {
  const router = useRouter();
  const { challege_id } = router.query;

  const {
    data: history,
    error: historyError
  } = useGetProgressQuery({ challengeId: challege_id });

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

  let fetchImages;
  let historyData;

  const {
    data: locationData,
    error: locationError
  } = useGetLocationsQuery({ challengeId: challege_id });

  if (locationData && history) {
    historyData = history[0];
    fetchImages = historyData.userChallengeSubmission?.map((submission, index) => {
      let matchedLocation = locationData?.data.filter(e => e.id == submission.locationId)[0];
      return submission.userMediaSubmission?.map((img) => {
        return { image: img, name: `Image for ${!matchedLocation? `Location ${index + 1}`: matchedLocation?.title}` };
      })

    });

    const userSubmission = historyData.userChallengeSubmission?.map((submission) => {
      let matchedLocation = locationData?.data.filter(e => e.id == submission.locationId)[0];
      return { title: matchedLocation?.title, ...submission };
    });
    historyData = userSubmission;
  }

  const [uploadedImg, setUploadedImg] = useState(fetchImages);

  const handleImageUpload = (uploadedImages) => {
    setUploadedImg(uploadedImages);
  };

  const handleSubmit = async () => {
    setSnackbar({
      open: true,
      message: "Wonderful!\nYou've completed the challenge!",
      severity: "success"
    });
    router.push('/challenge/generating-reel');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ alignSelf: "center", justifySelf: "center", width: '100%' }}
    >
      <Box
        sx={{
          width: "90%",
          maxWidth: 600,
          maxHeight: "90vh",
          margin: "auto",
          padding: { xs: 2, sm: 4 },
          backgroundColor: "#f9f9f9",
          borderRadius: 2,
          boxShadow: 3,
          overflowY: "auto",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ color: "#1976d2", }}
        >
          Upload your photos!
        </Typography>

        <ImageUploader 
          allowMultiple
          allowAddNew={false} 
          onImageUpload={handleImageUpload} 
          fetchImages={fetchImages?.flat()} 
        />

        <Typography
          variant="h4"
          gutterBottom
          sx={{ color: "#1976d2", }}
        >
          Review your notes
        </Typography>
        <Stack spacing={2} sx={{ width: "100%" }}>
          {!historyData ?
            <Typography>
              You have not shared any comments yet!
              Care to let us know your thoughts?
            </Typography>
            :

            historyData?.map((submission, index) =>
            (<Card key={index} sx={{ backgroundColor: "#f4f6f8" }}>
              <CardContent>
                <Typography variant="h5" sx={{ color: "#1976d2" }}>
                  <b>{submission.title || `Location ${index}`}</b>
                </Typography>
                <Typography variant="h6" color="textSecondary">
                  <b>Your comments:</b> {submission.userQuestionSubmission}
                </Typography>
              </CardContent>
            </Card>)
            )

          }
        </Stack>
        <Button
          variant="contained"
          color="primary"
          sx={{
            marginTop: 3,
            textTransform: "none",
            display: "block",
            width: "100%",
          }}
          onClick={handleSubmit}
          onClick={handleSubmit}
        >
          Submit
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
    </Modal>

  );
};

export default ReviewNotesComponent;
