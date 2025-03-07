import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Button,
  Box,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { useRouter } from 'next/router';
import { 
  useGetAllDestinationsQuery,
  useGetDestinationQuery,
  useGetChildrenDestinationsQuery,
  useGetAttractionsQuery,
  Destination,
  Attraction,
  useGetDestinationDetailsQuery,
  convertDestinationDetailsToFeatures,
  useGetIconicPhotosQuery,
} from "@/libs/services/user/destination";

import GroupedFeaturesPopup, {Feature} from "@/app/components/destination/DestinationDetails";
import IconicPhotos from "@/app/components/destination/IconicPhotos";
import LoadingSkeleton from "@/app/components/kits/LoadingSkeleton";
import LikeButton from '@/app/components/destination/LikeButton';
import IDidItSection from '@/app/components/destination/IDidItButton';

const NagoyaCastleHomePage: React.FC = () => {

  const mainVidThumbnail = "https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/destination/thumbnails/edited.mp4?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJkZXN0aW5hdGlvbi90aHVtYm5haWxzL2VkaXRlZC5tcDQiLCJpYXQiOjE3NDAzOTAzMTQsImV4cCI6MTc3MTkyNjMxNH0.GY7GzgQstiu_EADqGFWPdzHO92XuuutvBwcD1z8Vh08"

  // Mock data for Destinations
  const destinations = [
    {
      title: "Cho Ben Thanh",
      description: "Learn about the rich history and cultural significance of Cho Ben Thanh.",
      image: "https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/destination/thumbnails/Ben%20Thanh%20thumbnail.jpeg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJkZXN0aW5hdGlvbi90aHVtYm5haWxzL0JlbiBUaGFuaCB0aHVtYm5haWwuanBlZyIsImlhdCI6MTc0MDM5MTM2MiwiZXhwIjoxNzcxOTI3MzYyfQ.pNxQ_ljjvaAsTig9H7iQyC9is26mc2jymA_yOFoieak",
      link: "#"
    },
    {
      title: "Central Post Office",
      description: "Historical place with French architecture, functional post office where you can send postcards",
      image: "https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/challenge/e42f2b79-82fe-4133-aab7-9860a3356307/District%201:%20City%20Center/District1:CityCenter_3264916df2042f37570fc46f3f00239b.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjaGFsbGVuZ2UvZTQyZjJiNzktODJmZS00MTMzLWFhYjctOTg2MGEzMzU2MzA3L0Rpc3RyaWN0IDE6IENpdHkgQ2VudGVyL0Rpc3RyaWN0MTpDaXR5Q2VudGVyXzMyNjQ5MTZkZjIwNDJmMzc1NzBmYzQ2ZjNmMDAyMzliLmpwZyIsImlhdCI6MTc0MDM5MTE5OCwiZXhwIjoxNzcxOTI3MTk4fQ.W-4HoRwjAQf7oVlozQoXEK0qbx9toYiDG6KaVrWJO3c",
      link: "#"
    },
    {
      title: "Ba Son Bridge",
      description: "Modern bridge crossing to Thu Thiem new area",
      image: "https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/challenge/e42f2b79-82fe-4133-aab7-9860a3356307/District%202/District2_ff529548b6a08b782eb941ab1b7c2f01.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjaGFsbGVuZ2UvZTQyZjJiNzktODJmZS00MTMzLWFhYjctOTg2MGEzMzU2MzA3L0Rpc3RyaWN0IDIvRGlzdHJpY3QyX2ZmNTI5NTQ4YjZhMDhiNzgyZWI5NDFhYjFiN2MyZjAxLmpwZyIsImlhdCI6MTc0MDM5MTE0MSwiZXhwIjoxNzcxOTI3MTQxfQ.HOdJ-exsXl9PpTI4nH-0mwYo-mIrsuU2HpFvrhoTvkI",
      link: "#"
    },
    {
      title: "Tan Dinh Church",
      description: "Stunning pink church in the city center.",
      image: "https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/destination/thumbnails/nha-tho-tan-dinh-24.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJkZXN0aW5hdGlvbi90aHVtYm5haWxzL25oYS10aG8tdGFuLWRpbmgtMjQuanBnIiwiaWF0IjoxNzQwMzkxMzg3LCJleHAiOjE3NzE5MjczODd9.w_VFnHmqcQaunKiiVHhB_PkOMgBzM1vtHZtqY9UH9H4",
      link: "#"
    },
    {
        title: "Cu Chi Tunnel",
        description: "Go back in history to discover how Vietnamese soldiers fight and win the war against all odds",
        image: "https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/destination/thumbnails/Cu%20Chi%20tunnel.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJkZXN0aW5hdGlvbi90aHVtYm5haWxzL0N1IENoaSB0dW5uZWwuanBnIiwiaWF0IjoxNzQwMzkxMzc1LCJleHAiOjE3NzE5MjczNzV9.nVqUsLRfurgYmENP0oFLmoFeLrgcX1n_ciYAA7NmFgo",
        link: "#"
    }
  ];

  // Mock data for Attractions
  const mock_attractions = [
    {
      title: "Com Tam Ba Ghien",
      description: "Try out the dish that represents the city the most, filled with aroma from the grilled meat",
      image: "https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/destination/thumbnails/BaGhien.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJkZXN0aW5hdGlvbi90aHVtYm5haWxzL0JhR2hpZW4uanBnIiwiaWF0IjoxNzQwMzkxNTIzLCJleHAiOjE3NzE5Mjc1MjN9.GEDRYdqPwUIMcHn8qeY3bPew8GiCsNp35axQ3cOLsmM",
      link: "#"
    },
    {
      title: "Banh mi Huynh Hoa",
      description: "Queue up for the quinessential experience of eating Saigon's most popular street food",
      image: "https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/destination/thumbnails/HuynhHoa2.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJkZXN0aW5hdGlvbi90aHVtYm5haWxzL0h1eW5oSG9hMi5qcGciLCJpYXQiOjE3NDAzOTE1NDMsImV4cCI6MTc3MTkyNzU0M30.QINiD2VkYc8cRXadEXUvhN9vkjO_pczWbGh76bK8BYE",
      link: "#"
    },
    {
      title: "Vincom Dong Khoi",
      description: "Enjoy local shopping",
      image: "https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/destination/thumbnails/Vincom%20DK.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJkZXN0aW5hdGlvbi90aHVtYm5haWxzL1ZpbmNvbSBESy53ZWJwIiwiaWF0IjoxNzQwMzkxNTM1LCJleHAiOjE3NzE5Mjc1MzV9.8G3KXVA-yVnHztdVAMeQjqa0PUTqzcFjMOHCT7t2T-8",
      link: "#"
    }
  ];

  const [openChat, setOpenChat] = useState(false);
  const router = useRouter();
  const { destination_id } = router.query;
  const { data: destination, isLoading } = useGetDestinationQuery({ id: destination_id as string });
  // const { data: childrenDestinations, isLoading: childrenLoading } = useGetChildrenDestinationsQuery({ id: destination_id as string });
  const { data: attractions, isLoading: attractionsLoading } = useGetAttractionsQuery({ id: destination_id as string });
  const { data: destination_details } = useGetDestinationDetailsQuery({ id: destination_id as string })

  const { data: iconic_photos } = useGetIconicPhotosQuery({ id: destination_id as string });
  
  if (isLoading) return <LoadingSkeleton isLoading={true}/>;
  
  const VideoSection: React.FC<{destination: Destination}> = ({destination}) => {
    return(
    <Box
      sx={{
        position: 'relative',
        width: '100vw',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        height: '600px',
        overflow: 'hidden',
        mb: 4,
      }}
    >
      <Box
        component="video"
        autoPlay
        loop
        muted
        playsInline
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      >
        {/* <source src="/videos/edited.mp4" type="video/mp4" /> */}
        <source src={destination.primary_video} type="video/mp4" />
        
        Your browser does not support the video tag.
      </Box>
      {/* Video Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          p: 3,
          borderRadius: 2,
          width: '60%',
        }}
      >
        <Typography variant="h2" gutterBottom>
          {destination.name}
        </Typography>
        <Typography variant="subtitle1">
          {destination.thumbnail_description}
        </Typography>
      </Box>
    </Box>
    )
  }

  const ImageSection: React.FC<{destination: Destination}> = ({destination}) => {
    return (
      <Box
        sx={{
          position: 'relative',
          width: '100vw',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          height: '600px',
          overflow: 'hidden',
          mb: 4,
        }}
      >
        <img
          src={destination.primary_photo}
          alt="Destination"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        {/* Image Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            p: 3,
            borderRadius: 2,
            width: '60%',
          }}
        >
          <Typography variant="h2" gutterBottom>
            {destination.name}
          </Typography>
          <Typography variant="subtitle1">
            {destination.thumbnail_description}
          </Typography>
        </Box>
      </Box>
    );
  }

  const OverviewSection: React.FC<{destination: Destination}> = ({destination}) => {
    return(
      <Paper elevation={0} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Overview
        </Typography>
        <Typography variant="body1" paragraph>
        {destination.description}
        </Typography>
      </Paper>
    )
  }

  const CallToActionSection: React.FC<{destination: Destination}> = ({destination}) => {
    return(
      <><Typography variant="h5" align="center" sx={{ mt: 6, mb: 4 }}>
        Not in {destination.name}? Maybe explore our other destinations. All over the world!
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        size="large"
        href="#"
        onClick={() => router.push('select')}
        sx={{ mx: 'auto', mb: 6, maxWidth: 200, alignItems: 'center', display: 'flex' }}
      >
        Explore
      </Button></>
    )
  }

  const MainSection: React.FC<{destination: Destination, childrenDestinations: Destination[]}> = ({destination, childrenDestinations}) => {
    return(
      <>
        <Typography variant="h4" gutterBottom align="center" sx={{ mt: 6 }}>
          Explore destinations within {destination.name}
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {childrenDestinations?.map((child, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={child.primary_photo}
                  alt={child.name}
                />
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {child.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {child.thumbnail_description}
                  </Typography>
                  <Button variant="contained" color="primary" 
                    onClick={() => router.push(`/destination/${child.id}`)} 
                    sx={{ mt: 2 }}
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </>
    )
  }

  const TopAttractionsSection: React.FC<{attractions: Attraction[]}> = ({attractions}) => {
    const sortedAttractions = attractions.slice().sort((a, b) => a.order_of_appearance - b.order_of_appearance);

    return(
      <>
      <Typography variant="h4" gutterBottom align="center" sx={{ mt: 6 }}>
          Top attractions for you
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {sortedAttractions?.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={feature.primary_photo}
                  alt={feature.title}
                />
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {feature.description_thumbnail}
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    // onClick={() => router.push(`/attraction/${feature.id}`)} 
                    sx={{ mt: 2 }}
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </>
    )
  }

  const ChatBoxSection: React.FC<{destination: Destination}> = ({destination}) => {
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
  
  return (
    <>
      {/* Image section */}
      {/* {destination ? (<ImageSection destination={destination} />) : null} */}

      {/* Video section */}
      {/* {destination ? (<VideoSection destination={destination} />) : null} */}

      {/* Video and Image section */}
      {destination ? (
        destination.primary_video ? 
        (<VideoSection destination={destination} />) : 
        (<ImageSection destination={destination} />)
      ) : null}

      {/* Rest of the Content in a Container */}
      <Container maxWidth={false} sx={{ width: '90%' }}>
        {destination && attractions && destination_details && iconic_photos ? (
          <>
            {/* <IDidItSection destination={destination}/> */}
            <LikeButton />
            {/* Overview Section */}
            <OverviewSection destination={destination} />

            {/* Features Section */}
            <GroupedFeaturesPopup features={convertDestinationDetailsToFeatures(destination_details)} />

            {/* Main Section */}
            {/* <MainSection destination={destination} childrenDestinations={childrenDestinations} /> */}

            {/* Iconic Photos */}
            <IconicPhotos photos={iconic_photos}/>

            {/* Top attractions */}
            <TopAttractionsSection attractions={attractions} />

            {/* Call to Action */}
            <CallToActionSection destination={destination} />

            {/* Fixed Chat Button and Chatbox */}
            <ChatBoxSection destination={destination} />
          </>
        ) : (
          <Typography variant="h6">Destination not found</Typography> // Fallback UI
        )}
      </Container>
    </>
  );
};

export default NagoyaCastleHomePage;
