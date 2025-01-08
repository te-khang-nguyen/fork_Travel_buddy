import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Paper
} from "@mui/material";
import ImageUploader from "../image_picker/ImagePicker";
import VoiceToTextButton from "./VoiceToTextButton";

interface CunstomInputsFieldProps {
  index: number;
  onInputsUpload: (locationInputs: {
    index: number;
    userQuestionSubmission: string | null;
    userMediaSubmission: (string | null)[];
  }) => void;
  lastInputText?: string | null;
  lastUploadedImgs?: Array<{ image: string | null, name: string | null }>;
  confirmStatus?: boolean;
}

const CunstomInputsField: React.FC<CunstomInputsFieldProps> = ({
  index,
  onInputsUpload,
  lastInputText = "",
  lastUploadedImgs = [],
  confirmStatus = false
}) => {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const [inputTexts, setInputTexts] = useState("");
  const [uploadedImg, setUploadedImg] = useState<
    Array<{ image: string | null, name: string | null }>
  >([]);

  useEffect(() => {
    const processedPreviousUploads: any = lastUploadedImgs?.map(async (inputObj) => {
      try {
        const response = await fetch(inputObj?.image as any);
        const blob = await response.blob();

        const reader = new FileReader();
        return new Promise<{ image: string | null; name: string | null }>((resolve) => {
          reader.onloadend = () => {
            resolve({ image: reader.result as string, name: inputObj?.name });
          };
          reader.onerror = () => {
            resolve({ image: null, name: inputObj?.name });
          };
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        return uploadedImg;
      }
    });

    Promise.all(processedPreviousUploads).then((imgArray) => {
      setInputTexts(lastInputText as any);
      setUploadedImg(imgArray);
    });
  }, [lastUploadedImgs]);

  const handleImageUpload = (uploadedImages) => {
    setUploadedImg(uploadedImages);
  };

  const handleConfirm = () => {
    if (!uploadedImg || inputTexts == "") {
      if (!uploadedImg && inputTexts == "") {
        setSnackbar({
          open: true,
          message: "Please share with us your experience! Your story will be amazing with two or more sentences and at least one image!",
          severity: "warning"
        });
      } else {
        setSnackbar({
          open: true,
          message: !uploadedImg ? "Please share at least one image!" : "Please share with us some notes!",
          severity: "warning"
        });
      }
    } else {
      onInputsUpload(
        {
          index: index,
          userQuestionSubmission: inputTexts,
          userMediaSubmission: uploadedImg?.map((img) => {
            return img.image;
          }) as any
        }
      );
    }
  };

  return (
    <Box sx={{ p: 2 }} >
      <Paper sx={{ p:2, margin:"5px" }}>
      <Typography variant="h6" sx={{ color: "#4285F4" }}>Your Story</Typography>
      <TextField
        variant="outlined"
        fullWidth
        multiline
        rows={4}
        placeholder={"Your Story... leave your notes and we will write it for you!"}
        value={inputTexts}
        sx={{
          backgroundColor: "#fff",
          color: "#000",
          borderRadius: 1,
          mt: 2,
        }}
        onChange={(e) => { setInputTexts(e.target.value) }}
      />
      <VoiceToTextButton language="en-US" onTranscribe={(e) => { setInputTexts(e) }} existingTexts={inputTexts||""}/>
      </Paper>
      
      <Paper sx={{ p:2, margin:"5px" }}>
      <Typography variant="h6" sx={{ color: "#4285F4", pb: 2 }}>Your Photos</Typography>  
      <ImageUploader allowMultiple onImageUpload={handleImageUpload} fetchImages={uploadedImg} />
      </Paper>

      <Button
        variant="contained"
        color="primary"
        sx={{
          mt: 2,
          display: "block",
        }}
        onClick={handleConfirm}
        disabled={confirmStatus}
      >
        {!confirmStatus ? "Confirm" : <CircularProgress size="20px" thickness={6.0} />}
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

export default CunstomInputsField;
