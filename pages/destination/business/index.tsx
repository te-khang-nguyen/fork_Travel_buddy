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
  } from '@mui/material';  
import { 
    useGetAllExperiencesQuery,
  } from "@/libs/services/user/experience";
import { Experience } from '@/libs/services/business/experience';
  

const SelectExperience = () => {
  const router = useRouter();
  const { data: allExperiences, isLoading } = useGetAllExperiencesQuery();
  if (isLoading) return <CircularProgress />;
  const MainSection: React.FC<{allExperiences: Experience[]}> = ({allExperiences}) => {
    return(
      <>
        <Typography variant="h4" gutterBottom align="center" sx={{ mt: 6 }}>
          Explore all destinations we have
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Button
                onClick={() => router.push('/experience/create')}
                color="primary"
                variant="outlined"
                sx={{ mt: 1, mr: 3, width: '50%' }}
            >
                Create new destination
            </Button>
        </Box>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {allExperiences?.map((child, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
                <Card 
                    sx={{ 
                    opacity: child.status === 'inactive' ? 0.5 : 1,
                    transition: 'opacity 0.3s ease',
                    '&:hover': {
                        opacity: child.status === 'inactive' ? 0.5 : 0.9
                    }
                    }}
                >
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
                        <Button variant="outlined" color="secondary" onClick={() => router.push(`/destination/${child.id}`)} sx={{ mt: 2 }}>
                            View
                        </Button>
                        <Button variant="outlined" color="primary" onClick={() => router.push(`/destination/${child.id}/edit`)} sx={{ mt: 2, ml : 2 }}>
                            Edit
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
        {allExperiences 
            ? <MainSection allExperiences={allExperiences}/>
            : "No destinations found"
        }
    </Container>
    
  ); // You can return a loading spinner or message if desired
};

export default SelectExperience;