import React, {useState, useEffect} from "react";
import { useForm, Controller } from "react-hook-form";
import useFormPersist from "react-hook-form-persist";
import { PiCompassFill } from "react-icons/pi";
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  Card,
  CircularProgress
} from "@mui/material";
import GenericModal from "@/app/components/kits/Modal";

interface SingleTextFieldProps {
  fieldName: string;
  header: string;
  rows?: number
}

interface SingleSelectionProps {
  name: string;
  icon: any;
}


interface EditorModalProps {
  open: boolean;
  onClose: () => void;
  mainTitle: string;
  collection: SingleTextFieldProps[];
  onSubmit: (data: {[x: string]: string}) => void;
  isLoading?: boolean;
  buttonText?: string;
  selections?: SingleSelectionProps[];
  buttonColor?: any;
  enableCloseButton?: boolean;
}

const TextFormModal: React.FC<EditorModalProps> = ({
  open,
  onClose,
  collection,
  mainTitle,
  onSubmit,
  buttonText,
  selections,
  isLoading,
  buttonColor,
  enableCloseButton,
}) => {

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    control
  } = useForm();

  useFormPersist("multilineModal", {
    watch, 
    setValue,
  });

  const [ mapping, setMapping ] = useState<{
    name: string;
    label: string;
    required: boolean;
    rows?: number;
  }[]>([]);

  const [ availableTypes, setAvailableTypes ] = useState<{
    name: string;
    icon: any;
  }[]>([]);

  const [ type, setType ] = useState<string>("");

  useEffect(()=>{
    if(collection){
      setMapping(collection.map((item)=>({
          name: item.fieldName || "",
          label: item.header || "",
          required: true,
          rows: item.rows || 0,
      })));
    }
  },[collection]);

  useEffect(()=>{
    if(selections){
      setAvailableTypes(selections || []);
    }
  },[selections]);

  const handleSubmission = (data: any) => {
    onSubmit({...data, channel_type: type});
  }
 
  return (
    <GenericModal 
      open={open} 
      onClose={onClose}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // alignSelf: "center"
      }}
    >
      <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        maxHeight: "160vh",
        backgroundColor: "rgba(0, 0, 0, 0)",
        padding: 2,
        overflowY: "auto",
        minWidth: 1000,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          borderRadius: 2,
          width: "100%",
          // maxWidth: 800,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", marginBottom: 2 }}>
          {mainTitle}
        </Typography>
        <form onSubmit={handleSubmit(handleSubmission)}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            {mapping.map((field) => (
              <Box
                key={field.name}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ marginBottom: 0.5, fontWeight: 500 }}
                >
                  {field.label}
                  {field.required && (
                    <Typography
                      component="span"
                      color="error"
                      sx={{ marginLeft: 0.5 }}
                    >
                      *
                    </Typography>
                  )}
                </Typography>
                <Controller
                  name={field.name}
                  control={control}
                  rules={
                    field.required
                      ? { required: `${field.label} is required` }
                      : undefined
                  }
                  render={({ field: controllerField }) => (
                    <TextField
                      {...controllerField}
                      fullWidth
                      variant="outlined"
                      error={!!errors[field.name]}
                      multiline= {field?.rows && field?.rows > 1? true : false}
                      rows={field?.rows}
                    />
                  )}
                />
              </Box>
            ))}

            <Box display='flex' flexDirection="row">
            <Typography fontWeight='fontWeightBold'>Channel type</Typography>
            <Typography
                      component="span"
                      color="error"
                      sx={{ marginLeft: 0.5 }}
                    >
                      *
                </Typography>
                </Box>
            <Box display='flex' gap='1rem' mb='0.5rem'>
            {availableTypes.map((card, index) => (
              <Card
                key={index}
                onClick={() => setType(card.name)}
                data-active={type === card.name ? '' : undefined}
                sx={{
                  cursor: 'pointer',
                  padding: '1rem',
                  height: '100%',
                  boxShadow: 0,
                  border: 2,
                  '&[data-active]': {
                    backgroundColor: 'action.selected',
                    '&:hover': {
                      backgroundColor: 'action.selectedHover',
                    },
                  },
                }}
              >
                <Box display='flex' alignItems='center' gap='0.5rem'>
                  {card.icon}
                  {card.name}
                </Box>
              </Card>
            ))}
            </Box>
          </Box>
          {enableCloseButton && (
                      <Button
                        onClick={onClose}
                        variant="outlined"
                        color={buttonColor ? buttonColor : "inherit"}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    )}
          <Box sx={{ marginTop: 3, boxShadow: 0 }}>
            <Button
              type="submit"
              variant="contained"
              sx={{ 
                textTransform: "none", 
                width: "100%", 
                padding: 1, 
                boxShadow: 0,
                fontSize: "1.2rem", 
                color: "white",
                backgroundColor: isLoading? "grey":"black"
              }}
              color={buttonColor ? buttonColor : "inherit"}
              disabled={isLoading}
            >
              {isLoading? <CircularProgress/> : buttonText ?? "Confirm"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
    </GenericModal>
  );
};

export default TextFormModal;