import React, { useState, useEffect } from "react";
import { PiCompassFill } from "react-icons/pi";
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Container,
  CircularProgress,
} from "@mui/material";
import GenericModal from "@/app/components/kits/Modal";

interface EditorModalProps {
  open: boolean;
  onClose: () => void;
  header: string;
  subheader?: string;
  textValue: string;
  onConfirmation: (text: string) => void;
  isLoading?: boolean;
  textFieldLabel?: string;
  placeholder?: string;
  buttonText: string;
  storageTextVarName: string;
  styling?: {
    buttonColor?: any;
    multiline?: boolean;
    rows?: number;
    enableCloseButton?: boolean;
  };
}

const EditorModal: React.FC<EditorModalProps> = ({
  open,
  onClose,
  header,
  subheader,
  textValue,
  onConfirmation,
  isLoading,
  textFieldLabel,
  placeholder,
  buttonText,
  storageTextVarName,
  styling,
}) => {

  const persistedText = sessionStorage.getItem(storageTextVarName);
  const [text, setText] = useState<string>("");

  useEffect(()=>{
    setText(persistedText || textValue || "");
  },[textValue])

  const handleConfirmation = () => {
    if (text.trim() && !isLoading) {
      onConfirmation(text);
      sessionStorage.setItem(storageTextVarName, "");
    }
  };

  return (
    <GenericModal 
        open={open} 
        onClose={onClose}
        sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          
        }}
      >
        <Paper
                elevation={3}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  padding: 4,
                  borderRadius: 2,
                  width: "100%",
                  minWidth: 800,
                  maxHeight: "90vh",
                  overflowY: "auto",
                  gap: 2
                }}
        >
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
          }}
        >
          {header}
        </Typography>

        {subheader && <Typography variant="body1">{subheader}</Typography>}

        <TextField
          value={text}
          label={textFieldLabel || ""}
          placeholder={placeholder || ""}
          multiline={styling?.multiline}
          rows={styling?.rows}
          onChange={(e) => {
            setText(e.target.value);
            sessionStorage.setItem(storageTextVarName, e.target.value);
          }}
        />

        <Box
          gap="1rem"
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            p: 2,
          }}
        >
          {styling?.enableCloseButton && (
            <Button
              onClick={onClose}
              variant="outlined"
              color={"inherit"}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}

          {isLoading && <CircularProgress size={34} />}
          <Button
            onClick={handleConfirmation}
            variant="contained"
            disabled={isLoading}
            sx={{
                boxShadow:0,
                color: "white",
                backgroundColor: isLoading ? "grey" : "black"
            }}
          >
            {isLoading ? "Loading..." : `${buttonText}`}
          </Button>
        </Box>
        </Paper>
      </Box>
    </GenericModal>
  );
};

export default EditorModal;
