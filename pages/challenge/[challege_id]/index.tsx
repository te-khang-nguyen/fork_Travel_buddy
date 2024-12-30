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
import travelItineraryImage from '@/assets/travelItinerary.png';
import defaultBackground from "@/assets/background.jpg"; // Replace with the actual background image path
import { Roboto } from 'next/font/google'

const roboto = Roboto({ 
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '700']
});

function JoinChallenge() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [challenge_id, setChallengeId] = useState<string | undefined>(undefined);

  // Consistent hook for logging and ID extraction
  useEffect(() => {
    if (router.isReady) {
      // Try different variations of how the ID might be in the query
      const id = router.query.challenge_id || 
                 router.query.challege_id || 
                 router.query.id;
            
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
  } = useGetChallengeQuery({
    challengeId: challenge_id
  }, {
    skip: !challenge_id
  });

  const { 
    data: locationsData, 
    error: locationsError,
    isLoading: isLocationsLoading,
    isFetching: isLocationsFetching
  } = useGetLocationsQuery({
    challengeId: challenge_id
  }, {
    skip: !challenge_id
  });

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
        </Typography>
      </Box>
    );
  }

  // Safely extract challenge and locations
  const challenge = challengeData?.data?.[0];
  const challengeLocations = locationsData?.data || [];
  const challengeLocationsInfos = locationsData?.data?.[0]?.location_info || [];
  console.log("CHALLENGE LOCATIONS", locationsData?.data)
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
  

  return (
    <Box
      sx={{
        backgroundColor: '#F5F5F5',
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start", // Changed from center to flex-start
        width: "100%",
        minHeight: "100vh", // Use minHeight instead of height
        height: "100%", // Allow content to determine height
        overflowY: "auto", // Enable vertical scrolling
        py: 2, // Vertical padding
        px: { xs: 1, sm: 2, md: 4 }, // Responsive horizontal padding
        boxSizing: "border-box", // Ensure padding is included in width calculation
        color: "white",
        textAlign: "center",
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
          zIndex: 10, // Ensure button is above other content
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      {/* Main Content */}
      <Container 
        maxWidth="lg" 
        sx={{ 
          width: "100%",
          fontFamily: roboto.style.fontFamily,
          maxWidth: { xs: "100%", sm: "90%", md: "1200px" }, // Responsive max-width
          minHeight: "90vh", // Ensure minimum height
          height: "auto", // Allow content to determine height
          py: { xs: 2, sm: 4, md: 4 }, // Responsive vertical padding
          px: { xs: 1, sm: 2, md: 4 }, // Responsive horizontal padding
          backgroundColor: '#F5F5F5',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflow: "visible", // Allow content to be fully visible
          position: "relative", // Ensure proper positioning
        }}
      >
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
          href={location?.id ? `/challenge/${challenge_id}/locations/${location?.id}` : '#'} 
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
                image={location.imageurls[0]}
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
                      fontFamily: roboto.style.fontFamily,
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
                      fontFamily: roboto.style.fontFamily,
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
                        fontFamily: roboto.style.fontFamily,
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
                        fontFamily: roboto.style.fontFamily,
                        fontStyle: 'normal',
                        textDecoration: 'none',
                        mt: { 
                            xs: 0.5,   // Smaller margin on small screens
                            sm: 1,     // Default margin on larger screens
                            md: 1 
                        }
                    }}
                >
                    {location.instruction || "No instruction available"}
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
        // onConfirm={handleConfirmSubmission}
        // challengeId={challenge_id as string}
      />
    </Container>
    </Box>
  );
}

export default JoinChallenge;
