import React, { useState } from "react";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import { useCreateDestinationMutation, DestinationReq } from "@/libs/services/business/destination";
import { useUploadImageMutation, useUploadVideoMutation } from "@/libs/services/storage/upload";
import { useRouter } from "next/router";
import TextInputForUser from "@/app/components/generic_components/TextInputForUser";
import CustomImageUpload from "@/app/components/destination/CustomImageUpload";
import { useForm } from "react-hook-form";
import { Controller } from "react-hook-form";
import VideoInput from "@/app/components/destination/VideoInput";

interface FormData {
    email: string;
    name: string;
    description: string;
    destination_title: string;
    thumbnail_image?: string | File; 
    other_images?: string[];
    primary_video?: string | File;
  }

const CreateDestinationForm: React.FC = () => {
    const router = useRouter();
    const [uploadImage] = useUploadImageMutation();
    const [uploadVideo] = useUploadVideoMutation();
    const [createDestination] = useCreateDestinationMutation();
    const [formData, setFormData] = useState({
        destination_title: "",
        description: "",
        // Add more fields as needed
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData((prevData) => ({
            ...prevData,
            [field]: value,
        }));
    };

    const { handleSubmit, control } = useForm<FormData>({
        defaultValues: {
            destination_title: "",
          description: "",
        },
      });

    // const [thumbnail, setThumbnail] = useState<string | null>(null);
    // const [background, setBackground] = useState<string | null>(null);

    const [thumbnail, setThumbnail] = useState<
        Array<{ image: string | null; name: string | null }>
    >([]);
  
    const handlePrimaryPhotoUpload = (uploadedImages) => {
        setThumbnail(uploadedImages);
    };
    const handleOtherPhotosUpload = (uploadedImages) => {
        setThumbnail(uploadedImages);
    };

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const onSubmit = async (data: any) => {
        try {
            let thumbnailUrl = "";
            if (data.thumbnail_image) {
                const thumbnailResponse = await uploadImage({
                    imageBase64: data.thumbnail_image[0].image,
                    title: "DestinationThumbnail",
                    bucket: "destination",
                }).unwrap();
                thumbnailUrl = thumbnailResponse.signedUrl || "";
            }

            const otherImagesUrl: string[] = [];
            if (data.other_images) {
                for (const other_image of data.other_images) {
                    const otherImagesResponse = await uploadImage({
                        imageBase64: other_image.image,
                        title: "DestinationOtherImage",
                        bucket: "destination",
                    }).unwrap();
                    otherImagesUrl.push(otherImagesResponse?.signedUrl || "");
                }
            }
            let videoUrl = "";
            if (data.video) {
                const videoResponse = await uploadVideo({
                    videoBase64: data.video,
                    title: "DestinationVideo",
                    bucket: "destination",
                }).unwrap();
                videoUrl = videoResponse.signedUrl || "";
            }

            const { 
                data: newDestinationData 
            } = await createDestination({
                name: data.destination_title,
                description: data.description,
                address: data.address || '',
                primary_keyword: data.primary_keyword || '',
                url_slug: data.url_slug || data.destination_title.toLowerCase().replace(/\s+/g, '-'),
                thumbnail_description: data.thumbnail_description || '',
                primary_photo: thumbnailUrl,
                photos: otherImagesUrl,
                primary_video: videoUrl,
            });

            await router.replace(`/destination`);
            return;
        } catch (error) {
            console.error("Full Error in onSubmit:", error);
        }
    };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        minHeight: "100vh",
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
          mt: 4,
          mb: 4,
          overflowY: "visible"
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", marginBottom: 2 }}>
          Create a New Destination
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>

            <TextInputForUser 
                num_rows={1}
                control={control}
                item_name="destination_title"
                optional={false} 
            />

            {/* Primary Photo */}
            <Controller
                name="thumbnail_image"
                control={control}
                render={({ field: { onChange, value } }) => (
                    <CustomImageUpload
                        text_display="Thumbnail Image"
                        optional={true}
                        allowMultiple={false}
                        handleImageUpload={handlePrimaryPhotoUpload}
                        onChange={onChange}
                    />
                )}
            />

            {/* Other Photos */}
            <Controller
                name="other_images"
                control={control}
                render={({ field: { onChange, value } }) => (
                    <CustomImageUpload
                        text_display="Other photos"
                        optional={true}
                        allowMultiple={true}
                        handleImageUpload={handlePrimaryPhotoUpload}
                        onChange={onChange}
                    />
                )}
            />

            <TextInputForUser 
                num_rows={1}
                control={control}
                item_name="address"
                optional={true} 
            />

            <TextInputForUser 
                control={control}
                num_rows={1}
                item_name="primary_keyword"
                optional={true} 
            />

            {/* URL Slug */}
            <TextInputForUser 
                control={control}
                num_rows={1}
                item_name="url_slug"
                optional={true} 
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

            {/* Primary Video */}
            <VideoInput
                name="video"
                control={control}
                label="Upload your video"
                rules={{ required: "Video is required" }}
            />

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
                Submit
            </Button>
            </Box>
      </form>
      </Paper>
    </Box>
  );
};

export default CreateDestinationForm;