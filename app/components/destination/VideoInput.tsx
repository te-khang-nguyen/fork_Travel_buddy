import React from "react";
import { Controller, Control } from "react-hook-form";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

interface VideoInputProps {
  name: string;
  control: Control<any>;
  label: string;
  rules?: any;
  optional?: boolean;
}

function convertUnderscoreToText(str, caseType) {
    // Replace underscores with spaces
    const formattedStr = str.replace(/_/g, ' ');

    switch (caseType) {
        case 'title': // Convert to Title Case
        return formattedStr.replace(/\b\w/g, char => char.toUpperCase());

        case 'upper': // Convert to Upper Case
        return formattedStr.toUpperCase();

        case 'lower': // Convert to Lower Case
        return formattedStr.toLowerCase();

        default:
        return formattedStr; // Return as is if no valid case type is provided
    }
}


const VideoInput: React.FC<VideoInputProps> = ({ name, optional=false, control, label, rules }) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => {
        const { onChange } = field;
        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          if (e.target.files && e.target.files.length > 0) {
            // For single video upload, take the first file
            const file = e.target.files[0];
            
            // Convert file to base64
            const reader = new FileReader();
            reader.onload = (event) => {
              // Pass the base64 string to onChange
              onChange(event.target?.result as string);
            };
            reader.readAsDataURL(file);
          }
        };

        return (
          <Box mt={2}>
            <Typography
                variant="body2"
                sx={{ marginBottom: 0.5, fontWeight: 500 }}
            >
                {convertUnderscoreToText(name, 'title')}
                <Typography
                    component="span"
                    color="error"
                    sx={{ marginLeft: 0.5 }}
                >
                    {!optional ? "*" : ""}
                </Typography>
            </Typography>
            <Button variant="contained" component="label">
              Upload Video
              <input 
                type="file" 
                accept="video/*" 
                hidden 
                onChange={handleFileChange} 
              />
            </Button>
            {error && (
              <Typography variant="body2" color="error">
                {error.message}
              </Typography>
            )}
          </Box>
        );
      }}
    />
  );
};

export default VideoInput;
