import React, { useState, useEffect } from 'react';
import { Box, Card, CircularProgress, CardMedia, CardContent, Link, Typography, Container, Button, IconButton, Grid } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { 
  useGetChallengeQuery,
  useGetLocationsQuery,
  useJoinChallengeMutation 
} from "@/libs/services/user/challenge";
import { useRouter } from 'next/router';
import { supabase } from "@/libs/supabase/supabase_client";
import ReviewModal from "@/app/components/challenge/ReviewModal";
import travelIconImage from '@/assets/travelIcon.jpeg';
import travel1 from '@/assets/travel1.jpeg';
import travel2 from '@/assets/travel2.jpeg';
import travel3 from '@/assets/travel3.jpeg';
import travelItineraryImage from '@/assets/travelItinerary.png';
import defaultBackground from "@/assets/background.jpg"; // Replace with the actual background image path

interface FetchForm {
  data?: any,
  error?: any
};

// Mock data - replace with actual data fetching
// const challengeLocations = [
//   {
//     id: 1,
//     name: 'Train Street Hanoi',
//     description: 'A unique urban experience where trains pass through a narrow street, creating a thrilling and photogenic moment.',
//     mainImage: travelIconImage.src,
//     submittedPhotos: [
//         travel1.src,
//         travel2.src,
//         travel3.src,
//     ],
//     instructions: 'Pose with a train passing by while holding a cup of coffee'
//   },
//   {
//     id: 2,
//     name: 'Hoan Kiem Lake',
//     description: 'A picturesque lake in the heart of Hanoi, surrounded by historical significance and beautiful landscapes.',
//     mainImage: travelIconImage.src,
//     submittedPhotos: [
//         travel1.src,
//         travel2.src,
//         travel3.src,
//     ],
//     instructions: '1. Pose in the early morning with a group of aunties and uncles exercising \n2. Pose gazing afar into the Turtle Tower in the middle of the lake',
//   },
//   {
//     id: 3,
//     name: 'St. Joseph\'s Cathedral',
//     description: 'A stunning neo-gothic Catholic church, a testament to French colonial architecture in Hanoi.',
//     mainImage: travelIconImage.src,
//     submittedPhotos: [
//         travel1.src,
//         travel2.src,
//         travel3.src,
//     ],
//     instructions: '1. Pose with a group of young people eating street food facing the cathedral\n2. Pose on a Vespa riding past the Cathedral',
//   }
// ];
const mockChallengeLocations = [
  {
    backgroundUrl: "https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/challenge/b1dac327-94c7-45bc-91f7-354e5d1cf1b2/Demo%20Challenge/BenThanh_background.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjaGFsbGVuZ2UvYjFkYWMzMjctOTRjNy00NWJjLTkxZjctMzU0ZTVkMWNmMWIyL0RlbW8gQ2hhbGxlbmdlL0JlblRoYW5oX2JhY2tncm91bmQud2VicCIsImlhdCI6MTczNTI2ODk3OCwiZXhwIjoxNzY2ODA0OTc4fQ.ruoyNk5LU8DwrP0IMhgl-VJj3ndsXmscWE0fMg8eYIQ&t=2024-12-27T03%3A16%3A07.932Z",
    businessid: "b1dac327-94c7-45bc-91f7-354e5d1cf1b2",
    created: "2024-12-22T09:32:07.067528+00:00",
    description: "This is the first demo challenge.",
    id: "59f3ce3b-79c8-47dd-906b-24034d935dff",
    price: 0,
    qrurl: "https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/challenge/b1dac327-94c7-45bc-91f7-354e5d1cf1b2/Demo%20Challenge/DemoChallenge_QR.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjaGFsbGVuZ2UvYjFkYWMzMjctOTRjNy00NWJjLTkxZjctMzU0ZTVkMWNmMWIyL0RlbW8gQ2hhbGxlbmdlL0RlbW9DaGFsbGVuZ2VfUVIuanBnIiwiaWF0IjoxNzM1MTA0MDE5LCJleHAiOjE3NjY2NDAwMTl9.JQ2sFHkfK-2VeVZ6LmdG5zWxQv2Si5ayDcUeNNSQgVE",
    thumbnailUrl: "https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/challenge/b1dac327-94c7-45bc-91f7-354e5d1cf1b2/Demo%20Challenge/BenThanh_thumbnail.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjaGFsbGVuZ2UvYjFkYWMzMjctOTRjNy00NWJjLTkxZjctMzU0ZTVkMWNmMWIyL0RlbW8gQ2hhbGxlbmdlL0JlblRoYW5oX3RodW1ibmFpbC53ZWJwIiwiaWF0IjoxNzM1MjY5MDM3LCJleHAiOjE3NjY4MDUwMzd9.lEe2p_GTdkE4646iSu6fCtcC3f7J28zSCB5IfWydNGQ&t=2024-12-27T03%3A17%3A06.277Z",
    title: "Cho Ben Thanh Tour",
  }
];

// const mockChallengeLocations2 = {
//   id: 1
// instruction: "Pose Idea: Stand with your arms outstretched or in a welcoming pose to show the excitement of entering the market.\nTip: Capture the iconic clock tower in the background. Go for a wide-angle shot to include the vibrant market activity."
// media: []
// title: "Entrance Pose"

// }

function JoinChallenge() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [challenge_id, setChallengeId] = useState<string | undefined>(undefined);

  // Consistent hook for logging and ID extraction
  useEffect(() => {
    console.log("FULL ROUTER QUERY:", router.query);
    console.log("ROUTER IS READY:", router.isReady);
    console.log("CURRENT PATH:", router.asPath);

    if (router.isReady) {
      // Try different variations of how the ID might be in the query
      const id = router.query.challenge_id || 
                 router.query.challege_id || 
                 router.query.id;
      
      console.log("EXTRACTED CHALLENGE ID:", id);
      
      setChallengeId(id as string | undefined);
      setIsLoading(false);
    }
  }, [router.isReady, router.query]);
  // Mutation and state hooks
  const [ joinChallenge, {} ] = useJoinChallengeMutation();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Queries with skip option
  const { 
    data: challengeData, 
    error: ChallengeError 
  } = useGetChallengeQuery<FetchForm>({
    challengeId: challenge_id
  }, {
    skip: !challenge_id
  });

  const { 
    data: locationsData, 
    error: locationsError,
    isLoading: isLocationsLoading,
    isFetching: isLocationsFetching
  } = useGetLocationsQuery<FetchForm>({
    challengeId: challenge_id
  }, {
    skip: !challenge_id
  });
  // Comprehensive logging
  useEffect(() => {
    console.log("Challenge Data:", challengeData);
    console.log("Challenge Error:", ChallengeError);
    console.log("Locations Data:", locationsData);
    console.log("Locations Error:", locationsError);
  }, [challengeData, ChallengeError, locationsData, locationsError]);

  // Update loading state based on locations query
  useEffect(() => {
    if (challenge_id) {
      setIsLoading(isLocationsLoading || isLocationsFetching);
    }
  }, [challenge_id, isLocationsLoading, isLocationsFetching]);

  // If there are errors, handle them
  if (ChallengeError || locationsError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6" color="error">
          Error Loading Challenge:
          {ChallengeError && ` Challenge Error - ${JSON.stringify(ChallengeError)}`}
          {locationsError && ` Locations Error - ${JSON.stringify(locationsError)}`}
        </Typography>
      </Box>
    );
  }

  // Safely extract challenge and locations
  const challenge = challengeData?.data?.[0];
  const challengeLocations = locationsData?.data?.[0]?.location_info || [];

  // If still loading, show loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If no challenge or locations, show appropriate message
  if (!challenge || challengeLocations.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6" color="error">
          No challenge or location details found
        </Typography>
      </Box>
    );
  }
  const bg = challenge?.backgroundUrl;

  // Handle functions

  const handleSubmit = () => {
    // Open the ReviewModal
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
  };

  const handleConfirmSubmission = () => {
    // Additional logic for submission confirmation
    // Could include API call, navigation, etc.
    setIsReviewModalOpen(false);
    // Example: navigate to next page
    router.push(`/challenge/${challenge_id}/confirmation`);
  };


  const handleGoBack = () => {
    router.back();
  };

  const handleBegin = async () => {
    try {
      console.log("CHALLENGE ID", challenge_id);
      console.log("CHALLENGE DATA", challengeLocations);
      console.log("CHALLENGE", challenge);
  
      // Comprehensive authentication logging
      console.log("Supabase Client:", supabase);
      console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log("Supabase Anon Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
      try {
        const authResponse = await supabase.auth.getUser();
        console.log("Full Auth Response:", authResponse);
        
        const { data: { user }, error: authError } = authResponse;
        
        console.log("Supabase Auth User:", user);
        console.log("Supabase Auth Error:", authError);
  
        if (authError) {
          console.error("Authentication Error Details:", {
            name: authError.name,
            message: authError.message,
            status: authError.status
          });
        }
  
        if (authError || !user) {
          console.error("User not authenticated", authError);
          alert("Please log in first");
          return;
        }
  
        // Rest of the existing code...
      } catch (catchError) {
        console.error("Catch block error during authentication:", catchError);
      }
    } catch (error) {
      console.error("Unexpected error in handleBegin:", error);
      alert("An unexpected error occurred");
    }
  };
  

  return (
    <Box
      sx={{
        backgroundImage: `url("${bg? bg : defaultBackground.src}")`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        color: "white",
        textAlign: "center",
        padding: "20px",
        gap: 4,
        position: "relative",
      }}
    >
      {/* Go Back Button */}
      <IconButton
        onClick={handleGoBack}
        sx={{
          position: "absolute",
          top: "20px",
          left: "20px",
          color: "white",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          },
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ 
        py: 4, 
        backgroundColor: '#F5F5F5', // Off-white color
        minHeight: '100vh'
      }}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          mb: 4 
        }}
      >
        <img 
          src={travelItineraryImage.src} 
          alt="Travel Itinerary" 
          style={{ 
            maxWidth: '100%', 
            height: 'auto', 
            objectFit: 'contain' 
          }} 
        />
      </Box>

      {/* Placeholder Blocks */}
      <Box sx={{ mb: 4 }}>
        <Grid 
          container 
          spacing={2} 
          sx={{ 
            display: 'flex', 
            flexDirection: 'row', 
            flexWrap: 'nowrap' 
          }}
        >
        </Grid>
      </Box>

      {challengeLocations.map((location) => (
        <Link 
          href={location?.id ? `/challenge/${challenge_id}/locations/${location.id}` : '#'} 
          passHref
          key={location?.id || 'default-location'}
          sx={{
            textDecoration: 'none',  // Remove underline for the entire link
            color: 'inherit',        // Inherit color from parent
          }}
        >
        <Box 
          component="div"
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            width: '100%',
            cursor: 'pointer',
            '&:hover': {
              '& > .MuiCard-root': {
                boxShadow: 4,
                transform: 'scale(1.02)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }
            }
          }}
        >
          <Card 
            sx={{ 
              display: 'flex', 
              mb: 4, 
              boxShadow: 3,
              borderRadius: 2,
              height: { xs: 200, sm: 300, md: 300 },
              width: { xs: 400, sm: 600, md: 800 }
            }}
          >
          <Grid container spacing={0}>
            {/* Location Image */}
            <Grid item xs={4} sx={{ 
              height: '100%', 
              position: 'relative' 
            }}>
              <CardMedia
                component="img"
                sx={{ 
                  height: '100%', 
                  width: '100%',
                  objectFit: 'cover' 
                }}
                image={location.media[0]}
                alt={location.title}
              />
            </Grid>

            {/* Location Details */}
            <Grid item xs={8}>
              <CardContent sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                p: { xs: 1, sm: 2 }
              }}>
                <Box>
                  <Typography 
                    variant="h6" 
                    component="h2" 
                    sx={{ 
                      mb: { xs: 1, sm: 2 },
                      textAlign: 'left',
                      fontStyle: 'normal',
                      textDecoration: 'none',
                      fontSize: { 
                        xs: '1rem',   // Smaller on mobile
                        sm: '1.25rem', 
                        md: '1.5rem'  // Larger on desktop 
                      }
                    }}
                  >
                    {location.title}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: { xs: 1, sm: 2 },
                      textAlign: 'left',
                      fontStyle: 'normal',
                      textDecoration: 'none',
                      fontSize: { 
                        xs: '0.75rem',  
                        sm: '0.875rem', 
                        md: '1rem'      
                      }
                    }}
                  >
                    {location?.description || 'No description available'}
                  </Typography>
                </Box>
                <Box>
                <Typography 
                    variant="subtitle2" 
                    sx={{ 
                        fontWeight: 'bold', 
                        textAlign: 'left',
                        fontStyle: 'normal',
                        textDecoration: 'none',
                        mb: { 
                            xs: 0.5,   // Smaller margin on small screens
                            sm: 1,     // Default margin on larger screens
                            md: 1 
                        }
                    }}
                >
                    Challenge Instructions
                </Typography>
                <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                        whiteSpace: 'pre-line',  // Preserves line breaks
                        fontSize: { 
                            xs: '0.75rem',  // Smaller on mobile
                            sm: '0.875rem', 
                            md: '1rem'      // Larger on desktop
                        },
                        textAlign: 'left',
                        fontStyle: 'normal',
                        textDecoration: 'none',
                        mt: { 
                            xs: 0.5,   // Smaller margin on small screens
                            sm: 1,     // Default margin on larger screens
                            md: 1 
                        }
                    }}
                >
                    {location.instruction}
                </Typography>

                </Box>
              </CardContent>
            </Grid>
          </Grid>
        </Card>
        </Box>
      </Link>
      ))}

      {/* Submit Button */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 4 
        }}
      >
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={handleSubmit}
          sx={{ 
            width: '200px', 
            py: 1.5,
            fontSize: '1rem',
            backgroundColor: '#228B22', // Forest Green
            '&:hover': {
              backgroundColor: '#1D6F1D' // Slightly darker green on hover
            }
          }}
        >
          Submit
        </Button>
      </Box>

      {/* Review Modal */}
      <ReviewModal 
        open={isReviewModalOpen}
        onClose={handleCloseReviewModal}
        onConfirm={handleConfirmSubmission}
        challengeId={challenge_id as string}
      />
    </Container>
      <Button
        onClick={handleBegin}
        sx={{
          borderRadius: 14,
          width: "150px",
          fontSize: { xs: "0.5rem", md: "1rem" },
        }}
        variant="contained"
      >
        Begin
      </Button>
    </Box>
  );
}

export default JoinChallenge;
