import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";

interface ChallengeFormInputs {
  title: string;
  description: string;
  thumbnail: File | null;
  backgroundImage: File | null;
}

const CreateChallengeForm: React.FC = () => {
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ChallengeFormInputs>({
    defaultValues: {
      title: "",
      description: "",
      thumbnail: null,
      backgroundImage: null,
    },
  });

  const [thumbnailName, setThumbnailName] = useState<string | null>(null);
  const [backgroundName, setBackgroundName] = useState<string | null>(null);

  const onSubmit = (data: ChallengeFormInputs) => {
    console.log("Form Data:", data);
  };

  const handleFileChange = (
    name: keyof ChallengeFormInputs,
    file: File | null
  ) => {
    setValue(name, file);
    if (name === "thumbnail") {
      setThumbnailName(file ? file.name : null);
    } else if (name === "backgroundImage") {
      setBackgroundName(file ? file.name : null);
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
      }}
    >
      <Paper
        elevation={3}
        sx={{
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
              <Controller
                name="thumbnail"
                control={control}
                rules={{ required: "Thumbnail is required" }}
                render={({ field }) => (
                  <Box sx={{display:'flex', flexDirection:'row',alignItems:'center' ,gap:1}}>
                    <Button
                      variant="contained"
                      component="label"
                      color="primary"
                      sx={{borderRadius:14, textTransform: "none", marginBottom: 1 }}
                    >
                      Choose File
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files
                            ? e.target.files[0]
                            : null;
                          handleFileChange("thumbnail", file);
                          field.onChange(file); // Update react-hook-form state
                        }}
                      />
                    </Button>
                    {thumbnailName && (
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        Selected File: {thumbnailName}
                      </Typography>
                    )}
                    {errors.thumbnail && (
                      <Typography variant="caption" color="error">
                        {errors.thumbnail.message}
                      </Typography>
                    )}
                  </Box>
                )}
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
              <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                <Button
                  variant="contained"
                  component="label"
                  color="primary"
                  sx={{ borderRadius:14, textTransform: "none", marginBottom: 1 }}
                >
                  Choose File
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files ? e.target.files[0] : null;
                      handleFileChange("backgroundImage", file);
                    }}
                  />
                </Button>
                {backgroundName && (
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Selected File: {backgroundName}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Submit Button */}

            <Button
            fullWidth
              type="submit"
              variant="contained"
              color="primary"
              sx={{width:'100%', marginTop: 3, textTransform: "none",  padding: 1.5 }}
            >
              Save Challenge
            </Button>
     
        </form>
      </Paper>
    </Box>
  );
};

export default CreateChallengeForm;
