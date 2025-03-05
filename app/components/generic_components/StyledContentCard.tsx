import React, { useState, useEffect } from "react";
import { IoMdOpen } from "react-icons/io";
import { useRouter } from "next/router";
import { green } from "@mui/material/colors";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
    Box,
    Card,
    CardMedia,
    CardContent,
    Link, Typography,
    Container, Button,
    IconButton,
    SxProps, Theme,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '700']
});

interface StyledContentCard {
  key?: number;
  content: {
    id?: string;
    title?: string;
    text?: string;
    media?: string[];
  };
  route?: string
  sideInfo?: string;
  sx?: SxProps<Theme>
}


const StyledContentCard: React.FC<StyledContentCard> = ({
  key,
  content, 
  route, 
  sideInfo,
  sx = {},
}) => {
    const router = useRouter();
    return (

        <Box
              key={key || 'default-location'}
              component="div"
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                cursor: 'pointer',
                ...sx
              }}
            >
              <Card
                sx={{
                  display: 'flex',
                  mb: 4,
                  boxShadow: 1,
                  borderRadius: 2,
                  height: { xs: 200, sm: 300, md: 300 },
                  width: { xs: 400, sm: 600, md: 800 },
                  border: 0,
                }}
              >
                <Grid container spacing={0}>
                  {/* Location Image */}
                  <Grid  size={4} sx={{
                    height: '100%',
                    position: 'relative'
                  }}>
                    <CardMedia
                      component="img"
                      sx={{
                        height: '100%',
                        width: '100%',
                        objectFit: 'cover',
                      }}
                      image={content.media?.[0]}
                      alt={content.title}

                    />
                  </Grid>

                  {/* Location Details */}
                  <Grid  size={8}>
                    <CardContent sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      p: { xs: 1, sm: 2 }
                    }}>
                      <Box>
                        <Typography
                          variant="h6"
                          component="h2"
                          sx={{
                            mb: { xs: 1, sm: 2 },
                            textAlign: 'left',
                            fontFamily: roboto.style.fontFamily,
                            fontStyle: 'normal',
                            textDecoration: 'none',
                            fontSize: {
                              xs: '1rem',   // Smaller on mobile
                              sm: '1.25rem',
                              md: '1.5rem'  // Larger on desktop 
                            }
                          }}
                        >
                          {content.title}
                          {sideInfo &&
                            <Typography>
                              <CheckCircleIcon sx={{ color: green[700] }} /> 
                              {sideInfo}
                            </Typography>}
                        </Typography>
                        
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "flex-start",
                                flex: 1, // Take remaining space
                                pl: { xs: 2, sm: 0 }, // Add left padding on mobile
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  mb: { xs: 1, sm: 1 },
                                  textAlign: { xs: "left", sm: "left" },
                                  whiteSpace: "pre-line",
                                  fontStyle: 'normal',
                                  fontFamily: roboto.style.fontFamily,
                                  textDecoration: 'none',
                                  fontSize: {
                                    xs: '0.75rem',
                                    sm: '0.875rem',
                                    md: '1rem'
                                  },
                                  display: '-webkit-box',
                                  overflow: 'hidden',
                                  WebkitBoxOrient: 'vertical',
                                  WebkitLineClamp: 4,
                                }}

                              >
                                {content.text || 'No description available'}
                              </Typography>
                            </Box>
                            
                      </Box>
                      {route && 
                      <IconButton
                        // variant="outlined"
                        color="primary"
                        onClick={()=> router.push(route)}
                        sx={{
                          width: {xs:"2rem", lg: "4rem"},
                          height: {xs:"2rem", lg: "4rem"},
                          alignSelf:"flex-end"
                        }}
                      >
                        <IoMdOpen/>
                      </IconButton>}
                    </CardContent>
                    
                  </Grid>
                </Grid>
              </Card>
            </Box>

    );
};

export default StyledContentCard;