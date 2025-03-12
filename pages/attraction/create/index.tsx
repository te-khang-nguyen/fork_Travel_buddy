import React, { useState } from "react";
import { Box, Typography, TextField, Button, Paper, CircularProgress } from "@mui/material";
import { useUploadImageMutation, useUploadImagesMutation, useUploadVideoMutation } from "@/libs/services/storage/upload";
import { useRouter } from "next/router";
import TextInputForUser from "@/app/components/generic_components/TextInputForUser";
import ImageInput from "@/app/components/destination/CustomImageUpload";
import { useForm } from "react-hook-form";
import DestinationDropbox from "@/app/components/destination/DestinationDropbox";
import { useCreateAttractionMutation } from "@/libs/services/business/attraction";
import { useCreateMediaAssetMutation } from "@/libs/services/storage/upload";

interface FormData {
    email: string;
    name: string;
    description: string;
    attraction_title: string;
    thumbnail_image?: string | File; 
    other_images?: string[];
    primary_video?: string | File;
  }

const CreateAttractionForm: React.FC = () => {
    const router = useRouter();
    const { destination_id } = router.query;
    const [uploadImage] = useUploadImageMutation();
    const [createMediaAsset] = useCreateMediaAssetMutation();
    const [createAttraction] = useCreateAttractionMutation();

    const { handleSubmit, control } = useForm<FormData>({
        defaultValues: {
            attraction_title: "",
          description: "",
        },
      });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);
            let thumbnailUrl = "";
            let image_id = "";
            if (data.thumbnail_image) {
                const thumbnailResponse = await uploadImage({
                    imageBase64: data.thumbnail_image[0].image,
                    title: "AttractionThumbnail",
                    bucket: "attraction",
                }).unwrap();
                thumbnailUrl = thumbnailResponse.signedUrl || "";
                const mediaAssetResponse = await createMediaAsset({
                    signedUrl: thumbnailUrl,
                    mimeType: 'image',
                    usage: 'thumbnail',
                }).unwrap();
                image_id = mediaAssetResponse.data.id || "";
            }
            
            const { 
                data: newAttractionData 
            } = await createAttraction({
                destination_id: data.destination_id,
                title: data.attraction_title,
                description: data.description,
                description_thumbnail: data.thumbnail_description || '',
                primary_photo: thumbnailUrl,
                primary_photo_id: image_id,
                // order_of_appearance: -1,
            });
            await router.replace(`/attraction/${newAttractionData?.data.id}/edit`);
            setIsSubmitting(false);
            return;
        } catch (error) {
            console.error("Full Error in onSubmit:", error);
        }
    };

  return (
    <Box
        sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            backgroundColor: "#f4f4f4",
            padding: 2,
            overflowY: "auto",
            scrollBehavior: "smooth"
        }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 800,
          padding: 4,
          borderRadius: 2,
          mt: 10,
          mb: 4,
          overflowY: "visible",
          boxShadow: "0px 2px 10px rgba(0,0,0,0.2)"
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", marginBottom: 2 }}>
          Create a New Attraction
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>

            {/* Choosing destination */}
            <DestinationDropbox 
                control={control}
                title="Destinations"
                optional={false} 
                default_value={String(destination_id)}
            />

            {/* Primary Photo */}
            <ImageInput name="thumbnail_image" text_display="Thumbnail Image" control={control}
                optional={false} allowMultiple={false} />

            {/* Thumbnail Description */}
            <TextInputForUser 
                control={control}
                num_rows={1}
                item_name="attraction_title"
                optional={false} 
            />

            {/* Description */}
            <TextInputForUser 
                control={control}
                num_rows={4}
                item_name="description"
                optional={false} 
            />

            {/* Thumbnail Description */}
            <TextInputForUser 
                control={control}
                num_rows={1}
                item_name="thumbnail_description"
                optional={false} 
            />

            {/* Other Photos */}
            <ImageInput name="other_images" text_display="Other Photos" control={control} />

            <Box mt={2}>
            <Button type="submit" variant="contained" color="primary"
                fullWidth
                sx={{
                  width: "100%",
                  marginTop: 3,
                  textTransform: "none",
                  padding: 1.5,
                }}
            >
                {isSubmitting ? (
                    <Box display="flex" alignItems="center">
                        <CircularProgress size={24} color="inherit" />
                        <span style={{ marginLeft: 8 }}>Submitting...</span>
                    </Box>
                ) : (
                    "Submit"
                )}
            </Button>
            </Box>
      </form>
      </Paper>
    </Box>
  );
};

export default CreateAttractionForm;