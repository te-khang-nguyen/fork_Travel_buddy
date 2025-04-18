import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import LoadingSkeleton from "@/app/components/kits/LoadingSkeleton";
import DestinationCarousel from "@/app/components/destination/DestinationCarousel";
import StyledContentCard from "@/app/components/generic_components/StyledContentCard";
import { useRouter } from "next/router";
import { useGetAllExperiencesPublicQuery } from "@/libs/services/user/experience";
import { useGetAllPublishedStoryQuery } from "@/libs/services/user/story";

const UserDashboard = () => {
  const router = useRouter();
  const [isFetching, setIsFetching] = useState(true);
  const [destinations, setExperiences] = useState<{
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

  const {
      data: destinationsData,
      error: destinationsErr,
      isFetching: destinationsFetching,
  } = useGetAllExperiencesPublicQuery();

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
      setExperiences(destinationsData?.map((item)=>({
        id: item?.id,
        name: item?.name,
        image: item?.primary_photo,
        status: item?.status,
      })) as { id: string; name: string; image: string; status: string }[])
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
          {storyData.length > 0? 
          storyData.map((item, index)=>(
            <StyledContentCard 
              key={index}
              content={item}
              route={`/story/${item.id}`}
            />
          )): 
          <Typography
            variant="h6"
            sx={{ 
              fontSize: {
                xs: "h6.fontSize", 
                sm: "h6.fontSize", 
                md: "h5.fontSize", 
                lg: "h5.fontSize"
              },
              ml: 2,
              mb: 2
            }}
          >
            No stories available
          </Typography>
          }
        </Box>
      
    </Box>
  );
};

export default UserDashboard;
