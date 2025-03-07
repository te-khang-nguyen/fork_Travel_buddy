import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import TextInputForUser from '@/app/components/generic_components/TextInputForUser';
import ImageInput from '@/app/components/destination/CustomImageUpload';

interface Detail {
  id: number;
  type: string;
  text: string;
  images: string[];
}

interface AdminDetailsProps {
  control: any; // the react-hook-form control
  initialDetails?: Detail[];
}

const DetailAccordionItem: React.FC<{
  detail: Detail;
  index: number;
  control: any;
  onDelete: (id: number) => void;
}> = ({ detail, index, control, onDelete }) => {
  // Generate a field name that will be used in form data, e.g. "historical_context_1-text"
  const formattedType = detail.type.toLowerCase().replace(/\s/g, '_');
  const textFieldName = `${formattedType}_${index + 1}-text`;
  const imageFieldName = `${formattedType}_${index + 1}-image`;

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ alignItems: 'center' }}>
        <Typography sx={{ flexGrow: 1 }}>{detail.type}</Typography>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onDelete(detail.id);
          }}
          size="small"
          color="error"
        >
          <DeleteIcon />
        </IconButton>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Text input for description */}
          <TextInputForUser
            item_name={textFieldName}
            control={control}
            defaultValue={detail.text}
            optional={true}
            num_rows={3}
          />
          {/* Image input for file upload */}
          <ImageInput
            name={imageFieldName}
            text_display={detail.text}
            control={control}
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

const AdminDetails: React.FC<AdminDetailsProps> = ({ control, initialDetails = [] }) => {
  const [details, setDetails] = React.useState<Detail[]>(initialDetails);

  const addDetail = (type: string) => {
    const newDetail: Detail = {
      id: Date.now(), // Use a more robust unique id in production
      type,
      text: '',
      images: []
    };
    setDetails((prev) => [...prev, newDetail]);
  };

  const deleteDetail = (id: number) => {
    setDetails((prev) => {
      const index = prev.findIndex((d) => d.id === id);
      if (index !== -1) {
        const detailToDelete = prev[index];
        const formattedType = detailToDelete.type.toLowerCase().replace(/\s/g, '_');
        const textFieldName = `${formattedType}_${index + 1}-text`;
        const imageFieldName = `${formattedType}_${index + 1}-image`;
        
        // Unregister the fields so they're removed from form data.
        if (control.unregister) {
          control.unregister(textFieldName);
          control.unregister(imageFieldName);
        } else {
          console.warn("control.unregister is not available");
        }
      }
      return prev.filter((detail) => detail.id !== id);
    });
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={() => addDetail('Historical Context')} sx={{ mr: 1 }}>
          Add Historical Context
        </Button>
        <Button variant="contained" onClick={() => addDetail('Famous Visitors')} sx={{ mr: 1 }}>
          Add Famous Visitors
        </Button>
        <Button variant="contained" onClick={() => addDetail('Photography Tips')}>
          Add Photography Tips
        </Button>
      </Box>

      {details.map((detail, index) => (
        <DetailAccordionItem
          key={detail.id}
          detail={detail}
          index={index}
          control={control}
          onDelete={deleteDetail}
        />
      ))}
    </Box>
  );
};

export default AdminDetails;
