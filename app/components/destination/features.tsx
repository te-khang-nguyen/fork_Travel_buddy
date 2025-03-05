import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ImageCarousel from "@/app/components/generic-component/ImageCarousel";

// Define a type for the feature
export type Feature = {
  type: string;
  name: string;
  text: string;
  media: string[];
  startIcon: string;
};

const icons = {
    famous_visitors: 'https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/destination/thumbnails/fact_sheet_best_time_to_visit.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJkZXN0aW5hdGlvbi90aHVtYm5haWxzL2ZhY3Rfc2hlZXRfYmVzdF90aW1lX3RvX3Zpc2l0LnN2ZyIsImlhdCI6MTc0MDM5MjkwNywiZXhwIjoxNzcxOTI4OTA3fQ.8JoBfIICsf_GnfGYJlCiUpeQtVia7KO-ar5bXrcCP58',
    events_festivals: 'https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/destination/thumbnails/fact_sheet_local_customs.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJkZXN0aW5hdGlvbi90aHVtYm5haWxzL2ZhY3Rfc2hlZXRfbG9jYWxfY3VzdG9tcy5zdmciLCJpYXQiOjE3NDAzOTI4OTYsImV4cCI6MTc3MTkyODg5Nn0.N9ylI3yge81vWeA00sRndamvK01R8YqTDZblM8sYCEA',
    historical_context: 'https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/destination/thumbnails/fact_sheet_getting_around.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJkZXN0aW5hdGlvbi90aHVtYm5haWxzL2ZhY3Rfc2hlZXRfZ2V0dGluZ19hcm91bmQuc3ZnIiwiaWF0IjoxNzQwMzkyOTE5LCJleHAiOjE3NzE5Mjg5MTl9.MJ0B8H8uuovBbpk49goPsdx1WuR_TzbB7C3QSbR7UBw',
    photography_tips: 'https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/destination/thumbnails/fact_sheet_tips.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJkZXN0aW5hdGlvbi90aHVtYm5haWxzL2ZhY3Rfc2hlZXRfdGlwcy5zdmciLCJpYXQiOjE3NDAzOTI4ODIsImV4cCI6MTc3MTkyODg4Mn0.38xeEWL6McXXZ6xtZU_4KVGaJQrWGMfkrcU-QMZa6KY',
};

// Define props type
type GroupedFeaturesPopupProps = {
  features: Feature[];
};

// Dialog component to display all features for a given type
const FeaturesDialog = ({ open, onClose, type, features }: { open: boolean; onClose: () => void; type: string; features: Feature[] }) => {
  // Helper to format the type (e.g. "famous_visitors" → "Famous Visitors")
  const formatType = (type: string) =>
    type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{formatType(type)}</DialogTitle>
      <DialogContent dividers>
        {features.map((feature, index) => (
          <Box key={index} mb={3}>
            <Typography variant="h6" gutterBottom>
              {feature.name}
            </Typography>
            <Typography variant="body1">{feature.text}</Typography>
            {feature.media && feature.media.length > 0 && (
              <ImageCarousel images={feature.media} />
            )}
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  );
};

// Main component that groups features by type and renders a button for each group.
const GroupedFeaturesPopup: React.FC<GroupedFeaturesPopupProps> = ({ features }) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Group features by their "type"
  const groupedFeatures = features.reduce((acc: Record<string, Feature[]>, feature) => {
    if (!acc[feature.type]) {
      acc[feature.type] = [];
    }
    acc[feature.type].push(feature);
    return acc;
  }, {});

  const handleOpen = (type: string) => {
    setSelectedType(type);
  };

  const handleClose = () => {
    setSelectedType(null);
  };

  // Format type for button label (e.g., "historical_context" → "Historical Context")
  const formatType = (type: string) =>
    type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <div>
      <Box display="flex" gap={2} mb={2}>
        {Object.keys(groupedFeatures).map((type) => (
          <Button
            variant="outlined"
            key={type}
            onClick={() => handleOpen(type)}
            sx={{
                borderColor: 'lightgray',
                backgroundColor: 'transparent',
                color: 'black',
                fontSize: '1.2rem', // bigger text
                fontWeight: 'bold',
                textTransform: 'none',
                maxHeight: 100,
                minWidth: 250,
                padding: 2,
                '&:hover': {
                  borderColor: 'lightgray',
                  backgroundColor: 'rgba(0,0,0,0.03)',
                },
            }}
            startIcon={
              <Box
                component="img"
                src={icons[type]}
                alt={type}
                sx={{ width: 90, height: 90 }}
              />
            }
          >
            {formatType(type)}
          </Button>
        ))}
      </Box>
      {selectedType && (
        <FeaturesDialog
          open={!!selectedType}
          onClose={handleClose}
          type={selectedType}
          features={groupedFeatures[selectedType]}
        />
      )}
    </div>
  );
};

export default GroupedFeaturesPopup;
