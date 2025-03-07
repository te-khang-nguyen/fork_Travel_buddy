import React, { useState } from "react";
import { Box, Typography, TextField, Button, Paper, CircularProgress } from "@mui/material";
import { useCreateDestinationMutation, DestinationReq, useCreateDestinationDetailsMutation } from "@/libs/services/business/destination";
import { useUploadImageMutation, useUploadImagesMutation, useUploadVideoMutation } from "@/libs/services/storage/upload";
import { useRouter } from "next/router";
import TextInputForUser from "@/app/components/generic_components/TextInputForUser";
import ImageInput from "@/app/components/destination/CustomImageUpload";
import { useForm } from "react-hook-form";
import { Controller } from "react-hook-form";
import VideoInput from "@/app/components/destination/VideoInput";
import CustomAccordionList from "@/app/components/generic_components/SectionWithCustomStyling"; 
import AdminDetails from "@/app/components/destination/AdminDetails";

interface FormData {
    email: string;
    name: string;
    description: string;
    destination_title: string;
    thumbnail_image?: string | File; 
    other_images?: string[];
    primary_video?: string | File;
  }

interface ExtendedImageData extends ImageData {
    image: string;
}


const mockItems = [
{
    header: "Item 1",
    content: "This is the content for item 1",
    lastUploads: {
    lastUploadedTexts: ["Last text 1"],
    lastUploadedImgs: ["image1.png"],
    },
},
{
    header: "Item 2",
    content: <div>Content for item 2</div>,
    lastUploads: {
    lastUploadedTexts: ["Last text 2"],
    lastUploadedImgs: ["image2.png"],
    },
},
];

function getDesDetailsInput(input: any): any[] {
    const mappedArray: any[] = [];
    const ALLOWED_TYPES = ["historical_context", "famous_visitors", "photography_tips"];

    for (const key in input) {
        const match = key.match(/(\w+)_\d+-?(text|image)?/);
        if (!match) continue;
    
        const [, type, dataType] = match;
        if (!ALLOWED_TYPES.includes(type)) continue;
    
        const existingEntry = mappedArray.find((entry) => entry.type === type && entry.text);
        
        if (dataType === "text" && typeof input[key] === "string") {
            mappedArray.push({ type, text: input[key] as string, image: null });
        }
    
        if (dataType === "image" && Array.isArray(input[key])) {
            const images = input[key] as ExtendedImageData[];
            const imageUrls = images.map((img) => img.image);
    
            if (existingEntry) {
            existingEntry.image = imageUrls.length > 1 ? imageUrls : imageUrls[0];
            } else {
            mappedArray.push({ type, text: "", image: imageUrls.length > 1 ? imageUrls : imageUrls[0] });
            }
        }
    }
    return mappedArray;
}

const CreateDestinationForm: React.FC = () => {
    const router = useRouter();
    const {destination_id} = router.query;
    const [uploadImage] = useUploadImageMutation();
    const [uploadVideo] = useUploadVideoMutation();

    const [uploadImages] = useUploadImagesMutation();
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

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const [createDestinationDetails] = useCreateDestinationDetailsMutation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);
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
            if (data.banner_video) {
                const videoResponse = await uploadVideo({
                    videoBase64: data.banner_video[0].image,
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

            const des_details_input = getDesDetailsInput(data);
            for (const element of des_details_input) {
                const uploadImgResponse = await uploadImages({
                    imagesBase64: Array.isArray(element.image) ? element.image : [element.image], // convert single image to array
                    title: 'test',
                    bucket: 'destination',
                }).unwrap();
                element["imageSupabaseUrl"] = uploadImgResponse.signedUrls;
                await createDestinationDetails({
                    destination_id : `${newDestinationData?.data.id}`,
                    type : element.type,
                    name : "test",
                    text : element.text,
                    media : element.imageSupabaseUrl,
                })
            };
            await router.replace(`/destination/${newDestinationData?.data.id}/edit`);
            setIsSubmitting(false);
            return;
        } catch (error) {
            console.error("Full Error in onSubmit:", error);
        }
    };
    // const onSubmit = async (data: any) => {
    //     const des_details_input = getDesDetailsInput(data);
    //     for (const element of des_details_input) {
    //         const uploadImgResponse = await uploadImages({
    //             imagesBase64: Array.isArray(element.image) ? element.image : [element.image], // convert single image to array
    //             title: 'test',
    //             bucket: 'destination',
    //         }).unwrap();
    //         element["imageSupabaseUrl"] = uploadImgResponse.signedUrls;
    //         await createDestinationDetails({
    //             destination_id : "testcode",
    //             type : element.type,
    //             name : "test",
    //             text : element.text,
    //             media : element.imageSupabaseUrl,
    //         })
    //     };
    // }

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
                name="banner_video"
                optional={true}
                control={control}
                label="Upload your video"
            />

            {/* Primary Photo */}
            <ImageInput name="thumbnail_image" text_display="Thumbnail Image" control={control}
                optional={false} allowMultiple={false} />

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

            {/* Other Photos */}
            <ImageInput name="other_images" text_display="Other Photos" control={control} />

            <AdminDetails initialDetails={[]} control={control}/>

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

export default CreateDestinationForm;