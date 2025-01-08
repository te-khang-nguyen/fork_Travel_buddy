import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  keyframes, 
  styled 
} from '@mui/material';
import Image from 'next/image';
import { useGetUserSubmissionsQuery } from "@/libs/services/user/challenge";
import { useRouter } from "next/router";
import TravelBanner from '@app/components/challenge/TravelBanner';

// Keyframes for animation
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled components for handwritten-like design
const StoryPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: '#f5f5dc', // Soft beige background
  backgroundImage: `
    linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
  `,
  backgroundSize: '20px 20px',
  borderRadius: theme.spacing(2),
  boxShadow: '0 10px 20px rgba(0,0,0,0.1), 0 6px 6px rgba(0,0,0,0.1)',
  position: 'relative',
  overflow: 'hidden',
  fontFamily: "'Caveat', cursive, sans-serif", // Handwriting-like font
  fontSize: '1.2rem',
  lineHeight: 1.6,
  color: '#333',
  animation: `${fadeIn} 1s ease-out`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'6\' height=\'6\' viewBox=\'0 0 6 6\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M5 0h1L0 6V5z\'/%3E%3C/g%3E%3C/svg%3E")',
    pointerEvents: 'none',
    opacity: 0.1
  }
}));

const polaroidStyles = [
  { top: '5%', left: '10%', transform: 'rotate(-10deg)' },
  { top: '0%', left: '40%', transform: 'rotate(5deg)' },
  { top: '10%', left: '70%', transform: 'rotate(-3deg)' },
  { top: '30%', left: '15%', transform: 'rotate(7deg)' },
  { top: '25%', left: '60%', transform: 'rotate(-8deg)' },
]


const GeneratingStoryPage: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [story, setStory] = useState('');
  const hasGeneratedRef = useRef(false);

  const { data: userSubmissionData } = useGetUserSubmissionsQuery();
  const router = useRouter();
  const { challege_id } = router.query;

  const userQuestionSubmissions = userSubmissionData?.data
    .filter(submission => submission.challengeId === challege_id)
    .flatMap(submission => submission.userChallengeSubmission?.flatMap(
      challengeSubmission => challengeSubmission.userQuestionSubmission || []
    ) || []);
  
    const userSubmittedMedias = useMemo(() => {
      const medias = userSubmissionData?.data
        ?.filter(submission => submission.challengeId === challege_id)
        ?.flatMap(submission => submission.userChallengeSubmission?.flatMap(
          challengeSubmission => challengeSubmission.userMediaSubmission || []
        ) || []);
      
      // Randomize and limit to 5 photos if more than 5
      return medias?.length > 5 
        ? medias
            .sort(() => 0.5 - Math.random())
            .slice(0, 5)
        : medias || [];
    }, [userSubmissionData, challege_id]);
  
  useEffect(() => {
    const generateStory = async () => {
      if (hasGeneratedRef.current) return;
      hasGeneratedRef.current = true;

      try {
        const response = await fetch('/api/python/generating-story', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: userQuestionSubmissions }),
        });

        const result = await response.json();
        if (result.success) {
          setStory(result.story);
          setIsGenerating(false);
        } else {
          console.error('Story generation failed:', result.message);
          setIsGenerating(false);
        }
      } catch (error) {
        console.error('Error generating story:', error);
        setIsGenerating(false);
      }
    };

    // Mock Process, will delete in later releases
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    async function example() {
      console.log('Start');
      await delay(2000);  // Wait for 2 seconds
      console.log('After 2 seconds');
      setIsGenerating(false);
    }

    if (userQuestionSubmissions && userQuestionSubmissions.length > 0) {
      example();
      // Use mock processes for now, will change to this below function in the next release
      // generateStory();
    }
  }, [userQuestionSubmissions]);

  return (
    <Box 
      sx={{
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        backgroundColor: '#f0f0f0',
        p: 2,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative background elements */}
      <Box 
        sx={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: '200px',
          height: '200px',
          backgroundColor: 'rgba(255,223,128,0.2)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          zIndex: 1
        }} 
      />
      <Box 
        sx={{
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: '250px',
          height: '250px',
          backgroundColor: 'rgba(128,223,255,0.2)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          zIndex: 1
        }} 
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 10 }}>
        {isGenerating ? (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            <Typography 
              variant="h4" 
              sx={{ 
                mb: 4, 
                color: '#333', 
                fontWeight: 'bold',
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)' 
              }}
            >
              Crafting Your Travel Story
            </Typography>
            <Image 
              src="https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/challenge/goodgoodgeneral-mental-health.gif?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjaGFsbGVuZ2UvZ29vZGdvb2RnZW5lcmFsLW1lbnRhbC1oZWFsdGguZ2lmIiwiaWF0IjoxNzM1NTg3ODMyLCJleHAiOjE3NjcxMjM4MzJ9.96kHEsoouK0FGejtLxQ1TB3XDo9w49K4eblwkwwtvbk&t=2024-12-30T19%3A43%3A52.656Z"
              alt="Generating Story" 
              width={300} 
              height={300} 
              style={{ 
                borderRadius: '20px', 
                boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                zIndex: 10
              }}
              unoptimized
            />
            <Typography 
              variant="body1" 
              sx={{ 
                mt: 4, 
                color: '#666',
                fontStyle: 'italic'
              }}
            >
              Weaving the threads of your journey into a beautiful narrative...
            </Typography>
          </Box>
        ) : (
          <TravelBanner 
            bannerText="Your Travel Diaries"
            polaroids={userSubmittedMedias.map((media, index) => ({
              id: index + 1,
              src: media,
              alt: `Polaroid ${index + 1}`,
              style: polaroidStyles[index],
              caption: `Memory ${index + 1}`
            }))}
            // mainText={story}
            mainText = "We will generate your story here. Stay tuned for update."
          />
        )}
      </Container>
    </Box>
  );
};

export default GeneratingStoryPage;
