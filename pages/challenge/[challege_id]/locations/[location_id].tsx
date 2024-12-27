import React, { useState, useEffect } from 'react';
import {
  Box,
  CircularProgress,
  TextField,
  IconButton,
  Button,
  Typography,
  Card,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { 
  useGetLocationsQuery,
} from "@/libs/services/user/challenge";
import { useRouter } from 'next/router';
import Image from 'next/image';
import CustomAccordionList from "@/app/components/challenge/SectionWithCustomStyling";
import defaultBackground from "@/assets/background.jpg";
import ImageDisplay from "@/app/components/kits/Image";
import BenThanhLoc from "@/assets/BenThanhLoc.jpg";

const MainUI = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [challenge_id, setChallengeId] = useState<string | undefined>(undefined);
  
  // Explicitly extract location_id from router query
  const { location_id } = router.query;
  
  // Convert location_id to a number or keep as string based on your data structure
  const parsedLocationId = typeof location_id === 'string' 
    ? (isNaN(Number(location_id)) ? location_id : Number(location_id)) 
    : location_id;

  console.log("PARSED LOCATION ID", parsedLocationId);
  console.log("LOCATION ID TYPE", typeof parsedLocationId);

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

  // Update loading state based on locations query
  useEffect(() => {
    if (challenge_id) {
      setIsLoading(isLocationsLoading || isLocationsFetching);
    }
  }, [challenge_id, isLocationsLoading, isLocationsFetching]);

  // If there are errors, handle them
  if (locationsError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6" color="error">
          Error Loading Locations:
          {locationsError && ` Locations Error - ${JSON.stringify(locationsError)}`}
        </Typography>
      </Box>
    );
  }

  // Find the specific location based on location_id
  const challengeLocations = locationsData?.data?.[0]?.location_info || [];
  console.log("CURRENT Challenge Locations", challengeLocations);
  
  // Use loose equality to handle different types
  const currentLocation = challengeLocations.find(location => 
    location.id == parsedLocationId
  );
  console.log("CURRENT LOCATION", currentLocation);

  // If still loading, show loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If no challenge or locations, show appropriate message
  if (!currentLocation) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6" color="error">
          Location not found
          <br />
          Location ID: {parsedLocationId}
          <br />
          Available Locations: {JSON.stringify(challengeLocations.map(loc => loc.id))}
          <br />
          Location ID Type: {typeof parsedLocationId}
        </Typography>
      </Box>
    );
  }

  const accordionItems = [
    {
      header: "Write your own story",
      content: "Please add some notes about what you found, how you felt, and upload some photos! The more the merrier!",
    },
  ];

  const instructionSections = [
    {
      title: "Context",
      content: currentLocation.context || 'No context available'
    },
    {
      title: "Famous Visitors",
      content: currentLocation.famous_visitors || 'No famous visitors available'
    },
    {
      title: "Photo Posting Guides",
      content: currentLocation.instruction || 'No instruction available'
    },
  ];

  const handleGoBack = () => {
    router.back();
  };

  return (
    <Box
      sx={{
        backgroundColor: '#F5F5F5',
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        p: 2,
      }}
    >
      
      <Card sx={{
        mb: 4,
        boxShadow: 3,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        backgroundColor: "rgba(197, 195, 218, 0.45)",
        width: "100%",
        p: 2,
      }}>
        <Card
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            backgroundColor: "rgba(31, 177, 255, 0.23)",
            width: "100%",
            p: 2,
            textAlign: "center",
            borderRadius: 7
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              position: 'relative', 
              width: '100%' 
            }}
          >
            <IconButton 
              onClick={handleGoBack}
              sx={{ 
                position: 'absolute', 
                left: 0, 
                top: '50%', 
                transform: 'translateY(-50%)' 
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            
            <Typography 
              variant="h4"  
              sx={{ 
                fontSize: {
                  xs: '1.5rem',   
                  sm: '2rem',     
                  md: '2.5rem'    
                },
                fontWeight: 'bold',
                color: 'darkblue', 
                textAlign: 'center',
                fontStyle: 'normal',
                mb: { 
                  xs: 0.5,   
                  sm: 1,     
                  md: 1 
                }
              }}
            >
              {currentLocation.title}
            </Typography>
          </Box>
        </Card>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            width: '100%', 
            height: '300px',  
            position: 'relative'
          }}
        >
          {currentLocation.media?.[0] && (
            <Box 
              sx={{ 
                position: 'relative', 
                width: '50%',     
                height: '100%',   
                maxWidth: '400px' 
              }}
            >
              <Image
                src={currentLocation.media[0]}
                alt={currentLocation.title}
                layout="fill"
                objectFit="contain"  
                priority
              />
            </Box>
          )}
        </Box>
        {/* Add instruction section */}
        {instructionSections.map((section, index) => (
          <Box 
            key={index}
            sx={{ 
              width: '100%', 
              display: 'flex', 
              flexDirection: 'column',  
              alignItems: 'center',     
              justifyContent: 'center', 
              mt: 1,  // Reduced from mt: 2 to mt: 1
              px: { xs: 2, sm: 4, md: 6 }  
            }}
          >
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 'bold', 
                textAlign: 'center',
                fontStyle: 'normal',
                textDecoration: 'none',
                mb: { 
                  xs: 0.5,   
                  sm: 1,     
                  md: 1 
                }
              }}
            >
              {section.title}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                whiteSpace: 'pre-line',  
                fontSize: { 
                  xs: '0.75rem',  
                  sm: '0.875rem', 
                  md: '1rem'      
                },
                textAlign: 'center',
                fontStyle: 'normal',
                textDecoration: 'none',
                mt: { 
                  xs: 0.5,   
                  sm: 1,     
                  md: 1 
                },
                maxWidth: '800px'  
              }}
            >
              {section.content}
            </Typography>
          </Box>
        ))}

          <CustomAccordionList 
            items={accordionItems} 
            sx={{
              mt: 2.5,  // Add margin-top, slightly less than previous sections
              backgroundColor: '#F5F5F5', // Set the main box background color
              '& .MuiAccordion-root': {
                backgroundColor: '#F5F5F5',
              },
              '& .MuiAccordionDetails-root': {
                backgroundColor: '#F5F5F5', // Set AccordionDetails background color
              }
            }}
          />

      </Card>
    </Box>
  );
};

export default MainUI;