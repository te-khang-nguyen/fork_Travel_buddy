import React, { useState } from 'react';
import {
  Container,
  Typography,
  CircularProgress,
  Button,
  Box,
} from '@mui/material';
import { useRouter } from 'next/router';
import { 
  useGetExperienceQuery,
  useGetExperienceDetailsQuery,
  convertExperienceDetailsToFeatures,
} from "@/libs/services/user/experience";
import { useForm } from "react-hook-form";

import LoadingSkeleton from "@/app/components/kits/LoadingSkeleton";
import AdminDetails from '@/app/components/destination/AdminDetails';
import {
  useCreateExperienceDetailsMutation, 
  useDeleteExperienceDetailsMutation,
} from '@/libs/services/business/experience';
import { getDesDetailsInput } from '@/pages/destination/create';
import { useUploadImagesMutation } from '@/libs/services/storage/upload';
import GroupedFeaturesEditPage from '@/app/components/destination/DestinationDetailsEdit';

const EditExperienceDetails: React.FC = () => {

  const router = useRouter();
  const { destination_id } = router.query;
  const { data: destination, isLoading } = useGetExperienceQuery({ id: destination_id as string });
  const { data: destination_details } = useGetExperienceDetailsQuery({ id: destination_id as string })  
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleSubmit, control } = useForm<FormData>({
        defaultValues: {},
      });

  const [createExperienceDetails] = useCreateExperienceDetailsMutation();
  const [uploadImages] = useUploadImagesMutation();

  const onSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);
            const des_details_input = getDesDetailsInput(data);
            console.log("des details", des_details_input);
            for (const detail of des_details_input) {
              const uploadImgResponse = await uploadImages({
                  imagesBase64: Array.isArray(detail.image) ? detail.image : [detail.image],
                  title: 'ExperienceDetails',
                  bucket: 'destination',
              }).unwrap();
              detail["imageSupabaseUrl"] = uploadImgResponse.signedUrls;
              if (destination_id && !Array.isArray(destination_id)) {
                await createExperienceDetails({
                    experience_id: destination_id,
                    type : detail.type,
                    name : "test",
                    text : detail.text,
                    media : detail.imageSupabaseUrl,
                })
              } else {
                console.error("No destination ID or too many");
              }
            }
            await router.replace(`/destination/${destination_id}/edit`);
            
            setIsSubmitting(false);
            return;
        } catch (error) {
            console.error("Full Error in onSubmit:", error);
        }
    };
  if (isLoading) return <LoadingSkeleton isLoading={true}/>;
  return (
    <>

      {/* Rest of the Content in a Container */}
      <Container maxWidth={false} sx={{ width: '90%' }}>
        
        {destination && destination_details ? (
          <>
            {/* Features Section */}
            <GroupedFeaturesEditPage features={convertExperienceDetailsToFeatures(destination_details)} />
            <form onSubmit={handleSubmit(onSubmit)}>
              <AdminDetails initialDetails={[]} control={control} />
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
          </>
        ) : (
          <Typography variant="h6">Experience not found</Typography> // Fallback UI
        )}
      </Container>
    </>
  );
};

export default EditExperienceDetails;
