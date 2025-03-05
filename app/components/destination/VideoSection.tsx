import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';
import { useUpdateDestinationMutation } from '@/libs/services/business/destination';
import { useRouter } from 'next/router';
import { Destination } from '@/libs/services/business/destination';
import { useUploadVideoMutation } from '@/libs/services/storage/upload';

interface VideoSectionProps {
  destination: Destination;
  edit_mode?: boolean;
}

const VideoSection: React.FC<VideoSectionProps> = ({ destination, edit_mode = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const { destination_id } = router.query;
  const [uploadVideo] = useUploadVideoMutation();
  const [editingName, setEditingName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editedName, setEditedName] = useState(destination.name);
  const [editedDescription, setEditedDescription] = useState(destination.thumbnail_description);
  const [updateDestination] = useUpdateDestinationMutation();

  // Pause video and optionally disable autoplay when in edit mode
  useEffect(() => {
    if (edit_mode && videoRef.current) {
      videoRef.current.pause();
    }
  }, [edit_mode]);

  // Placeholder for handling video change
  const handleChangeVideo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (!file?.type.startsWith('video/')) {
        // Optional: Add error handling for non-video files
        console.error('Selected file is not a video');
        return;
    }
    try {
        const base64String = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result;
                if (result) {
                    // Ensure we have a data URL
                    const base64DataUrl = result as string;
                    resolve(base64DataUrl);
                } else {
                    reject(new Error('Failed to read file'));
                }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });

        const videoResponse = await uploadVideo({
            videoBase64: base64String,
            title: "DestinationVideo",
            bucket: "destination",
        }).unwrap();

        const videoUrl = videoResponse?.signedUrl || "";
        updateDestination({
            id : String(destination_id),
            data : {primary_video : videoUrl}
        });
    } catch (error) {
        console.error('Error uploading video:', error);
        // Additional error logging
        if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
        }
    }
  };

  // Placeholder for handling name change
  const handleChangeName = () => {
    updateDestination({
        id : String(destination_id),
        data : {name: editedName}
    })
    setEditingName(false);
  };

  // Placeholder for handling description change
  const handleChangeDescription = () => {
    // TODO: Add your custom description change logic here
    updateDestination({
        id : String(destination_id),
        data : {thumbnail_description: editedDescription}
    })
    setEditingDescription(false);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100vw',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        height: '600px',
        overflow: 'hidden',
        mb: 4,
      }}
    >
      <Box
        component="video"
        ref={videoRef}
        autoPlay={!edit_mode} // Disable autoplay in edit mode if desired
        loop
        muted
        playsInline
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          ...(edit_mode && { filter: 'contrast(0.5)' }), // fade video in edit mode
        }}
      >
        <source src={destination.primary_video} type="video/mp4" />
        Your browser does not support the video tag.
      </Box>
      {edit_mode && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
          }}
        >
          <Button variant="contained" component="label">
            Change Video
            <input
              type="file"
              accept="video/*"
              hidden
              onChange={handleChangeVideo}
            />
          </Button>
        </Box>
      )}
      {/* Video Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          p: 3,
          borderRadius: 2,
          width: '60%',
        }}
      >
        {edit_mode && editingName ? (
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              variant="outlined"
              InputProps={{ style: { backgroundColor: 'white', borderRadius: 4 } }}
            />
            <Button onClick={handleChangeName} variant="contained" sx={{ mt: 1, mr: 3 }}>
              Save
            </Button>
            <Button onClick={()=>setEditingName(false)} variant="contained" sx={{ mt: 1, bgcolor: 'grey.500', }}>
              Cancel
            </Button>
          </Box>
        ) : (
          <Typography
            variant="h2"
            gutterBottom
            onClick={() => edit_mode && setEditingName(true)}
            sx={{ cursor: edit_mode ? 'pointer' : 'default' }}
          >
            Welcome to {editedName}
          </Typography>
        )}
        {edit_mode && editingDescription ? (
          <Box>
            <TextField
              fullWidth
              multiline
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              variant="filled"
              InputProps={{ style: { backgroundColor: 'white', borderRadius: 4 } }}
            />
            <Button onClick={handleChangeDescription} variant="contained" sx={{ mt: 1, mr: 3}}>
              Save
            </Button>
            <Button onClick={()=>setEditingDescription(false)} variant="contained" sx={{ mt: 1, bgcolor: 'grey.500', }}>
              Cancel
            </Button>
          </Box>
        ) : (
          <Typography
            variant="subtitle1"
            onClick={() => edit_mode && setEditingDescription(true)}
            sx={{ cursor: edit_mode ? 'pointer' : 'default' }}
          >
            {editedDescription}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default VideoSection;
