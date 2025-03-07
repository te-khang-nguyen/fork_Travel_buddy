import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import LoadingSkeleton from "@/app/components/kits/LoadingSkeleton";
import DestinationCarousel from "@/app/components/destination/DestinationCarousel";
import StyledContentCard from "@/app/components/generic_components/StyledContentCard";
import { useRouter } from "next/router";
import { useGetAllDestinationsQuery } from "@/libs/services/user/destination";
import { useGetAllPublishedStoryQuery } from "@/libs/services/user/story";

const UserDashboard = () => {
  const router = useRouter();
  const [isFetching, setIsFetching] = useState(true);
  const [destinations, setDestinations] = useState<{
    id: string;
    name: string;
    image: string;
    status: string;
  }[]>([]);
  const [storyData, setStoryData] = useState<{
    id: string | undefined;
    createdAt: string | undefined;
    title: string | undefined;
    text: string | undefined;
    media: string[] | undefined;
    status: string | undefined;
  }[]>([]);

  // useEffect(() => {
  //   setMetadata({
  //     title: 'Home - Travel Buddy', 
  //     description:'Welcome to My Travel Buddy.',
  //     urlSlug: baseUrl + router.asPath
  //   });
  // }, [setMetadata]);

  const {
      data: destinationsData,
      error: destinationsErr,
      isFetching: destinationsFetching,
  } = useGetAllDestinationsQuery();

  const {
      data: story, 
      error: storyError,
      isFetching: storyFetching
  } = useGetAllPublishedStoryQuery();

  useEffect(()=>{
    setIsFetching(destinationsFetching || storyFetching);
  },[destinationsFetching, storyFetching]);

  useEffect(()=>{
    if(destinationsData){
      setDestinations(destinationsData?.map((item)=>({
        id: item.id,
        name: item.name,
        image: item.primary_photo,
        status: item.status,
      })))
    }
  },[destinationsData])

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

  const handleContinue = (destinationId: string) => {
    router.push(`/destination/${destinationId}`);
  };

  if (destinationsFetching) {return LoadingSkeleton}
  
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 3,
        gap: 2,
        mb: 2,

      }}
    >

        <DestinationCarousel destinations={destinationsData} filter_mode="active" />

        <Box
          sx={{
            display: "flex",
            flexDirection:"column",
            alignItems: "center",
            justifyContent: "flex-start",
            alignSelf: "center",
            overflowY: "auto",
            mt: 3,
            width: "100%",
            maxHeight: 400
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

export default UserDashboard;
