import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CunstomInputsField from "../challenge/UserInputsField";

interface AccordionItem {
  header: string;
  content: React.ReactNode;
}

interface CustomAccordionListProps {
  items: AccordionItem[];
  onInputsUpload: (locationInputs: {
    userQuestionSubmission: string | null;
    userMediaSubmission: (string | null)[];
  }[]) => void;
}


const CustomAccordionList: React.FC<CustomAccordionListProps> = ({ items,  onInputsUpload}) => {


  const handleInputsUpload = async (userInputs) => {
    onInputsUpload(userInputs);
  };

  return (
    <Box
    
    >
      {items.map((item, index) => (
        <Accordion key={index} defaultExpanded sx={{ border:'2px solid white', backgroundColor: '#2c3e50' , borderRadius: 1, }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color:'white'}} />}>
            <Typography sx={{color:"white"}}>{item.header}</Typography>
          </AccordionSummary>
          <Divider sx={{ backgroundColor: "#ffffff", opacity: 1,height:1.5 }} />
          <AccordionDetails sx={{p:0,}}>
            {typeof item.content === "string" ? (
         
               <Typography sx={{p:2  ,color:'white'}}>{item.content}</Typography>
   
            ) : (
              item.content
            )}
          <CunstomInputsField index={index} onInputsUpload={handleInputsUpload} />
          </AccordionDetails>
            
        </Accordion>
      ))}
    </Box>
  );
};

export default CustomAccordionList;
