import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageUploader from "@/app/components/image_picker/ImagePicker";


const LocationUI = () => {
  const [sections, setSections] = useState<
    { id: number; name: string; content: string }[]
  >([
    {
      id: 1,
      name: "Context",
      content:
        "A narrow residential street with a railway running directly through it. Built during the French colonial era, it has become a tourist attraction due to the unique experience of trains passing within inches of houses.",
    },
  ]);

  const handleAddSection = () => {
    const newId = sections.length + 1;
    setSections([
      ...sections,
      { id: newId, name: `Section ${newId}`, content: "" },
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

  const handleSave = () => {
    console.log("Saved Sections:", sections);
    alert("Sections saved successfully!");
  };

  const handleImageUpload = (image: string | null, name: string | null) => {
    console.log("Image uploaded:", { image, name });
  };

  return (
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
              defaultValue="Train Street Hanoi"
              sx={{ mb: 4 }}
            />
          </Box>

          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Reward
            </Typography>
            in progress
          </Box>

          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Location Images
            </Typography>
            <ImageUploader onImageUpload={handleImageUpload} />
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
              <Box
                key={section.id}
                sx={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  p: 2,
                  mb: 2,
                }}
              >
                <Box sx={{ mb: 2 }}>
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
                      onChange={(e) =>
                        handleNameChange(section.id, e.target.value)
                      }
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
                    onChange={(e) =>
                      handleContentChange(section.id, e.target.value)
                    }
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
        <Button fullWidth variant="contained" onClick={handleSave}>
          Save
        </Button>
      </CardContent>
    </Card>
  );
};

export default LocationUI;
