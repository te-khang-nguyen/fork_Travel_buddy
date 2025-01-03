import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CircularProgress,
  CardMedia,
  CardContent,
  Link, Typography,
  Container, Button,
  IconButton, Grid
} from "@mui/material";
import { green } from "@mui/material/colors";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LoadingSkeleton from '@/app/components/kits/LoadingSkeleton';
import {
  useGetChallengeQuery,
  useGetLocationsQuery,
  useGetProgressQuery,
  useJoinChallengeMutation
} from "@/libs/services/user/challenge";
import { useRouter } from 'next/router';
import ReviewModal from "@/app/components/challenge/ReviewModal";
import travelItineraryImage from '@/assets/travelItinerary.png';
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

  const {
    data: history,
    error: historyError
  } = useGetProgressQuery({
    challengeId: challenge_id
  }, {
    skip: !challenge_id
  });

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
  const [joinChallenge, { }] = useJoinChallengeMutation();
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
  let challengeLocations = locationsData?.data || [];
  // If still loading, show loading state
  if (isLoading) {
    return (<LoadingSkeleton isLoading={isLoading} />);
  }

  // If no challenge or locations, show appropriate message
  if (!challenge || challengeLocations.length === 0) {
    return (
      <LoadingSkeleton isLoading={isLoading} />
    );
  }
  const bg = challenge?.backgroundUrl;


  if (locationsData && history) {
    const userSubmission = challengeLocations?.map((location) => {
      const matchedLocation = history?.[0]?.userChallengeSubmission?.filter(e => e.locationId == location.id)[0];
      return { status: !matchedLocation ? false : true, ...location };
    });
    challengeLocations = userSubmission;
  }

  // Handle functions

  const handleSubmit = () => {
    // Open the ReviewModal
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleCardClick = (input) => {
    router.push(input ? `/challenge/${challenge_id}/locations/${input}` : '#')
  }


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
        py: 2, // Vertical padding
        px: { xs: 1, sm: 2, md: 4 }, // Responsive horizontal padding
        boxSizing: "border-box", // Ensure padding is included in width calculation
        color: "white",
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
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
              onClick={() => { handleCardClick(location?.id) }}
            >
              <Card
                sx={{
                  display: 'flex',
                  mb: 4,
                  boxShadow: 3,
                  borderRadius: 2,
                  height: { xs: 200, sm: 300, md: 300 },
                  width: { xs: 400, sm: 600, md: 800 },
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
                        objectFit: 'cover',
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
                          {!location.status ?
                            <Typography></Typography> :
                            <Typography>
                              <CheckCircleIcon sx={{ color: green[700] }} /> Submission received
                            </Typography>}
                        </Typography>
                        {location.location_info.map((e, index) => (
                          <Box key={`location-info-${index}`}>
                            <Typography
                              variant="body1"
                              component="h2"
                              sx={{
                                mb: { xs: 1, sm: 1 },
                                textAlign: 'left',
                                fontFamily: roboto.style.fontFamily,
                                fontStyle: 'normal',
                                textDecoration: 'none',
                                fontSize: {
                                  xs: '1rem',   // Smaller on mobile
                                  sm: '1.2rem',
                                  md: '1.25rem'  // Larger on desktop 
                                }
                              }}
                            >
                              {e.title}
                            </Typography>

                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "flex-start",
                                flex: 1, // Take remaining space
                                pl: { xs: 2, sm: 0 }, // Add left padding on mobile
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  mb: { xs: 1, sm: 1 },
                                  textAlign: { xs: "left", sm: "left" },
                                  whiteSpace: "pre-line",
                                  fontStyle: 'normal',
                                  fontFamily: roboto.style.fontFamily,
                                  textDecoration: 'none',
                                  fontSize: {
                                    xs: '0.75rem',
                                    sm: '0.875rem',
                                    md: '1rem'
                                  },
                                  display: '-webkit-box',
                                  overflow: 'hidden',
                                  WebkitBoxOrient: 'vertical',
                                  WebkitLineClamp: 4,
                                }}

                              >
                                {e?.instruction || 'No description available'}
                              </Typography>
                            </Box>
                          </Box>

                        ))}

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
        />
      </Container>
    </Box>
  );
}

export default JoinChallenge;
