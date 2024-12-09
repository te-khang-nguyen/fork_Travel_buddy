import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  IconButton,
  CardMedia,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const LocationUI = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);

  const [imageError, setImageError] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageName(file.name);
        setSelectedImage(reader.result as string);
        setImageError(false);
      };
      reader.onerror = () => setImageError(true);
      reader.readAsDataURL(file);
    }
  };

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
            <Typography variant="h5" sx={{ mb: 3 }}>
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
            <Typography variant="h6" sx={{ mb: 1 }}>
              Location Images
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Button
                  variant="contained"
                  component="label"
                  sx={{
                    backgroundColor: "#4285F4",
                    color: "white",
                    textTransform: "none",
                    padding: "8px 16px",
                    fontSize: "14px",
                    borderRadius: "4px",
                    "&:hover": {
                      backgroundColor: "#357ae8",
                    },
                  }}
                >
                  Choose Files
                  <input
                    type="file"
                    multiple
                    hidden
                    onChange={handleImageUpload}
                  />
                </Button>
                <Typography
                  sx={{ maxWidth: "300px" }}
                  variant="body2"
                  color="textSecondary"
                >
                  {selectedImage ? imageName : "No file chosen"}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: "100%",
                  height: "300px",
                  overflow: "hidden",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  position: "relative",
                }}
              >
                <CardMedia
                  component="img"
                  src={
                    imageError || !selectedImage
                      ? "https://via.placeholder.com/600x300?text=No+Image+Available"
                      : selectedImage
                  }
                  alt="Uploaded"
                  onError={() => setImageError(true)}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
            </Box>
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
                  <Box sx={{display:'flex', flexDirection:'row' ,justifyItems:'center'}}>
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
        <Button fullWidth variant="contained"  onClick={handleSave}>
          Save
        </Button>
      </CardContent>
    </Card>
  );
};

export default LocationUI;
