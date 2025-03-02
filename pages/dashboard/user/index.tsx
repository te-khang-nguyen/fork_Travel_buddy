import React, { useState, useEffect } from "react";
import { Box, Link, Typography, Card, CardContent, Button } from "@mui/material";
import FastForwardIcon from "@mui/icons-material/FastForward";
import LoadingSkeleton from "@/app/components/kits/LoadingSkeleton";
import CustomCarousel from "@/app/components/generic-component/CustomCarousel";
import StyledContentCard from "@/app/components/generic-component/StyledContentCard";
import { useRouter } from "next/router";
import { useGetAllDestinationsQuery } from "@/libs/services/user/destination";
import { useGetAllStoryQuery } from "@/libs/services/user/story";

const UserDashboard = () => {
  const router = useRouter();

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
      data: destinationsData,
      error: destinationsErr,
      isFetching: destinationsFetching,
  } = useGetAllDestinationsQuery();

  const {
      data: story, 
      error: storyError,
      isFetching: storyFetching
  } = useGetAllStoryQuery();

  useEffect(()=>{
    setIsFetching(destinationsFetching || storyFetching);
  },[destinationsFetching, storyFetching]);

  useEffect(()=>{
    if(destinationsData){
      setDestinations(destinationsData?.map((item)=>({
        id: item.id,
        name: item.name,
        image: item.primary_photo
      })))
    }
  },[destinationsData])

  useEffect(()=>{
    if(story?.data){
      setStoryData(story?.data?.map((item) => ({
        id: item.id,
        createdAt: item.createdAt,
        title: item.title,
        text: item.storyFull,
        media: item.mediaSubmitted,
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

        <CustomCarousel
            contents={destinations}
            header="Featured Destinations"
            onCardSelect={(id)=> handleContinue(id)}
            onViewAll={()=> router.push("/destination/select")}
        />

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
              route={`/profile/user/${item.id}`}
            />
          ))}
        </Box>
      
    </Box>
  );
};

export default UserDashboard;
