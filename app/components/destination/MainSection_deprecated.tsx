import { Experience } from "@/libs/services/business/experience";
import { Typography, Grid, Card, CardMedia, CardContent, Button } from "@mui/material";
import { useRouter } from "next/router";

const MainSection: React.FC<{destination: Experience, childrenExperiences: Experience[]}> = ({destination, childrenExperiences}) => {
    const router = useRouter();
    return(
      <>
        <Typography variant="h4" gutterBottom align="center" sx={{ mt: 6 }}>
          Explore destinations within {destination.name}
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {childrenExperiences?.map((child, index) => (
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

export default MainSection;