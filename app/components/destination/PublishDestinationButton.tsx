import { Box, Button } from "@mui/material";
import { useState } from "react";
import { Destination, useUpdateDestinationMutation } from "@/libs/services/business/destination";
import { Experience } from "@/libs/services/business/experience";
import { useRouter } from "next/router";

interface PublishButtonProps {
    destination: Experience;
}

const PublishButton: React.FC<PublishButtonProps> = ({ destination }) => {
    const router = useRouter();
    const { destination_id } = router.query;
    const [updateDestination] = useUpdateDestinationMutation();

    const [current_status, setCurrentStatus] = useState(destination.status);

    const handlePublish = async () => {
      const newStatus = current_status === 'active' ? 'inactive' : 'active';
      
      try {
        await updateDestination({
          id: String(destination_id),
          data: {
            status: newStatus
          }
        });
        setCurrentStatus(newStatus);
      } catch (error) {
        console.error('Error updating destination status:', error);
      }
    };

    return(
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Button
          onClick={handlePublish}
          color={current_status === "active" ? "warning" : "primary"}
          variant={(current_status === "active") ? "contained" : "outlined"}
          sx={{ mt: 1, mr: 3, width: '50%' }}
        >
            {(current_status === "active") ? "Archive this destination" : "Publish this destination"}
        </Button>
      </Box>
    )
  }

export default PublishButton;