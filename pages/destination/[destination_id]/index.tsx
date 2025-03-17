import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import { useRouter } from 'next/router';
import { 
  useGetExperiencePublicQuery,
  useGetLocationsPublicQuery,
  useGetExperienceDetailsPublicQuery,
  useGetIconicPhotosPublicQuery,
  convertExperienceDetailsToFeatures,
  Location,
} from "@/libs/services/user/experience";
import { Experience } from '@/libs/services/business/experience';
import { useCallSearchAgentMutation } from '@/libs/services/agents/search';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import GroupedFeaturesPopup, {Feature} from "@/app/components/destination/DestinationDetails";
import IconicPhotos from "@/app/components/destination/IconicPhotos";
import LoadingSkeleton from "@/app/components/kits/LoadingSkeleton";
import LikeButton from '@/app/components/destination/LikeButton';
import IDidItSection from '@/app/components/destination/IDidItButton';
import QRModal from '@/app/components/generic_components/QRModal';
import ChatBoxSection, { ChatInitialContent } from '@/app/components/generic_components/ChatBotInterface';

const destinationTags = (destinationName, attractions) => [
        {tagName: "travel distances", fullText: `How far is it to travel between attractions?\nList of attractions:\n${attractions}
        `,},
        {tagName: "No.1 visited attraction", fullText: `
          Which one of the listed attractions is the most visited place in ${destinationName}?\nList of attractions:\n${attractions}
        `,},
];

const attractionTags = (attractionName) => [
        {tagName: "famous feature", fullText: `What is ${attractionName} famous for?`},
        {tagName: "fun facts", fullText: `What are the fun facts about ${attractionName}?`,},
        {tagName: "historical context", fullText: `I want to know more about the historical context of ${attractionName}`,},
        {tagName: "famous visitors", fullText: `I want know which celebrity had visited ${attractionName}`,},
        {tagName: "photo tips", fullText: `Guide me to take the best photos at ${attractionName}`,},
      ]


const ExperienceHomePage: React.FC = () => {
  const router = useRouter();
  const { destination_id } = router.query;
  const { data: destination, isLoading } = useGetExperiencePublicQuery({ id: destination_id as string });
  // const { data: childrenExperiences, isLoading: childrenLoading } = useGetChildrenExperiencesQuery({ id: destination_id as string });
  const { data: attractions, isLoading: attractionsLoading } = useGetLocationsPublicQuery({ id: destination_id as string });
  const { data: destination_details } = useGetExperienceDetailsPublicQuery({ id: destination_id as string })
  
  const { data: iconic_photos } = useGetIconicPhotosPublicQuery({ id: destination_id as string });

  const [ callSearchAgent, {isLoading: searchAgentLoading} ] = useCallSearchAgentMutation();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [openChat, setOpenChat] = useState(false);
  const [chatResponse, setChatResponse] = useState<string[]>([]);
  const [intitialResponse, setIntitialResponse] = useState<ChatInitialContent>({
      title: "",
      description: "",
      tags: [],
      promptQuestion: "",
  });
  const [userInputs, setUserInputs] = useState<string>("");
  const [displayMess, setDisplayMess] = useState<string[]>([]);
  const [checked, setChecked] = React.useState(false);


  useEffect(()=>{
    if(destination && attractions){
      setIntitialResponse({
        title: destination.name ?? "",
        description: destination.description ?? "",
        tags: destinationTags(destination.name, attractions?.map(
          (item)=>item.title
        ).join("\n")),
        promptQuestion: "",
      });
    }
  }, [destination, attractions]);

  useEffect(()=>{
    setChecked((prev)=>!prev);
  },[chatResponse, displayMess]);

  const handleOpenChat = () => {
    setOpenChat((prev) => !prev);
    // setAnchorEl(event.currentTarget);
  }

  const handleAttractionChatInit = (attraction: Location) => {
    // setAnchorEl(event.currentTarget);
    setOpenChat((prev) => {
      setIntitialResponse({
        title: attraction.title,
        description: attraction.description ?? "",
        tags: attractionTags(attraction.title),
        promptQuestion: "",
      });
      return !prev
    });
    
  }

  const handleChat = async () => {
    setDisplayMess([...displayMess, userInputs]);
    setUserInputs("");
    const response = await callSearchAgent({
      query: userInputs,
      topic: destination?.name || ""
    });

    if(response?.error) {
      console.log(response?.error);
    } else {
      setChatResponse([
        ...chatResponse,
        response?.data?.answer ?? ""
      ]);
    }
  };

  const handleClearChat = () => {
    setChatResponse([]);
    setDisplayMess([]);
  }

  
  if (isLoading) return <LoadingSkeleton isLoading={true}/>;
  
  const VideoSection: React.FC<{destination: Experience}> = ({destination}) => {
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

  const ImageSection: React.FC<{destination: Experience}> = ({destination}) => {
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
          alt="Experience"
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

  const OverviewSection: React.FC<{destination: Experience}> = ({destination}) => {
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

  const CallToActionSection: React.FC<{destination: Experience}> = ({destination}) => {
    return(
      <><Typography variant="h5" align="center" sx={{ mt: 6, mb: 4 }}>
        {`Not in ${destination.name}? Maybe explore our other destinations?`}
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

  const MainSection: React.FC<{destination: Experience, childrenExperiences: Experience[]}> = ({destination, childrenExperiences}) => {
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

  const TopAttractionsSection: React.FC<{attractions: Location[]}> = ({attractions}) => {
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
                    onClick={(event) => handleAttractionChatInit(feature)} 
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

  const QRSection: React.FC = () => (<>
      <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "flex-start",
                        m: 2,
                        right: 2,
                        left: 2
                      }}
                      onClick={() => setModalOpen(true)}
                    >
                      <QrCode2Icon
                        sx={{
                          color: "rgb(0, 182, 249)",
                          fontSize: "45px",
                          borderRadius: 2,
                          "&:hover": {
                            color: "rgb(246, 101, 101)",
                          },
                        }}
                      />
      </Box>
            <QRModal
                    open={modalOpen}
                    onClose={()=>setModalOpen(false)}
                    contentId={destination_id as string}
                    backgroundImage={destination?.primary_photo}
                    displayText={destination?.name || ""}
            />
  </>)
  
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
            <QRSection/>
            {/* <IDidItSe tion destination={destination}/> */}
            <LikeButton />
            {/* Overview Section */}
            <OverviewSection destination={destination} />

            {/* Features Section */}
            <GroupedFeaturesPopup features={convertExperienceDetailsToFeatures(destination_details)} />

            {/* Main Section */}
            {/* <MainSection destination={destination} childrenExperiences={childrenExperiences} /> */}

            {/* Iconic Photos */}
            <IconicPhotos photos={iconic_photos}/>

            {/* Top attractions */}
            <TopAttractionsSection attractions={attractions} />

            {/* Call to Action */}
            <CallToActionSection destination={destination} />

            {/* Fixed Chat Button and Chatbox */}
            <ChatBoxSection 
              content={intitialResponse} 
              response={chatResponse} 
              message={displayMess} 
              open={openChat}
              setOpen={() => setOpenChat((prev) => !prev)}
              inputs={userInputs}
              setInputs={setUserInputs}
              handleChat={handleChat}
              displayMess={displayMess}
              isLoading={searchAgentLoading}
              clearChat={handleClearChat}
            />

            {/* Fixed Destinatio visit button */}
            <IDidItSection id={destination_id as string}/>
          </>
        ) : (
          <Typography variant="h6">Experience not found</Typography> // Fallback UI
        )}
      </Container>
    </>
  );
};

export default ExperienceHomePage;
