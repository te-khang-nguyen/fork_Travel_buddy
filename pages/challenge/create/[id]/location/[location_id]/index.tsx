import { Box, Card, CardContent, CircularProgress, TextField, Button, Table, TableBody, TableCell, TableContainer, TableRow, Paper, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import { styled } from "@mui/system";

import { useRouter } from "next/router";

import {
    useUpdateLocationMutation,
    useDeleteLocationMutation
 } from "@/libs/services/business/location";
import { useGetLocationsQuery } from "@/libs/services/user/challenge";
import { useUploadImageMutation } from "@/libs/services/storage/upload";
  
interface Location {
    id: string;
    challengeid: string;
    title: string;
    location_info: {
        id: string | number;
        media: string[];
        title: string;
        instruction: string;
    }[]
    imageurls: string[];
    created: string;
    status: string;
  }  

const MOCK_LOCATION = {
    "id": "8bdcbfb6-9b0e-4ca6-92b4-2a3061bbf6ea",
    "challengeid": "59f3ce3b-79c8-47dd-906b-24034d935dff",
    "title": "Cho Ben Thanh",
    "location_info": [
        {
            "id": 1,
            "media": [
                "https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/challenge/b1dac327-94c7-45bc-91f7-354e5d1cf1b2/Demo%20Challenge/BenThanh_inside.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjaGFsbGVuZ2UvYjFkYWMzMjctOTRjNy00NWJjLTkxZjctMzU0ZTVkMWNmMWIyL0RlbW8gQ2hhbGxlbmdlL0JlblRoYW5oX2luc2lkZS53ZWJwIiwiaWF0IjoxNzM1MjcyNzY1LCJleHAiOjE3NjY4MDg3NjV9.PUp7kkbQ-Lm-ICmInKSmSxy42TFUGzM0FF7DGMBGg5A&t=2024-12-27T04%3A19%3A14.888Z"
            ],
            "title": "Entrance Pose",
            "instruction": "Pose Idea: Stand with your arms outstretched or in a welcoming pose to show the excitement of entering the market.\nTip: Capture the iconic clock tower in the background. Go for a wide-angle shot to include the vibrant market activity."
        },
        {
            "id": 2,
            "media": [
                "https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/challenge/b1dac327-94c7-45bc-91f7-354e5d1cf1b2/Demo%20Challenge/BenThanh_background.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjaGFsbGVuZ2UvYjFkYWMzMjctOTRjNy00NWJjLTkxZjctMzU0ZTVkMWNmMWIyL0RlbW8gQ2hhbGxlbmdlL0JlblRoYW5oX2JhY2tncm91bmQud2VicCIsImlhdCI6MTczNTMzMzU5OCwiZXhwIjoxNzY2ODY5NTk4fQ.tvoXNts5JVt_3bkKkx4Yn3U_G9T-NAS4dZXsObp51pE&t=2024-12-27T21%3A06%3A38.951Z"
            ],
            "title": "Enjoy your street foods with style",
            "instruction": "Pose Idea: Hold a traditional Vietnamese snack or fruit like a dragon fruit or a banh mi sandwich.\nTip: Smile naturally or pretend to take a bite for a candid feel. Use the colorful food stalls as your backdrop."
        },
        {
            "id": 3,
            "media": [
                "https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/challenge/b1dac327-94c7-45bc-91f7-354e5d1cf1b2/Demo%20Challenge/BenThanh_thumbnail.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjaGFsbGVuZ2UvYjFkYWMzMjctOTRjNy00NWJjLTkxZjctMzU0ZTVkMWNmMWIyL0RlbW8gQ2hhbGxlbmdlL0JlblRoYW5oX3RodW1ibmFpbC53ZWJwIiwiaWF0IjoxNzM1MzMzNjQxLCJleHAiOjE3NjY4Njk2NDF9.Zk8f17kYNByBlllnAE3nxzv2caq2cpoyQrqB54nf18Y&t=2024-12-27T21%3A07%3A21.948Z"
            ],
            "title": "Try out some clothes at the vendors",
            "instruction": "Pose Idea: Try on an ao dai (traditional Vietnamese dress) or hold it up as if considering a purchase.\nTip: Make sure the stall’s vibrant textiles are visible in your shot."
        }
    ],
    "imageurls": [
        "https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/challenge/b1dac327-94c7-45bc-91f7-354e5d1cf1b2/Demo%20Challenge/BenThanh_inside.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjaGFsbGVuZ2UvYjFkYWMzMjctOTRjNy00NWJjLTkxZjctMzU0ZTVkMWNmMWIyL0RlbW8gQ2hhbGxlbmdlL0JlblRoYW5oX2luc2lkZS53ZWJwIiwiaWF0IjoxNzM1MjcyNzY1LCJleHAiOjE3NjY4MDg3NjV9.PUp7kkbQ-Lm-ICmInKSmSxy42TFUGzM0FF7DGMBGg5A&t=2024-12-27T04%3A19%3A14.888Z"
    ],
    "created": "2024-12-22T16:26:38.996747+00:00",
    "status": "ACTIVE"
};

const ImagePreview = styled("img")({
    width: "100px",
    height: "100px",
    objectFit: "cover",
    borderRadius: "8px",
});
  
const ChallengeLocations = () => {
    const [originalLocation, setOriginalLocation] = useState<Location>(MOCK_LOCATION);
    const [location, setLocation] = useState<Location>(MOCK_LOCATION);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        // Handle nested location_info updates
        if (name.startsWith('location_info[')) {
          const match = name.match(/location_info\[(\d+)\]\.(\w+)/);
          if (match) {
            const index = parseInt(match[1], 10);
            const field = match[2];
            
            setLocation(prevLocation => {
              const updatedLocationInfo = [...prevLocation.location_info];
              updatedLocationInfo[index] = {
                ...updatedLocationInfo[index],
                [field]: value
              };
              
              return {
                ...prevLocation,
                location_info: updatedLocationInfo
              };
            });
          }
          return;
        }
        
        // Handle other potential updates
        setLocation(prevLocation => ({
          ...prevLocation,
          [name]: value
        }));
      };
    
    const [uploadImage] = useUploadImageMutation();
    const handleImageUpload = (
          e: React.ChangeEvent<HTMLInputElement>, 
          config: {
              type: 'thumbnail' | 'section';
              index: number;
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
                          title: config.type === 'thumbnail' ? "LocationThumbnail" : "LocationSections",
                          bucket: config.bucket || "challenge",
                      }).unwrap();
      
                      // Update the state based on the type
                      if (config.type === 'thumbnail') {
                          setLocation((prev) => ({ 
                              ...prev, 
                              imageurls: [
                                imageUploadResponse.signedUrl || prev.imageurls[0],
                                ...prev.imageurls.slice(1)
                            ]
                          }));
                      } else if (config.type === 'section') {
                        setLocation((prev) => ({ 
                              ...prev, 
                              location_info: prev.location_info.map((info, i) => i === config.index ? { ...info, media: [imageUploadResponse.signedUrl || info.media[0] ] } : info)
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
    const router = useRouter();
    const challenge_id = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
    const locationId = Array.isArray(router.query.location_id) ? router.query.location_id[0] : router.query.location_id;
    const [updateLocation] = useUpdateLocationMutation();
    const { data: locationsData, isFetching: locationsFetching } = useGetLocationsQuery(
      {challengeId: challenge_id,},
      {skip: !challenge_id,}
    );
    useEffect(() => {
        const location_to_set = locationsData?.data.filter((loc) => loc.id===locationId)[0];
        if (location_to_set) {
            setLocation(location_to_set);
            setOriginalLocation(location_to_set);
        }
    }, [locationsData, locationId]);
    const handleSaveChanges = async () => {
        const updatedChallengeData = {
            id: locationId || '',
            data: location
        };
        try {
            await updateLocation(updatedChallengeData).unwrap();
            router.replace('/challenge');
        } catch (error) {
            console.error("Error updating location:", error);
        }
    };

    const [deleteLocation] = useDeleteLocationMutation();
    const handleDeleteLocation = async () => {
        if (!locationId) {
            console.error('location ID is undefined');
            return;
        }
        await deleteLocation({id: locationId}).unwrap();
        router.replace('/challenge');
    }

    return (
    <Box
        sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1.5rem",
        justifyContent: { xs: "center", sm: "space-between" },
        mt: 4,
        }}
    >
    {locationsFetching ? (
        <Box 
            sx={{
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                gap: 2
            }}
        >
            <CircularProgress size={60} />
            <Typography variant="h6" color="textSecondary">
                Loading Location Details...
            </Typography>
        </Box>
    ) : (
    <Card sx={{ width: "70%", boxShadow: 3, borderRadius: 2 }}>
    <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Please update your location details
            </Typography>
            <Button
                variant="contained"
                color="error"
                sx={{ marginRight: "1rem", marginBottom: { xs: "0.5rem", sm: 0 } }}
                onClick={handleDeleteLocation}
            >
                Delete Location
            </Button>
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
                    {originalLocation.title.replace(/\\n/g, '\n')}
                </TableCell>
                <TableCell>
                <TextField
                    fullWidth
                    name="title"
                    label="Title"
                    variant="outlined"
                    value={location.title}
                    onChange={handleInputChange}
                />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell>
                <ImagePreview src={location.imageurls[0]} alt="Current Thumbnail" />
                </TableCell>
                <TableCell>
                <input
                    accept="image/*"
                    type="file"
                    onChange={(e) => handleImageUpload(e, { type: 'thumbnail', index: 0 })}
                />
                {location.imageurls[0] && <ImagePreview src={location.imageurls[0]} alt="Updated Thumbnail" />}
                </TableCell>
            </TableRow>
            {location?.location_info?.map((info, index) => (
                <React.Fragment key={index}>
                <TableRow sx={{ border: 'none' }}>
                    <TableCell colSpan={2}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            SECTION {index + 1}
                        </Typography>
                    </TableCell>
                </TableRow>
                <TableRow sx={{ 
                    border: 'none', 
                    '& td': { 
                        border: 'none',
                        padding: '8px'
                    } 
                }}>
                    <TableCell
                        sx={{
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word'
                        }}>
                        {originalLocation.location_info[index]?.title}
                    </TableCell>
                    <TableCell>
                    <TextField
                        fullWidth
                        name={`location_info[${index}].title`}
                        label="Title"
                        variant="outlined"
                        value={info.title}
                        onChange={handleInputChange}
                    />
                    </TableCell>
                </TableRow>
                <TableRow sx={{ 
                    border: 'none', 
                    '& td': { 
                        border: 'none',
                        padding: '8px'
                    } 
                }}>
                    <TableCell
                        sx={{
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word'
                        }}>
                        {originalLocation.location_info[index]?.instruction}
                    </TableCell>
                    <TableCell>
                    <TextField
                        fullWidth
                        name={`location_info[${index}].instruction`}
                        label="Instruction"
                        variant="outlined"
                        multiline
                        rows={5}
                        value={info.instruction}
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
                        <ImagePreview src={originalLocation.location_info[index]?.media[0]} alt="Current Thumbnail" />
                    </TableCell>
                    <TableCell>
                    <input
                        accept="image/*"
                        type="file"
                        onChange={(e) => handleImageUpload(e, { type: 'section', index })}
                    />
                    {info.media[0] && <ImagePreview src={info.media[0]} alt="Updated Thumbnail" />}
                    </TableCell>
                </TableRow>
                </React.Fragment>
            ))}
            </TableBody>
        </Table>
        <Button variant="contained" color="primary" onClick={handleSaveChanges} sx={{ mt: 2 }}>Save Changes</Button>
        </TableContainer>
    </CardContent>
    </Card>
    )}
    </Box>
    )
}

export default ChallengeLocations;
