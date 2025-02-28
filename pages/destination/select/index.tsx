import { useEffect } from 'react';
import { useRouter } from 'next/router';
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
  

const SelectDestination = () => {
  const router = useRouter();
  const { data: allDestinations, isLoading } = useGetAllDestinationsQuery();
  if (isLoading) return <CircularProgress />;
  const MainSection: React.FC<{allDestinations: Destination[]}> = ({allDestinations}) => {
    return(
      <>
        <Typography variant="h4" gutterBottom align="center" sx={{ mt: 6 }}>
          Explore all destinations we have
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {allDestinations?.map((child, index) => (
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
                  <Button variant="contained" color="primary" onClick={() => router.push(`/destination/${child.id}`)} sx={{ mt: 2 }}>
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

  return (
    
    <Container maxWidth={false} sx={{ width: '90%' }}>
        {allDestinations 
            ? <MainSection allDestinations={allDestinations}/>
            : "No destinations found"
        }
    </Container>
    
  ); // You can return a loading spinner or message if desired
};

export default SelectDestination;