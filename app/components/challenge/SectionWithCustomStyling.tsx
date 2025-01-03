import React, {useState} from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Divider,
  SxProps,
  Theme
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CunstomInputsField from "../challenge/UserInputsField";

interface AccordionItem {
  header: string;
  content: React.ReactNode;
  lastUploads?: any
}

interface CustomAccordionListProps {
  items: AccordionItem[];
  sx?: SxProps<Theme>;  // Add optional sx prop
  onInputsUpload: (locationInputs: {
    userQuestionSubmission: string | null;
    userMediaSubmission: (string | null)[];
  }[]) => void;
  confirmStatus?: boolean
}

const CustomAccordionList: React.FC<CustomAccordionListProps> = ({
  items,
  onInputsUpload,
  sx,
  confirmStatus
}) => {

  const handleInputsUpload = async (userInputs) => {
    onInputsUpload(userInputs);
  };

  const defaultSx = {
    '& .MuiAccordion-root': {
      border: '2px solid white',
      backgroundColor: '#F5F5F5',
      borderRadius: 1,
    },
    '& .MuiAccordionSummary-root': {
      backgroundColor: '#e0e0e0',
    },
    '& .MuiAccordionSummary-content': {
      color: 'black',
    },
    '& .MuiAccordionDetails-root': {
      backgroundColor: 'white',
      color: 'text.secondary',
    }
  };

  return (
    <Box sx={{ ...defaultSx, ...sx }}>
      {items.map((item, index) => (
        <Accordion
          key={index}
          defaultExpanded
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{item.header}</Typography>
          </AccordionSummary>
          <Divider />
          <AccordionDetails>
            {typeof item.content === "string" ? (
              <Typography sx={{ p: 2 }}>{item.content}</Typography>
            ) : (
              item.content
            )}
            <CunstomInputsField 
              index={index} 
              onInputsUpload={handleInputsUpload}
              lastInputText={item.lastUploads.lastUploadedTexts}
              lastUploadedImgs={item.lastUploads.lastUploadedImgs} 
              confirmStatus={confirmStatus}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default CustomAccordionList;