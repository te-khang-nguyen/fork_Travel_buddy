import React, { useState } from "react";
import { Box, Button, Typography, Dialog, DialogTitle, DialogContent } from "@mui/material";
import { Feature } from "./DestinationDetails";
// import { useDeleteDestinationDetailsMutation } from "@/libs/services/business/destination";
import { useDeleteExperienceDetailsMutation } from "@/libs/services/business/experience";

interface GroupedFeaturesEditPageProps {
  features: Feature[];
}

const GroupedFeaturesEditPage: React.FC<GroupedFeaturesEditPageProps> = ({ features }) => {
    const [groupedFeatures, setGroupedFeatures] = useState<Record<string, Feature[]>>(
        features.reduce((acc: Record<string, Feature[]>, feature) => {
        if (!acc[feature.type]) {
            acc[feature.type] = [];
        }
        acc[feature.type].push(feature);
        return acc;
        }, {})
    );

    // Handle deletion of a feature
    const handleDelete = async (type: string, id: string) => {
        try {
        // Call your API to delete the feature
        await deleteFeatureFromAPI(type, id);

        // Update the state to remove the deleted feature
        setGroupedFeatures((prev) => ({
            ...prev,
            [type]: prev[type].filter((feature) => feature.id !== id),
        }));
        } catch (error) {
        console.error("Failed to delete feature:", error);
        }
    };

    // Format type for display (e.g., "historical_context" → "Historical Context")
    const formatType = (type: string) =>
        type
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    // Shorten text for display
    const shortenText = (text: string, maxLength: number = 100) => {
        return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
    };

    // const [deleteDesDetails] = useDeleteDestinationDetailsMutation();
    const [deleteDesDetails] = useDeleteExperienceDetailsMutation();
    const deleteFeatureFromAPI = async (type: string, id: string) => {
        // Replace with your actual API call
        console.log(`Deleting feature of type ${type} with id ${id}`);
        deleteDesDetails({dd_id: id}).unwrap()
        .then(response => {
            console.log("Delete successful:", response);
            // Optionally, refresh the list of photos or update the state
        })
        .catch(error => {
            console.error("Delete failed:", error);
        });
        return new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay
    };

  return (
    <Box display="flex" gap={3} padding={3}>
      {Object.entries(groupedFeatures).map(([type, items]) => (
        <Box
          key={type}
          flex={1}
          border={1}
          borderColor="lightgray"
          borderRadius={2}
          padding={2}
        >
          <Box textAlign="center" fontSize="1.5rem" fontWeight="bold" mb={2}>
            {formatType(type)}
          </Box>
          {items.map((item) => (
            <Box
              key={item.id}
              position="relative"
              border={1}
              borderColor="lightgray"
              borderRadius={2}
              padding={2}
              mb={2}
            >
              {/* Delete button */}
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => handleDelete(type, item.id)}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  minWidth: "auto",
                  padding: "4px 8px",
                }}
              >
                Delete
              </Button>

              {/* Item details */}
              <Box>
                <Box fontSize="1.1rem" fontWeight="bold" mb={1}>
                  {item.name}
                </Box>
                <Typography variant="body1" mb={1}>
                  {shortenText(item.text)}
                </Typography>
                {/* Display thumbnails for the first one or two images */}
                {item.media && item.media.length > 0 && (
                  <Box display="flex" gap={1} mt={1}>
                    {item.media.slice(0, 2).map((image, index) => (
                      <Box
                        key={index}
                        component="img"
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 1,
                          objectFit: "cover",
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default GroupedFeaturesEditPage;