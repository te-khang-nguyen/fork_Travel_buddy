import {
  Modal,
  DialogContent,
  DialogTitle,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/router";

type LocationStageModalProps = {
  open: boolean;
  onClose: () => void;
  locations: { id: string; index: number; name: string; location_info: number }[]; // Accept entire array of locations
};

const LocationStageModal: React.FC<LocationStageModalProps> = ({
  open,
  onClose,
  locations,
}) => {
  const router = useRouter();
  const { query } = router;

  const handleCardClick = (value) => {
    router.push(`/challenge/${query?.challengeId}/locations/${value}.tsx`); //Move to location page
    onClose(); // Close the modal when a card is clicked
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        alignSelf: "center",
        justifySelf: "center",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          background: "#fff",
          maxWidth: "1200px",
          width: "700px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          position: "relative", // For positioning close button
        }}
      >
        {/* Close button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: "10px",
            right: "10px",
          }}
        >
          <CloseIcon />
        </IconButton>

        <DialogTitle variant="h4">Choose Your Location and Section</DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: "20px",
            }}
          >
            {!locations?
            <Typography></Typography>
            :
            locations.map((location) => (
              <Card
                key={location.id}
                sx={{
                  flex: 1,
                  cursor: "pointer",
                  border: "2px solid transparent", // Add a transparent border to maintain consistent size
                  "&:hover": {
                    border: "2px solid #1976d2", // Define the hover border color
                    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.3)",
                  },
                  "&:hover .MuiBox-root": {
                    backgroundColor: "#1976d2", // Change background color of the Box
                    color: "#fff", // Change text color inside the Box
                  },
                }}
                onClick={() => handleCardClick(location.id)}
              >
                <CardContent
                  style={{
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 20,
                  }}
                >
                  <Box
                    sx={{
                      width: "50px",
                      height: "50px",
                      alignContent: "center",
                      backgroundColor: "#f4f4f4",
                      borderRadius: 100,
                     
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="div"
                      style={{ fontWeight: "bold" }}
                    >
                      {location.index}
                    </Typography>
                  </Box>
                  <Typography variant="body1">{location.name}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </DialogContent>
      </Box>
    </Modal>
  );
};

export default LocationStageModal;
