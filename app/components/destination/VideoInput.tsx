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
  const [videoPreview, setVideoPreview] = React.useState<string | null>(null);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => {
        const { onChange } = field;
        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          // Ensure only one file is selected
          if (e.target.files && e.target.files.length === 1) {
            const file = e.target.files[0];
            
            // Verify it's a video file
            if (!file.type.startsWith('video/')) {
              // Optional: Add error handling for non-video files
              return;
            }
            
            // Convert file to base64
            const reader = new FileReader();
            reader.onload = (event) => {
              // Pass the base64 string to onChange
              const base64String = event.target?.result as string;
              onChange(base64String);
              
              // Create video thumbnail preview
              const videoElement = document.createElement('video');
              videoElement.preload = 'metadata';
              videoElement.src = base64String;
              
              videoElement.onloadedmetadata = () => {
                // Seek to a specific time (e.g., 1 second into the video)
                videoElement.currentTime = Math.min(1, videoElement.duration / 2);
              };

              videoElement.onseeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = videoElement.videoWidth;
                canvas.height = videoElement.videoHeight;
                const ctx = canvas.getContext('2d');
                
                if (ctx) {
                  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                  const thumbnailDataUrl = canvas.toDataURL('image/jpeg');
                  setVideoPreview(thumbnailDataUrl);
                }
              };
            };
            reader.readAsDataURL(file);
          }
        };

        return (
          <Box mt={2} marginBottom={5}>
            <Typography
                variant="body2"
                sx={{ marginBottom: 2, fontWeight: 500 }}
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
            <Button
              variant="outlined"
              component="label"
              sx={{ width: '20%', borderRadius: 1, boxShadow: 'none', }}
            >
              Upload Video
              <input 
                type="file" 
                accept="video/*" 
                hidden 
                onChange={handleFileChange} 
                multiple={false}  // Explicitly prevent multiple file selection
              />
            </Button>
            {videoPreview && (
              <Box mt={2}>
                <Typography variant="body2" sx={{ marginBottom: 0.5, fontWeight: 100 }}>
                  Preview
                </Typography>
                <img 
                  src={videoPreview} 
                  alt="Video Thumbnail" 
                  style={{ 
                    maxWidth: '200px', 
                    maxHeight: '200px', 
                    objectFit: 'contain' 
                  }} 
                />
              </Box>
            )}
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
