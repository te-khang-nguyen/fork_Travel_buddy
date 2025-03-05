import React, { useState, useEffect } from "react";
import { Box, Link, Typography, Card, CardContent, Button } from "@mui/material";
import FastForwardIcon from "@mui/icons-material/FastForward";
import LoadingSkeleton from "@/app/components/kits/LoadingSkeleton";
import CustomCarousel from "@/app/components/generic-component/CustomCarousel";
import StyledContentCard from "@/app/components/generic-component/StyledContentCard";
import { useRouter } from "next/router";
import { useGetAllDestinationsQuery } from "@/libs/services/user/destination";
import { useGetAllPublishedStoryQuery } from "@/libs/services/user/story";
import { baseUrl } from "@/app/constant";
import { useMetadata } from "@/app/Layout/MetadataContextWrapper";
import defaultBackground from "@/assets/background.jpg";

const PublicStories = () => {
  const router = useRouter();
  const { setMetadata } = useMetadata();

  useEffect(() => {
    setMetadata({
      title: 'Stories Gallery - Travel Buddy', 
      description:'Welcome to My Travel Buddy.',
      urlSlug: `${baseUrl}/stories-gallery`
    });
  }, []);

  const [isFetching, setIsFetching] = useState(true);
  const [destinations, setDestinations] = useState<{
    id: string;
    name: string;
    image: string;
  }[]>([]);
  const [storyData, setStoryData] = useState<{
    id: string | undefined;
    createdAt: string | undefined;
    title: string | undefined;
    text: string | undefined;
    media: string[] | undefined;
    status: string | undefined;
  }[]>([]);

  
  const {
      data: story, 
      error: storyError,
      isFetching: storyFetching
  } = useGetAllPublishedStoryQuery();

  useEffect(()=>{
    setIsFetching(storyFetching);
  },[storyFetching]);

  useEffect(()=>{
    if(story?.data){
      setStoryData(story?.data?.map((item) => ({
        id: item.id,
        createdAt: item.created_at,
        title: item.seo_title_tag,
        text: item.story_content,
        media: item.media_assets?.map((item)=>item.url),
        status: item.status,
      })));
    }
  },[story?.data]);


  // If still loading, show loading state
  if (isFetching) {
    return (
      <LoadingSkeleton isLoading={isFetching} />
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 3,
        gap: 2,
        mb: 2,
        backgroundImage: `url("${defaultBackground.src}")`,
        height: "100%",
        overflowY: "auto"
      }}
    >
        <Typography 
            variant="h3"
            sx={{
                fontWeight: "bold",
                color: "white"
            }}
        >
            Welcome to the Travel Buddy Stories Gallery
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection:"column",
            alignItems: "center",
            justifyContent: "flex-start",
            alignSelf: "center",
            mt: 3,
            p:2,
            width: "60%",
            maxHeight: 400,
            backgroundColor: "white",
            borderRadius: 2,
            boxShadow: 5
          }}
        >
          <Typography
            variant="h4"
            sx={{ 
              color: "#4a90e2", 
              fontWeight: "bold",
              fontSize: {
                xs: "h5.fontSize", 
                sm: "h5.fontSize", 
                md: "h4.fontSize", 
                lg: "h4.fontSize"
              },
              ml: 2,
              mb: 2
            }}
          >
            Featured Stories
          </Typography>
          {storyData.map((item, index)=>(
            <StyledContentCard 
              key={index}
              content={item}
              route={`/story/${item.id}`}
            />
          ))}
        </Box>
      
    </Box>
  );
};

export default PublicStories;
