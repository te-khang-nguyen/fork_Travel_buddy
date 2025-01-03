import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import { 
  useGetUserSubmissionsQuery
} from "@/libs/services/user/challenge";
import { supabase } from '@/libs/supabase/supabase_client';
import { useRouter } from "next/router";


const GeneratingReelPage: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [videoPath, setVideoPath] = useState('');
  const hasGeneratedRef = useRef(false);

  const {
    data: userSubmissionData, 
    error: userSubmissionError
  } = useGetUserSubmissionsQuery();
  const router = useRouter();
  const { challege_id } = router.query;
  const userSubmittedMedias = userSubmissionData?.data.filter(
      submission => submission.challengeId === challege_id
    ).flatMap(
      submission => submission.userChallengeSubmission?.flatMap(
        challengeSubmission => challengeSubmission.userMediaSubmission || []
      ) || []
  );

  useEffect(() => {
    const generateReel = async () => {
      // Prevent multiple generations
      if (hasGeneratedRef.current) return;
      hasGeneratedRef.current = true;

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
          // Upload video to Supabase Storage
          const videoFile = await fetch(result.videoPath);
          const videoBlob = await videoFile.blob();
          const { data: { user } } = await supabase.auth.getUser();
          const fileName = `reel_${Date.now()}.mp4`;
          const filePath = `${user?.id}/reels/${fileName}`;
          const { data, error } = await supabase.storage
            .from('challenge')
            .upload(filePath, videoBlob, {
              cacheControl: '3600',
              upsert: true,
              contentType: 'video/mp4'
            });

          if (error) {
            console.error('Error uploading video:', error);
            // Optionally handle upload error
          } else {
            // Get public URL
            const signedUrlData = await supabase.storage
              .from('challenge')
              .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year expiration
            if (signedUrlData.error) {
              console.error('Error creating signed URL:', signedUrlData.error);
            } else {
              setVideoPath(signedUrlData.data.signedUrl);
            }
          }

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

    // Only run if we have media and haven't generated before
    if (userSubmittedMedias && userSubmittedMedias.length > 0) {
      generateReel();
    }
  }, [userSubmittedMedias]); // Dependency ensures it runs when media is available


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
            unoptimized
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