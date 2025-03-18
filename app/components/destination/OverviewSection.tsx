import { Typography, TextField, Paper, Box, Button } from "@mui/material";
import { useState } from "react";
// import { Destination, useUpdateDestinationMutation } from "@/libs/services/business/destination";
import { Experience, useUpdateExperienceMutation } from "@/libs/services/business/experience";
import { useRouter } from "next/router";

interface OverviewSectionProps {
    destination: Experience;
    edit_mode?: boolean;
}

const OverviewSection: React.FC<OverviewSectionProps> = ({ destination, edit_mode = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState(destination.description);
    const router = useRouter();
    const { destination_id } = router.query;
    // const [updateDestination] = useUpdateDestinationMutation();
    const [updateDestination] = useUpdateExperienceMutation();

    const handleDescriptionChange = () => {
      updateDestination({
        id: String(destination_id),
        data: {
            description
        }
      })
      setIsEditing(false);
    };

    const handleSave = () => {
      setIsEditing(false);
    };

    return(
      <Paper elevation={0} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Overview
        </Typography>
        {edit_mode && isEditing ? (
          <Box sx={{ mb: 2 }}>
            <TextField
              multiline
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              variant="outlined"
              fullWidth
              minRows={3}
              maxRows={10}
            />
            <Button 
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleDescriptionChange()} 
              variant="contained" 
              sx={{ mt: 1 }}
            >
                Save
            </Button>
            <Button 
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => setIsEditing(false)} 
              variant="contained" 
              sx={{ mt: 1, ml: 3, bgcolor: 'grey.500' }}
            >
                Cancel
            </Button>
          </Box>
        ) : (
          <Typography variant="body1" paragraph onClick={() => edit_mode && setIsEditing(true)}>
            {description}
          </Typography>
        )}
      </Paper>
    )
  }

export default OverviewSection;