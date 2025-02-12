import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import { useCreateChallengeMutation } from "@/libs/services/business/challenge";
import { useUploadImageMutation } from "@/libs/services/storage/upload";
import ImagePicker from "@/app/components/image_picker/ImagePicker";
import { useRouter } from "next/router";

interface ChallengeFormInputs {
  title: string;
  description: string;
  thumbnail: string;
  backgroundImage: string | null;
  tourSchedule: string;
}

const CreateChallengeForm: React.FC = () => {
  const router = useRouter();
  const [uploadImage] = useUploadImageMutation();
  const [createChallenge] = useCreateChallengeMutation();
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ChallengeFormInputs>({
    defaultValues: {
      title: "",
      description: "",
      thumbnail: "",
      backgroundImage: null,
      tourSchedule: "",
    },
  });

  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [background, setBackground] = useState<string | null>(null);
  

  const onSubmit = async (data: ChallengeFormInputs) => {
    try {
      
      const thumbnailResponse = await uploadImage({
        imageBase64: thumbnail,
        title: "ChallengeThumbnail",
        bucket: "challenge",
      }).unwrap();
      const thumbnailUrl = thumbnailResponse.signedUrl;
      
      let backgroundUrl = "";
      if (background) {
        const backgroundResponse = await uploadImage({
          imageBase64: background,
          title: "ChallengeBackground",
          bucket: "challenge",
        }).unwrap();
        backgroundUrl = backgroundResponse.signedUrl || "";
      }
      
      const { 
        data: newChallengeData 
      } = await createChallenge({
        title: data.title,
        description: data.description,
        thumbnail: thumbnailUrl,
        backgroundImage: backgroundUrl,
        tourSchedule: data.tourSchedule,
      });

      await router.replace(`/challenge/create/${newChallengeData?.data?.id}`);
      return;
    } catch (error) {
      console.error("Full Error in onSubmit:", error);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        backgroundColor: "#f4f4f4",
        padding: 2,
        overflow:"auto"
      }}
    >
      <Paper
        elevation={3}
        sx={{
          mt: 30,
          padding: 4,
          borderRadius: 2,
          width: "100%",
          maxWidth: 800,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold", marginBottom: 2 }}>
          Create a New Challenge
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {/* Title */}
            <Box>
              <Typography
                variant="body2"
                sx={{ marginBottom: 0.5, fontWeight: 500 }}
              >
                Challenge Title
                <Typography
                  component="span"
                  color="error"
                  sx={{ marginLeft: 0.5 }}
                >
                  *
                </Typography>
              </Typography>
              <Controller
                name="title"
                control={control}
                rules={{ required: "Challenge Title is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    variant="outlined"
                    placeholder="Enter the challenge title"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Box>

            {/* Description */}
            <Box>
              <Typography
                variant="body2"
                sx={{ marginBottom: 0.5, fontWeight: 500 }}
              >
                Challenge Description
                <Typography
                  component="span"
                  color="error"
                  sx={{ marginLeft: 0.5 }}
                >
                  *
                </Typography>
              </Typography>
              <Controller
                name="description"
                control={control}
                rules={{ required: "Challenge Description is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={4}
                    placeholder="Describe your challenge"
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Box>

            {/* Thumbnail Upload */}
            <Box>
              <Typography
                variant="body2"
                sx={{ marginBottom: 0.5, fontWeight: 500 }}
              >
                Upload Challenge Thumbnail
                <Typography
                  component="span"
                  color="error"
                  sx={{ marginLeft: 0.5 }}
                >
                  *
                </Typography>
              </Typography>
              <ImagePicker
                onImageUpload={(
                  images: Array<{ image: string | null; name: string | null }>
                ) => {
                  const image = images[0]?.image || null;
                  setThumbnail(image);
                  setValue("thumbnail", image || "");
                }}
              />
            </Box>

            {/* Background Image Upload */}
            <Box>
              <Typography
                variant="body2"
                sx={{ marginBottom: 0.5, fontWeight: 500 }}
              >
                Upload Background Image
              </Typography>
              <ImagePicker
                onImageUpload={(
                  images: Array<{ image: string | null; name: string | null }>
                ) => {
                  const image = images[0]?.image || null;
                  setBackground(image);
                  setValue("backgroundImage", image || "");
                }}
              />
            </Box>
          </Box>
          {/* Description */}
          <Box>
              <Typography
                variant="body2"
                sx={{ marginBottom: 0.5, fontWeight: 500 }}
              >
                Tour Schedule
                <Typography
                  component="span"
                  color="error"
                  sx={{ marginLeft: 0.5 }}
                >
                  *
                </Typography>
              </Typography>
              <Controller
                name="tourSchedule"
                control={control}
                rules={{ required: "Tour Schedule is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={4}
                    placeholder="Describe your tour schedule"
                    error={!!errors.tourSchedule}
                    helperText={errors.tourSchedule?.message}
                  />
                )}
              />
            </Box>
          {/* Submit Button */}

          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            sx={{
              width: "100%",
              marginTop: 3,
              textTransform: "none",
              padding: 1.5,
            }}
          >
            Save Challenge
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateChallengeForm;
