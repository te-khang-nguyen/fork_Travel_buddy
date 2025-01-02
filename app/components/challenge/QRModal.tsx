import React, { useState, useEffect } from "react";
import { Box, Modal, Typography } from "@mui/material";
import QRCode from "qrcode";
import { baseUrl } from "@/app/constant";

type QRModalComponentProps = {
  chanllengeId: string;
  displayText: string;
  locationId?: string;
  open: boolean;
  onClose: () => void;
};

const QRModal: React.FC<QRModalComponentProps> = ({displayText,locationId, chanllengeId, open, onClose }) => {
  const [qr, setQr] = useState<string | null>(null);


  const url = locationId 
    ? `${baseUrl}/challenge/${chanllengeId}/locations/${locationId}`
    : `${baseUrl}/challenge/${chanllengeId}`;
  useEffect(() => {
    if (open) {
     

      QRCode.toDataURL(
        url,
        {
          scale: 10, // Higher scale value for better resolution
        },
        (err, url) => {
          if (!err) {
        setQr(url);
          }
        }
      );
    } else {
      setQr(null); // Reset QR code when the modal is closed
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          width: "90%",
          maxWidth: 600,
          maxHeight: "90vh",
          alignItems: "center",
          padding: { xs: 2, sm: 4 },
          backgroundColor: "#f9f9f9",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        {qr ? (
          <img src={qr} alt="QR Code" style={{ width: "350px" }} />
        ) : (
          <p>Loading...</p>
        )}

        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
        {displayText}
        </Typography>
      </Box>
    </Modal>
  );
};

export default QRModal;
