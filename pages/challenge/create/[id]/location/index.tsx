import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageUploader from "@/app/components/image_picker/ImagePicker";
import ImagePicker from "@/app/components/image_picker/ImagePicker";
import { useCreateLocationMutation } from "@/libs/services/business/location";
import { useRouter } from "next/router";

const Section = ({
  section,
  handleNameChange,
  handleContentChange,
  handleDeleteSection,
  handleImageUpload,
}) => (
  <Box
    sx={{
      border: "1px solid #ccc",
      borderRadius: "8px",
      p: 2,
      mb: 2,
    }}
  >
    <Box
      sx={{
        mb: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyItems: "center",
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          label="Section Name"
          value={section.name}
          onChange={(e) => handleNameChange(section.id, e.target.value)}
          sx={{ mb: 2 }}
        />
        <IconButton
          color="error"
          onClick={() => handleDeleteSection(section.id)}
        >
          <DeleteIcon />
        </IconButton>
      </Box>
      <TextField
        fullWidth
        multiline
        rows={4}
        variant="outlined"
        label="Section Content"
        value={section.content}
        onChange={(e) => handleContentChange(section.id, e.target.value)}
      />
      <ImagePicker
        allowMultiple
        onImageUpload={(images) => handleImageUpload(section.id, images)}
      />
    </Box>
  </Box>
);

const LocationUI = () => {
  const [sections, setSections] = useState<
    { id: number; name: string; content: string; media: string[] }[]
  >([
    {
      id: 0,
      name: "",
      content:"",
      media: [],
    },
  ]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const router = useRouter();
  const challengeId = router.query.id as string;

  const [locationTitle, setLocationTitle] = useState<string>();
  const [locationImages, setLocationImages] = useState<string[]>([]);

  const [createLocation] = useCreateLocationMutation();

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleAddSection = () => {
    const newId = sections.length + 1;
    setSections([
      ...sections,
      { id: newId, name: `Section ${newId}`, content: "", media: [] },
    ]);
  };

  const handleDeleteSection = (id: number) => {
    setSections(sections.filter((section) => section.id !== id));
  };

  const handleNameChange = (id: number, newName: string) => {
    setSections(
      sections.map((section) =>
        section.id === id ? { ...section, name: newName } : section
      )
    );
  };

  const handleContentChange = (id: number, newContent: string) => {
    setSections(
      sections.map((section) =>
        section.id === id ? { ...section, content: newContent } : section
      )
    );
  };

  const handleImageUpload = (id: number, images: { image: string }[]) => {
    setSections(
      sections.map((section) =>
        section.id === id
          ? { ...section, media: images.map((img) => img.image) }
          : section
      )
    );
  };

  const handleLocationImageUpload = (
    images: { image: string | null; name: string | null }[]
  ) => {
    setLocationImages(images[0]?.image ? [images[0].image] : []);
  };

  const handleSave = async () => {
    try {

      await createLocation({
        challengeId: challengeId,
        payload:{
          title: locationTitle ?? "",
          backgroundImages: locationImages, // Use the actual background image
          sections: sections.map((section) => ({
            title: section.name,
            instruction: section.content,
            media: section.media.length > 0 ? section.media : null,
          })),
        }
      });
      
      setSnackbar({
        open: true,
        message: "Create location successfully!",
        severity: "success",
      });
      router.push(`/challenge/create/${challengeId}`);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to create location. Please try again.",
        severity: "error",
      });
    }
  };

  return (
    <Box>
      <Card
        sx={{
          maxWidth: 700,
          margin: "20px auto",
          borderRadius: "8px",
          boxShadow: 3,
        }}
      >
        <CardContent>
          <Box
            sx={{ p: 3, display: "flex", flexDirection: "column", gap: "40px" }}
          >
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Location Title
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Enter location title"
                defaultValue={locationTitle}
                onChange={(e) => setLocationTitle(e.target.value)}
                sx={{ mb: 4 }}
              />
            </Box>

            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Location Images
              </Typography>
              <ImageUploader onImageUpload={handleLocationImageUpload} />
            </Box>

            <Box>
              <Box
                sx={{
                  flexDirection: "row",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Content Sections
                </Typography>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddSection}
                  sx={{ mb: 3 }}
                >
                  Add Section
                </Button>
              </Box>
              {sections.map((section) => (
                <Section
                  key={section.id}
                  section={section}
                  handleNameChange={handleNameChange}
                  handleContentChange={handleContentChange}
                  handleDeleteSection={handleDeleteSection}
                  handleImageUpload={handleImageUpload}
                />
              ))}
            </Box>
            <Button fullWidth variant="contained" onClick={handleSave}>
              Save
            </Button>
          </Box>
        </CardContent>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Card>
    </Box>
  );
};

export default LocationUI;
