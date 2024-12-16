import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Modal,
} from "@mui/material";
import ImageUploader from "../image_picker/ImagePicker";

type ReviewNotesComponentProps = {
  open: boolean;
  onClose: () => void;
};

const ReviewNotesComponent: React.FC<ReviewNotesComponentProps> = ({
  open,
  onClose,
}) => {
  const notes = [
    {
      title: "Train Street Hanoi",
      description: "Train Street is amazing!",
    },
    {
      title: "Hoan Kiem Lake",
      description: "Lake view is cool!",
    },
    {
      title: "St. Joseph’s Cathedral",
      description: "Amazing",
    },
  ];



  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ alignSelf: "center", justifySelf: "center" ,width:'100%' }}
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
        <ImageUploader allowMultiple onImageUpload={()=>{}} />

        <Typography
          variant="h4"
          gutterBottom
          sx={{ color: "#1976d2",  }}
        >
          Review your notes
        </Typography>
        <Stack spacing={2} sx={{ width: "100%" }}>
          {notes.map((note, index) => (
            <Card key={index} sx={{ backgroundColor: "#f4f6f8" }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: "#1976d2" }}>
                  {note.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {note.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
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
          onClick={onClose}
        >
          Submit
        </Button>
      </Box>
    </Modal>
  );
};

export default ReviewNotesComponent;
