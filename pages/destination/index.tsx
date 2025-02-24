import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Box,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';

interface Feature {
    title: string;
    description: string;
    image: string;
    link?: string;
  }

const NagoyaCastleHomePage: React.FC = () => {

    const mainVidThumbnail = "https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/destination/thumbnails/edited.mp4?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJkZXN0aW5hdGlvbi90aHVtYm5haWxzL2VkaXRlZC5tcDQiLCJpYXQiOjE3NDAzOTAzMTQsImV4cCI6MTc3MTkyNjMxNH0.GY7GzgQstiu_EADqGFWPdzHO92XuuutvBwcD1z8Vh08"
  // Mock data for features
  const features = [
    {
      title: "Famous Visitors",
      description: "Who has been here? Let's find out.",
      image: "https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/destination/thumbnails/fact_sheet_best_time_to_visit.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJkZXN0aW5hdGlvbi90aHVtYm5haWxzL2ZhY3Rfc2hlZXRfYmVzdF90aW1lX3RvX3Zpc2l0LnN2ZyIsImlhdCI6MTc0MDM5MjkwNywiZXhwIjoxNzcxOTI4OTA3fQ.8JoBfIICsf_GnfGYJlCiUpeQtVia7KO-ar5bXrcCP58",
      link: "#"
    },
    {
      title: "Events & Festivals",
      description: "Discover the various events and festivals held at Ho Chi Minh City throughout the year.",
      image: "https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/destination/thumbnails/fact_sheet_local_customs.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJkZXN0aW5hdGlvbi90aHVtYm5haWxzL2ZhY3Rfc2hlZXRfbG9jYWxfY3VzdG9tcy5zdmciLCJpYXQiOjE3NDAzOTI4OTYsImV4cCI6MTc3MTkyODg5Nn0.N9ylI3yge81vWeA00sRndamvK01R8YqTDZblM8sYCEA",
      link: "#"
    },
    {
      title: "Visitor Information",
      description: "Find out about and how to get to Ho Chi Minh City.",
      image: "https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/destination/thumbnails/fact_sheet_getting_around.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJkZXN0aW5hdGlvbi90aHVtYm5haWxzL2ZhY3Rfc2hlZXRfZ2V0dGluZ19hcm91bmQuc3ZnIiwiaWF0IjoxNzQwMzkyOTE5LCJleHAiOjE3NzE5Mjg5MTl9.MJ0B8H8uuovBbpk49goPsdx1WuR_TzbB7C3QSbR7UBw",
      link: "#"
    },
    {
      title: "Tips from the pros",
      description: "Explore some of our curated tips, collected from travelers themselves.",
      image: "https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/destination/thumbnails/fact_sheet_tips.svg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJkZXN0aW5hdGlvbi90aHVtYm5haWxzL2ZhY3Rfc2hlZXRfdGlwcy5zdmciLCJpYXQiOjE3NDAzOTI4ODIsImV4cCI6MTc3MTkyODg4Mn0.38xeEWL6McXXZ6xtZU_4KVGaJQrWGMfkrcU-QMZa6KY",
      link: "#"
    }
  ];

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
  const attractions = [
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

  const FeaturesSection: React.FC = () => {
    const [openFeature, setOpenFeature] = useState<Feature | null>(null);
  
    return (
      <>
        <Typography variant="h4" gutterBottom align="center" sx={{ mt: 6 }}>
          Essential Ho Chi Minh City
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4, justifyContent: 'center' }}>
          {features.map((feature, index) => (
            <Grid item key={index}>
              <Button
                variant="outlined"
                onClick={() => setOpenFeature(feature)}
                sx={{
                  borderColor: 'lightgray',
                  backgroundColor: 'transparent',
                  color: 'black',
                  fontSize: '1.2rem', // bigger text
                  fontWeight: 'bold',
                  textTransform: 'none',
                  maxHeight: 100,
                  minWidth: 250,
                  padding: 2,
                  '&:hover': {
                    borderColor: 'lightgray',
                    backgroundColor: 'rgba(0,0,0,0.03)',
                  },
                }}
                startIcon={
                  <Box
                    component="img"
                    src={feature.image}
                    alt={feature.title}
                    sx={{ width: 90, height: 90 }} // larger icon size
                  />
                }
              >
                {feature.title}
              </Button>
            </Grid>
          ))}
        </Grid>
  
        {/* Dialog for feature details */}
        <Dialog
          open={Boolean(openFeature)}
          onClose={() => setOpenFeature(null)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>{openFeature?.title}</DialogTitle>
          <DialogContent>
            <DialogContentText>{openFeature?.description}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenFeature(null)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };
  
  return (
    <>
      {/* Full-Width Video Section */}
      <Box
        sx={{
          position: 'relative',
          width: '100vw',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          height: '800px',
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
          <source src={mainVidThumbnail} type="video/mp4" />
          
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
          }}
        >
          <Typography variant="h2" gutterBottom>
            Welcome to Ho Chi Minh City
          </Typography>
          <Typography variant="subtitle1">
            Discover the beauty and history of the biggest city of Vietnam.
          </Typography>
        </Box>
      </Box>

      {/* Rest of the Content in a Container */}
      <Container maxWidth={false} sx={{ width: '90%' }}>
        {/* Overview Section */}
        <Paper elevation={0} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Overview
          </Typography>
          <Typography variant="body1" paragraph>
          Ho Chi Minh City, formerly known as Saigon, is a vibrant metropolis where tradition meets modernity. The city’s bustling streets offer a blend of historical charm—from French colonial architecture to poignant war relics—alongside contemporary attractions like gleaming skyscrapers and lively markets. Culinary adventures abound with tantalizing street food and local delicacies that reflect the region’s rich flavors. Cultural landmarks, including museums, pagodas, and art galleries, narrate the city’s storied past. Meanwhile, serene river views and lush parks provide a peaceful escape from the urban energy, making Ho Chi Minh City an unforgettable destination for travelers seeking both heritage and modern excitement.
          </Typography>
        </Paper>

        {/* Features Section */}
        <FeaturesSection />

        {/* Main Section */}
        <Typography variant="h4" gutterBottom align="center" sx={{ mt: 6 }}>
          Explore destinations within Ho Chi Minh City
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {destinations.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={feature.image}
                  alt={feature.title}
                />
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {feature.description}
                  </Typography>
                  <Button variant="contained" color="primary" href={feature.link} sx={{ mt: 2 }}>
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Top attractions */}
        <Typography variant="h4" gutterBottom align="center" sx={{ mt: 6 }}>
          Top attractions for you
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {attractions.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={feature.image}
                  alt={feature.title}
                />
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {feature.description}
                  </Typography>
                  <Button variant="contained" color="primary" href={feature.link} sx={{ mt: 2 }}>
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Call to Action */}
        <Typography variant="h5" align="center" sx={{ mt: 6, mb: 4 }}>
          Not in Ho Chi Minh City? Maybe explore our other destinations. All over the world!
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          href="#"
          sx={{ mx: 'auto', mb: 6, maxWidth: 200, alignItems: 'center', display: 'flex' }}
        >
          Explore
        </Button>
        {/* Fixed Chat Button and Chatbox */}
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
      </Container>
    </>
  );
};

export default NagoyaCastleHomePage;
