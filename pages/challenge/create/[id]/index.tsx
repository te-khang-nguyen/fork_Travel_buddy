import { 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableRow, 
  Paper, 
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import LocationCard from "@/app/components/challenge/LocationCard";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { styled } from "@mui/system";

import { useGetLocationsByChallengeIdQuery } from "@/libs/services/business/location";
import {
  useGetChallengeQuery,
} from "@/libs/services/user/challenge";

import {
  useUploadImageMutation
} from "@/libs/services/storage/upload";

import {
  useUpdateChallengeMutation,
  useDeleteChallengeMutation,
} from "@/libs/services/business/challenge";

interface Challenge {
  title: string;
  description: string;
  thumbnailUrl: string;
  backgroundUrl: string;
  tourSchedule: string;
}

const MOCK_CHALLENGE = {
  title: '',
  description: '',
  thumbnailUrl: '',
  backgroundUrl: '',
  tourSchedule: '',
}

const ImagePreview = styled("img")({
  width: "100px",
  height: "100px",
  objectFit: "cover",
  borderRadius: "8px",
});



const ChallengeLocations = () => {
  const router = useRouter();
  const [snackbar, setSnackbar] = useState<{
      open: boolean;
      message: string;
      severity: "success" | "error";
    }>({
      open: false,
      message: "",
      severity: "success",
    });
  
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });
  const challengeId = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
  const {
    data: locationData
  } = useGetLocationsByChallengeIdQuery(challengeId!)
  const [challenge, setChallenge] = useState<Challenge>(MOCK_CHALLENGE);
  const [updatedChallenge, setUpdatedChallenge] = useState<Challenge>(MOCK_CHALLENGE);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setUpdatedChallenge((prev) => ({ ...prev, [name]: value }));
  };

  const [uploadImage] = useUploadImageMutation();

  const handleImageUpload = (
      e: React.ChangeEvent<HTMLInputElement>, 
      config: {
          type: 'thumbnail' | 'background';
          onUploadSuccess?: (signedUrl: string) => void;
          bucket?: string;
      }
  ) => {
      if (e.target.files && e.target.files[0]) {
          const fileReader = new FileReader();
          
          fileReader.onload = async () => {
              try {
                  // Upload the image and get the signed URL
                  const imageUploadResponse = await uploadImage({
                      imageBase64: fileReader.result as string,
                      title: config.type === 'thumbnail' ? "ChallengeThumbnail" : "ChallengeBackground",
                      bucket: config.bucket || "challenge",
                  }).unwrap();
  
                  // Update the state based on the type
                  if (config.type === 'thumbnail') {
                      setUpdatedChallenge((prev) => ({ 
                          ...prev, 
                          thumbnailUrl: imageUploadResponse.signedUrl || prev.thumbnailUrl
                      }));
                  } else if (config.type === 'background') {
                      setUpdatedChallenge((prev) => ({ 
                          ...prev, 
                          backgroundUrl: imageUploadResponse.signedUrl || prev.backgroundUrl
                      }));
                  }
                  
                  // Optional custom success handler
                  // if (config.onUploadSuccess) {
                  //     config.onUploadSuccess(imageUploadResponse.signedUrl);
                  // }
              } catch (error) {
                  console.error("Error uploading image:", error);
                  // Optionally, show an error message to the user
              }
          };
  
          fileReader.readAsDataURL(e.target.files[0]);
      }
  };
  const { 
    data: challengeData 
  } = useGetChallengeQuery({
    challengeId: challengeId
  }, {
    skip: !challengeId
  });

  useEffect(() => {
      if (challengeData?.data && challengeData.data.length > 0) {
          const { 
              title, 
              description, 
              thumbnailUrl, 
              backgroundUrl, 
              tourSchedule 
          } = challengeData.data[0];
          const challengeNewDetails = { title, description, thumbnailUrl, backgroundUrl, tourSchedule };
          setChallenge(challengeNewDetails);
          setUpdatedChallenge(challengeNewDetails);
      }
  }, [challengeData]);

  const [updateChallenge] = useUpdateChallengeMutation();
  const handleSaveChanges = async () => {
      const updatedChallengeData = {
          id: challengeId || '',
          data: updatedChallenge
      };
      try {
          await updateChallenge(updatedChallengeData).unwrap();
      } catch (error) {
          console.error("Error updating challenge:", error);
      }
      setSnackbar({
        open: true,
        message: "Changes is saved successfully",
        severity: "success",
      });
  };

  const handleAddLocation = async () => {
      router.push(`/challenge/create/${challengeId}/location`);
  }

  const handleSubmitChallenge = async () => {
    await updateChallenge({
      id: challengeId || '',
      data: { status: "ACTIVE" }
    }).unwrap();
    setSnackbar({
      open: true,
      message: "Challenge is PUSBLISHED",
      severity: "success",
    });
    router.prefetch('/profile/business#challenges');
    router.push('/profile/business#challenges');
  };

  const [deleteChallenge] = useDeleteChallengeMutation();
  const handleDeleteChallenge = async () => {
    if (!challengeId) {
      console.error('Challenge ID is undefined');
      return;
    }
    await deleteChallenge({id: challengeId}).unwrap();
    setSnackbar({
      open: true,
      message: "Challenge is now DISABLE for the PUBLIC!",
      severity: "success",
    });
  }

  return (
    <Box
      sx={{ 
        display:'flex',
        flexDirection: 'column',
        padding: "2rem", 
        backgroundColor: "#f8f9fa", 
        minHeight: "100vh" 
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: "1.5rem",
        }}
      >
        <Typography variant="h4" fontWeight="bold" sx={{ flexGrow: 1 }}>
          Challenge Locations
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="success"
            sx={{ marginRight: "1rem", marginBottom: { xs: "0.5rem", sm: 0 } }}
            onClick={handleSubmitChallenge}
          >
            Submit Challenge
          </Button>
          <Button
            variant="contained"
            color="error"
            sx={{ marginRight: "1rem", marginBottom: { xs: "0.5rem", sm: 0 } }}
            onClick={handleDeleteChallenge}
          >
            Delete Challenge
          </Button>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={()=>{router.replace('/dashboard/business')}}
          >
            Back to Portal
          </Button>
        </Box>
      </Box>

      {/* Locations */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1.5rem",
          justifyContent: { xs: "center", sm: "space-between" },
        }}
      >
        {/* Add New Location Card */}
        <Box
          onClick={() => {
            router.push(`/challenge/create/${challengeId}/location`);
          }}
          sx={{
            flex: "1 1 calc(100% - 1.5rem)", // Full width on small screens
            maxWidth: { sm: "calc(50% - 1.5rem)", md: "calc(33.33% - 1.5rem)" },
            border: "2px dashed #ddd",
            borderRadius: "8px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            textAlign: "center",
            padding: "1rem",
          }}
        >
          <Box>
            <AddIcon sx={{ fontSize: 40, color: "#666" }} />
            <Typography variant="subtitle1" color="textSecondary">
              Add New Location
            </Typography>
          </Box>
        </Box>

        {/* Location Cards */}
        {locationData?.data?.map((location, index) => (
          <LocationCard
            key={index}
            location={location}
            onClick={() => router.push(`/challenge/create/${challengeId}/location/${location.id}`)} 
          />
        ))}
      </Box>
      {/* Challenge Details */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1.5rem",
          justifyContent: { 
            xs: "center", 
            sm: "space-between" 
          },
          mt: 4,
        }}
      >
      <Card sx={{ width: "70%", boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        Please update your challenge details
                    </Typography>
                </Box>
                <TableContainer component={Paper}>
                <Table>
                    <TableBody>
                    <TableRow>
                        <TableCell sx={{ width: '30%' }}><b>Current</b></TableCell>
                        <TableCell sx={{ width: '70%' }}><b>Update</b></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell
                            sx={{
                                whiteSpace: 'pre-wrap',
                                wordWrap: 'break-word'
                            }}>
                            {challenge.title.replace(/\\n/g, '\n')}
                        </TableCell>
                        <TableCell>
                        <TextField
                            fullWidth
                            name="title"
                            label="Title"
                            variant="outlined"
                            value={updatedChallenge.title}
                            onChange={handleInputChange}
                        />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell
                            sx={{
                                whiteSpace: 'pre-wrap',
                                wordWrap: 'break-word'
                            }}>
                            {challenge.description.replace(/\\n/g, '\n')}
                        </TableCell>
                        <TableCell>
                        <TextField
                            fullWidth
                            name="description"
                            label="Description"
                            multiline
                            rows={4}
                            variant="outlined"
                            value={updatedChallenge.description}
                            onChange={handleInputChange}
                        />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                        <ImagePreview src={challenge.thumbnailUrl} alt="Current Thumbnail" />
                        </TableCell>
                        <TableCell>
                        <input
                            accept="image/*"
                            type="file"
                            onChange={(e) => handleImageUpload(e, { type: 'thumbnail' })}
                        />
                        {updatedChallenge.thumbnailUrl && <ImagePreview src={updatedChallenge.thumbnailUrl} alt="Updated Thumbnail" />}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                        <ImagePreview src={challenge.backgroundUrl} alt="Current Background" />
                        </TableCell>
                        <TableCell>
                        <input
                            accept="image/*"
                            type="file"
                            onChange={(e) => handleImageUpload(e, { type: 'background' })}
                        />
                        {updatedChallenge.backgroundUrl && <ImagePreview src={updatedChallenge.backgroundUrl} alt="Updated Background" />}
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell
                            sx={{
                                whiteSpace: 'pre-wrap',
                                wordWrap: 'break-word'
                            }}>
                            {challenge.tourSchedule.replace(/\\n/g, '\n')}
                        </TableCell>
                        <TableCell>
                        <TextField
                            fullWidth
                            name="tourSchedule"
                            label="Tour Schedule"
                            multiline
                            rows={10}
                            variant="outlined"
                            value={updatedChallenge.tourSchedule}
                            onChange={handleInputChange}
                        />
                        </TableCell>
                    </TableRow>
                    </TableBody>
                </Table>
                <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSaveChanges}>Save Changes</Button>
                </TableContainer>
            </CardContent>
        </Card>
        </Box>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={20000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
    </Box>
  );
};

export default ChallengeLocations;
