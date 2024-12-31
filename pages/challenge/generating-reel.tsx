import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import { 
  useGetUserSubmissionsQuery
} from "@/libs/services/user/challenge";


const GeneratingReelPage: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [videoPath, setVideoPath] = useState('');

  const {
    data: userSubmissionData, 
    error: userSubmissionError
  } = useGetUserSubmissionsQuery();

  const userSubmittedMedias = userSubmissionData?.data.flatMap(
    submission => submission.userChallengeSubmission?.flatMap(
      challengeSubmission => challengeSubmission.userMediaSubmission || []
    ) || []
  );

  useEffect(() => {
    const generateReel = async () => {
      try {
        const response = await fetch('/api/generating-reel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            images: userSubmittedMedias 
          }),
        });

        // Optional: handle the response
        const result = await response.json();
        console.log("RESULT", result.videoPath)
        
        if (result.success) {
          setVideoPath(result.videoPath);
          setIsGenerating(false);
        } else {
          // Handle any errors from the API
          console.error('Reel generation failed:', result.message);
          setIsGenerating(false);
        }
      } catch (error) {
        console.error('Error submitting images:', error);
        setIsGenerating(false);
      }
    };

    // Only run if we have media
    if (userSubmittedMedias && userSubmittedMedias.length > 0) {
      generateReel();
    }
  }, [userSubmittedMedias]);


  return (
    <Box 
      sx={{
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        textAlign: 'center',
        backgroundColor: '#f0f0f0'
      }}
    >
      {isGenerating ? (
        <>
          <Typography variant="h4" sx={{ mb: 4 }}>
            Generating Your Reel
          </Typography>
          
          <Image 
            src="https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/challenge/goodgoodgeneral-mental-health.gif?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjaGFsbGVuZ2UvZ29vZGdvb2RnZW5lcmFsLW1lbnRhbC1oZWFsdGguZ2lmIiwiaWF0IjoxNzM1NTg3ODMyLCJleHAiOjE3NjcxMjM4MzJ9.96kHEsoouK0FGejtLxQ1TB3XDo9w49K4eblwkwwtvbk&t=2024-12-30T19%3A43%3A52.656Z"
            alt="Generating Reel" 
            width={300} 
            height={300} 
            style={{ borderRadius: '10px' }}
          />
          
          <Typography variant="body1" sx={{ mt: 4 }}>
            Please wait while we create your amazing travel reel!
          </Typography>
        </>
      ) : (
        <Box sx={{ textAlign: 'center', maxWidth: '90%', width: '100%' }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Reel Generation Complete
          </Typography>
          
          <video 
            src={videoPath} 
            controls 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '70vh', 
              borderRadius: '10px',
              margin: '0 auto'
            }}
            onError={(e) => {
              console.error('Video error:', e);
            }}
          >
            Your browser does not support the video tag.
          </video>
          
        </Box>
      )}
    </Box>
  );
};

export default GeneratingReelPage;