import React, { useState } from "react";
import { Box, Grid, Typography, TextField, Button } from "@mui/material";
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

import ButtonInEditSection from "./ButtonInEditSection";
import { useRouter } from "next/router";
import { useUpdateDestinationDetailsMutation, useDeleteDestinationDetailsMutation } from "@/libs/services/business/destination";

const IconicPhotos = ({ photos, edit_mode = false, control = null }) => {
  // State to manage editable photo names
  const transformPhotosToDict = (photos) => {
    return photos.reduce((acc, photo) => {
        acc[photo.id] = photo.name; // Add the id as the key and name as the value
        return acc;
    }, {}); // Start with an empty object
  };

  const photoDict = transformPhotosToDict(photos);
  const [editableNames, setEditableNames] = useState(photoDict);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  // Handle changes to the photo name
  const handleNameChange = (photoId: string, newName: string) => {
    setEditableNames((prev) => ({
      ...prev,
      [photoId]: newName,
    }));
  };

  const [updateDestinationDetails] = useUpdateDestinationDetailsMutation();
  const [deleteDestinationDetails] = useDeleteDestinationDetailsMutation();


  const handleSave = (photoId: string) => {
    updateDestinationDetails({
      dd_id: photoId,
      data: {
        name: editableNames[photoId] // Use the editable name for the specific photo
      }
    });
    setIsEditing(false);
  };

  return (
    <>
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: 6 }}>
        <Typography variant="h4" sx={{ lineHeight: "normal", mb: 0 }}>
          Iconic Photos
        </Typography>
        {edit_mode ? <ButtonInEditSection type="image" /> : null}
      </Box>

      <Grid container spacing={5} sx={{ mt: 4 }}>
        {photos.map((photo) => (
          <Grid item xs={6} key={photo.id}>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: 300, // fixed height for standardization
                overflow: "hidden",
                cursor: "pointer",
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            >
              {/* Delete Button */}
              {edit_mode && isEditing 
              ? (<IconButton
                aria-label="delete"
                sx={{
                  position: "absolute", // Position the button absolutely within the Box
                  top: 8, // Adjust the top position
                  right: 8, // Adjust the right position
                  zIndex: 1, // Ensure the button is above the image
                  backgroundColor: "rgba(255, 255, 255, 0.7)", // Semi-transparent background
                  '&:hover': {
                    backgroundColor: "rgba(255, 255, 255, 0.9)", // Slightly darker on hover
                  },
                }}
                onClick={() => {
                  // Add your delete logic here
                  console.log("Delete photo with ID:", photo.id);
                  deleteDestinationDetails({dd_id: photo.id}).unwrap()
                    .then(response => {
                      console.log("Delete successful:", response);
                      // Optionally, refresh the list of photos or update the state
                    })
                    .catch(error => {
                      console.error("Delete failed:", error);
                    });
                }}
              >
                <DeleteIcon />
              </IconButton>)
              : null
              }
              {/* Image */}
              <Box
                component="img"
                src={photo.url}
                alt={photo.name}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  height: "10%", // occupies bottom 10% of the container
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(128, 128, 128, 0.3)",
                  transition: "background-color 0.3s",
                  "&:hover": {
                    backgroundColor: "rgba(128, 128, 128, 0.6)",
                  },
                }}
              >
                
                {edit_mode && isEditing ? (
                  // Editable text field for photo name
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TextField
                    value={editableNames[photo.id]}
                    onChange={(e) => handleNameChange(photo.id, e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{
                      backgroundColor: "#fff",
                      borderRadius: 1,
                      "& .MuiOutlinedInput-root": {
                        color: "#000",
                      },
                    }}
                  />
                  <Button 
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSave(photo.id)} 
                    variant="contained" 
                    sx={{ height: '40px', mt: '-1px', ml: 3 }}
                  >
                      Save
                  </Button>
                  <Button 
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => setIsEditing(false)} 
                    variant="contained" 
                    sx={{ height: '40px', mt: '-1px', ml: 3, bgcolor: 'grey.500' }}
                  >
                      Cancel
                  </Button>
                </Box>
                ) : (
                  // Non-editable photo name
                  <Typography
                    variant="subtitle1"
                    onClick={() => edit_mode && setIsEditing(true)}
                    sx={{ color: "#fff" }}
                  >
                    {editableNames[photo.id] || photo.name}
                  </Typography>
                )}
                
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default IconicPhotos;