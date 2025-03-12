import {
    Box,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Button
 } from "@mui/material";
import { useRouter } from "next/router";
import ButtonInEditSection from "@/app/components/destination/ButtonInEditSection";
import { Attraction } from "@/libs/services/business/attraction";

const TopAttractionsSection: React.FC<{
    attractions: Attraction[],
    edit_mode: boolean,
}> = ({
    attractions,
    edit_mode=false
}) => {
    const router = useRouter();
    return(
      <>
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: 6 }}>
        <Typography variant="h4" sx={{ lineHeight: 'normal', mb: 0 }}>
          Top Attractions For You
        </Typography>
        {edit_mode ? <ButtonInEditSection type="attraction"/> : null}
      </Box>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {attractions?.map((feature, index) => (
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
                        onClick={() => router.push(`/attraction/${feature.id}`)}
                        sx={{ mt: 2 }
                    }>
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
export default TopAttractionsSection;