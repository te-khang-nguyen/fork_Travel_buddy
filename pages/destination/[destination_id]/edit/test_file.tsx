import { useState } from "react";
import { Box, Typography, IconButton, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

const TravelPage = () => {
  const [editMode, setEditMode] = useState(false);

  return (
    <Box sx={{ position: "relative", minHeight: "100vh" }}>
      {/* ✅ Ensure Edit Mode Button is visible */}
      <Box
        sx={{
          position: "fixed", // Keep it at the top-right corner
          top: 50,
          right: 16,
          zIndex: 1000, // Highest priority
          backgroundColor: "white", // ✅ Add background to make it visible
          padding: "8px", // Some padding for better visibility
          borderRadius: "8px", // Rounded corners
          boxShadow: "0px 2px 10px rgba(0,0,0,0.2)", // ✅ Shadow for contrast
        }}
      >
        <Button
          variant="contained"
          color={editMode ? "secondary" : "primary"}
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? "Exit Edit Mode" : "Enter Edit Mode"}
        </Button>
      </Box>

      {/* Gray Overlay when Edit Mode is ON */}
      {editMode && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.05)", // Light gray tint
            backdropFilter: "blur(2px)", // Optional blur
            zIndex: 5, // ✅ Below the button, above content
            pointerEvents: "none", // ✅ Ensures clicks pass through
          }}
        />
      )}

      {/* Page Content */}
      <Box sx={{ position: "relative", zIndex: 10, padding: 4 }}>
        {/* Editable Title */}
        <Typography
          variant="h4"
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: editMode ? "pointer" : "default",
            borderBottom: editMode ? "1px dashed gray" : "none",
          }}
        >
          Travel Destination
          {editMode && (
            <IconButton size="small" sx={{ ml: 1 }}>
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </Typography>

        {/* Other Content Here */}
        <Typography variant="body1">
          This is a beautiful travel destination with breathtaking scenery and rich culture.
        </Typography>
      </Box>
    </Box>
  );
};

export default TravelPage;
