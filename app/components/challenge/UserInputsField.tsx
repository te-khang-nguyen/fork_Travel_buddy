import React, { useState } from "react";
import {
  Typography,
  Box,
  TextField,
  Button
} from "@mui/material";
import ImageUploader from "../image_picker/ImagePicker";

interface CunstomInputsFieldProps {
  index: number;
  onInputsUpload: (locationInputs: {
    index: number;
    userQuestionSubmission: string | null;
    userMediaSubmission: (string | null)[];
  }) => void;
}

const CunstomInputsField: React.FC<CunstomInputsFieldProps> = ({ index, onInputsUpload }) => {

  const [inputTexts, setInputTexts] = useState('');
  const [uploadedImg, setUploadedImg] = useState<
    Array<{ image: string | null, name: string | null }>>([{ image: "", name: "" }]);

    const handleImageUpload = (uploadedImages) => {
      setUploadedImg(uploadedImages);
    };
  
    const handleConfirm = () => {
      onInputsUpload(
        {
          index: index,
          userQuestionSubmission: inputTexts,
          userMediaSubmission: uploadedImg.map((img) => {
            return img.image;
          })
        }
      );
    };

  return (
    <Box sx={{ p: 2 }} >
      <Typography sx={{ color: "white" }}>Your Story</Typography>
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
      <ImageUploader onImageUpload={handleImageUpload} fetchImages={uploadedImg} />

      <Button
        variant="contained"
        color="primary"
        sx={{
          mt: 2,
          display: "block",
        }}
        onClick={handleConfirm}
      >
        Confirm
      </Button>


    </Box>
  );
};

export default CunstomInputsField;
