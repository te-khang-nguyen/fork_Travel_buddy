import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
} from '@mui/material';
import { useRouter } from 'next/router';
import { 
  useGetExperienceQuery,
  useGetLocationsQuery,
  useGetExperienceDetailsQuery,
  convertExperienceDetailsToFeatures,
  useGetIconicPhotosQuery,
} from "@/libs/services/user/experience";
import { useGetActivitiesInExperienceQuery } from "@/libs/services/user/activity";
import { Experience } from '@/libs/services/business/experience';

import GroupedFeaturesPopup, {Feature} from "@/app/components/destination/DestinationDetails";
import IconicPhotos from "@/app/components/destination/IconicPhotos";
import LoadingSkeleton from "@/app/components/kits/LoadingSkeleton";
import VideoSection from '@/app/components/destination/VideoSection';
import OverviewSection from '@/app/components/destination/OverviewSection';
import PublishButton from '@/app/components/destination/PublishDestinationButton';
import ImageSection from '@/app/components/destination/ImageSection';
import TopAttractionsSection from '@/app/components/destination/TopAttractionsSection';

const EditExperiencePage: React.FC = () => {

  const [openChat, setOpenChat] = useState(false);
  const router = useRouter();
  const { destination_id } = router.query;
  const { data: destination, isLoading } = useGetExperienceQuery({ id: destination_id as string });
  // const { data: childrenExperiences, isLoading: childrenLoading } = useGetChildrenExperiencesQuery({ id: destination_id as string });
  const { 
    data: attractions, 
    isLoading: attractionsLoading 
  } = useGetActivitiesInExperienceQuery({ experience_id: destination_id as string });
  const { data: destination_details } = useGetExperienceDetailsQuery({ id: destination_id as string })

  const { data: iconic_photos } = useGetIconicPhotosQuery({ id: destination_id as string });
  
  if (isLoading) return <LoadingSkeleton isLoading={true}/>;


  const ChatBoxSection: React.FC<{destination: Experience}> = ({destination}) => {
    return(
      <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
        {openChat && (
          <Paper
            elevation={4}
            sx={{
              width: { xs: 300, sm: 350 },
              height: { xs: 400, sm: 450 },
              p: 2,
              mb: 1,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Chat with our AI (Beta)
            </Typography>
            <Typography variant="body2">
              Mock chatbox content goes here...
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setOpenChat(false)}
              sx={{ mt: 2 }}
            >
              Close
            </Button>
          </Paper>
        )}
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setOpenChat((prev) => !prev)}
        >
          Chat with our AI (Beta)
        </Button>
      </Box>
    )
  }

  const handleClickToDD = () => {
    router.push(`/destination/${destination_id}/edit/details`);
  }
  
  return (
    <>
      
      {/* Image section */}
      {/* {destination ? (<ImageSection destination={destination} />) : null} */}

      {/* Video section */}
      {/* {destination ? (<VideoSection destination={destination} />) : null} */}

      {/* Video and Image section */}
      {destination ? (
        destination.primary_video ? 
        (<VideoSection destination={destination} edit_mode={true} />) : 
        (<ImageSection destination={destination} edit_mode={true} />)
      ) : null}

      {/* Rest of the Content in a Container */}
      <Container maxWidth={false} sx={{ width: '90%' }}>
        
        {destination && attractions && destination_details ? (
          <>
            {/* Button to Publish */}
            <PublishButton destination={destination} />

            {/* Overview Section */}
            <OverviewSection destination={destination} edit_mode={true}/>

            {/* Features Section */}
            <GroupedFeaturesPopup features={convertExperienceDetailsToFeatures(destination_details)} />
            <Button
              onClick={handleClickToDD}
              variant="contained"
            > Manage Destination Details </Button>

            {/* Iconic Photos */}
            <IconicPhotos photos={iconic_photos || []} edit_mode={true}/>

            {/* Top attractions */}
            <TopAttractionsSection attractions={attractions as any} edit_mode={true}/>

            {/* Fixed Chat Button and Chatbox */}
            <ChatBoxSection destination={destination} />
          </>
        ) : (
          <Typography variant="h6">Experience not found</Typography> // Fallback UI
        )}
      </Container>
    </>
  );
};

export default EditExperiencePage;
