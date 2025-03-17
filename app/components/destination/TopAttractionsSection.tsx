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
import { Location } from "@/libs/services/business/location";

const TopAttractionsSection: React.FC<{
    attractions: Location[],
    edit_mode?: boolean,
    handleAttractionChatInit?: any,
}> = ({
    attractions,
    edit_mode=false,
    handleAttractionChatInit={},
}) => {
    const sortedAttractions = attractions.slice().sort((a, b) => a.order_of_appearance - b.order_of_appearance);
    return(
      <>
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: 6 }}>
        <Typography variant="h4" sx={{ lineHeight: 'normal', mb: 0 }}>
          Top Attractions For You
        </Typography>
        {edit_mode ? <ButtonInEditSection type="attraction"/> : null}
      </Box>
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
                        onClick={(event) => handleAttractionChatInit(feature)} 
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