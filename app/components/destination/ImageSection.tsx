import { Box, Button, Typography, TextField } from "@mui/material";
import { Destination } from "@/libs/services/business/destination";
import { useRouter } from 'next/router';
import { useUploadImageMutation } from '@/libs/services/storage/upload';
import { useUpdateDestinationMutation } from '@/libs/services/business/destination';
import { useState } from 'react';

interface ImageSectionProps {
    destination: Destination;
    edit_mode?: boolean;
}

const ImageSection: React.FC<ImageSectionProps> = ({destination, edit_mode}) => {
    const router = useRouter();
    const { destination_id } = router.query;
    const [uploadImage] = useUploadImageMutation();
    const [editingName, setEditingName] = useState(false);
    const [editingDescription, setEditingDescription] = useState(false);
    const [editedName, setEditedName] = useState(destination.name);
    const [editedDescription, setEditedDescription] = useState(destination.thumbnail_description);
    const [updateDestination] = useUpdateDestinationMutation();

    const handleChangeImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files && event.target.files[0];
        if (!file?.type.startsWith('image/')) {
            // Optional: Add error handling for non-image files
            console.error('Selected file is not an image');
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
                reader.readAsDataURL(file);
            });
            const imageResponse = await uploadImage({
                imageBase64: base64String,
                title: "DestinationImage",
                bucket: "destination",
            }).unwrap();
            const imageUrl = imageResponse?.signedUrl || "";
            updateDestination({
                id : String(destination_id),
                data : {primary_photo : imageUrl}
            });
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    // Placeholder for handling name change
    const handleChangeName = async () => {
        await updateDestination({
            id : String(destination_id),
            data : {name: editedName}
        })
        setEditingName(false);
    }

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
        <img
          src={destination.primary_photo}
          alt="Destination"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        {edit_mode && (
            <Box
            sx={{
                position: 'absolute',
                top: 16,
                right: 16,
            }}
            >
            <Button variant="contained" component="label">
                Change Image
                <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleChangeImage}
                />
            </Button>
            </Box>
        )}
        {/* Image Overlay */}
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
                {editedName}
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
  }

export default ImageSection;