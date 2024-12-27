import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  Paper,
  Stack,
  Button,
  Dialog
} from '@mui/material';
import { useRouter } from 'next/router';
import ImageCarousel from "@/app/components/challenge/ImageCarousel";
import ReviewModal from "@/app/components/challenge/ReviewModal"; // Ensure this import exists
import travelIconImage from '@/assets/travelIcon.jpeg';
import travel1 from '@/assets/travel1.jpeg';
import travel2 from '@/assets/travel2.jpeg';
import travel3 from '@/assets/travel3.jpeg';
import travelItineraryImage from '@/assets/travelItinerary.png';

// Mock data - replace with actual data fetching
const challengeLocations = [
  {
    id: 1,
    name: 'Train Street Hanoi',
    description: 'A unique urban experience where trains pass through a narrow street, creating a thrilling and photogenic moment.',
    mainImage: travelIconImage.src,
    submittedPhotos: [
        travel1.src,
        travel2.src,
        travel3.src,
    ],
    instructions: 'Pose with a train passing by while holding a cup of coffee'
  },
  {
    id: 2,
    name: 'Hoan Kiem Lake',
    description: 'A picturesque lake in the heart of Hanoi, surrounded by historical significance and beautiful landscapes.',
    mainImage: travelIconImage.src,
    submittedPhotos: [
        travel1.src,
        travel2.src,
        travel3.src,
    ],
    instructions: '1. Pose in the early morning with a group of aunties and uncles exercising \n2. Pose gazing afar into the Turtle Tower in the middle of the lake',
  },
  {
    id: 3,
    name: 'St. Joseph\'s Cathedral',
    description: 'A stunning neo-gothic Catholic church, a testament to French colonial architecture in Hanoi.',
    mainImage: travelIconImage.src,
    submittedPhotos: [
        travel1.src,
        travel2.src,
        travel3.src,
    ],
    instructions: '1. Pose with a group of young people eating street food facing the cathedral\n2. Pose on a Vespa riding past the Cathedral',
  }
];

export default function TravelItineraryPage() {
  const router = useRouter();
  const { challenge_id } = router.query;
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
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

  return (
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
          href={`/challenge/${challenge_id}/locations/${location.id}`} 
          passHref
          key={location.id}
        >
        <Box 
          component="div"  // Use div to allow clickable Box
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            width: '100%',
            cursor: 'pointer',  // Show pointer on hover
            '&:hover': {
              '& > .MuiCard-root': {
                boxShadow: 4,  // Increase shadow on hover
                transform: 'scale(1.02)',  // Slight scale up on hover
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
                image={location.mainImage}
                alt={location.name}
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
                      fontSize: { 
                        xs: '1rem',   // Smaller on mobile
                        sm: '1.25rem', 
                        md: '1.5rem'  // Larger on desktop 
                      }
                    }}
                  >
                    {location.name}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: { xs: 1, sm: 2 },
                      fontSize: { 
                        xs: '0.75rem',  // Smaller on mobile
                        sm: '0.875rem', 
                        md: '1rem'      // Larger on desktop
                      }
                    }}
                  >
                    {location.description}
                  </Typography>
                </Box>
                <Box>
                <Typography 
                    variant="subtitle2" 
                    sx={{ 
                        fontWeight: 'bold', 
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
                        mt: { 
                            xs: 0.5,   // Smaller margin on small screens
                            sm: 1,     // Default margin on larger screens
                            md: 1 
                        }
                    }}
                >
                    {location.instructions}
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
  );
}