import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Typography,
    useTheme,
    useMediaQuery,
    Card,
    CardMedia,
    CardActionArea,
    IconButton,
    Modal,
    Fab
} from "@mui/material";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CloseIcon from '@mui/icons-material/Close';
import { styled, keyframes } from '@mui/system';
import { Montserrat } from "next/font/google";
import Image from 'next/image';

const montserrat = Montserrat({
    weight: '400',
    subsets: ['latin']
});

// Wiggle animation keyframes
const wiggle = keyframes`
  0%, 100% {
    transform: rotate(-2deg);
  }
  50% {
    transform: rotate(2deg);
  }
`;

// Styled card with tilt and hole
const StyledCard = styled(Card)(({ theme }) => ({
    position: 'relative',
    transform: 'rotate(-5deg)', // Tilt the card to the left
    animation: `${wiggle} 5s infinite ease-in-out`, // Slow wiggle animation
    '&::after': {
        content: '""',
        position: 'absolute',
        top: '3%',
        left: '43%',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: `radial-gradient(circle, #b87333 0%, #8b5a2b 70%, #3e2723 100%)`,
        boxShadow: `
            inset 5px 5px 10px rgba(0, 0, 0, 0.2),
            inset -5px -5px 10px rgba(255, 255, 255, 0.1),
            10px 10px 15px rgba(0, 0, 0, 0.3)`,
        border: `2px solid #6d4c41`, // Wooden edge
        zIndex: 1, // Ensure the hole is above the cable
    },
}));

const WoodenCircle = styled(Box)(({ theme }) => ({
    borderRadius: '50%',
    background: `radial-gradient(circle, #b87333 0%, #8b5a2b 70%, #3e2723 100%)`,
    boxShadow: `
      inset 5px 5px 10px rgba(0, 0, 0, 0.2),
      inset -5px -5px 10px rgba(255, 255, 255, 0.1),
      10px 10px 15px rgba(0, 0, 0, 0.3)`,
    border: `2px solid #6d4c41`, // Wooden edge
    transition: 'transform 0.3s ease',
}));



interface LocationStoryProps {
    content: any;
    open: boolean;
    onClose: () => void;
}

const LocationStoryDisplay: React.FC<LocationStoryProps> = ({ content, open, onClose }) => {
    const carouselRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();

    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [imageError, setImageError] = useState(false);
    const [imageIndex, setImageIndex] = useState(null);

    useEffect(() => {
        if (!open) {
            setImageIndex(null);
        }
    }, [open]);

    // Scroll to the left
    const handlePrev = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollTop -= 300;
        }
    };

    // Scroll to the right
    const handleNext = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollTop += 300;
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            sx={{
                alignItems: "center",
                justifyContent: "center",
                alignSelf: "center",
                justifySelf: "center",
                width: "100%",
                height: "70%"
            }}
        >
            {imageIndex ?
                <Box
                    display="flex"
                    alignItems="flex-start"
                    justifyContent="center"
                    position="relative"
                    sx={{
                        backgroundColor: "rgba(250, 221, 180, 0.97)",
                        flexDirection: "row",
                        p: 1,
                        height: "100%",
                        boxShadow: 10
                    }}>
                    <CardMedia
                        component="img"
                        image={content?.userMediaSubmission?.[imageIndex - 1]}
                        alt={`Image ${imageIndex}`}
                        sx={{
                            height:"100%",
                            width:"80%"
                        }}
                    />
                    <Fab
                        size="small"
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "rgba(255, 250, 247, 0.66)",
                            left: 4
                        }}
                        onClick={() => { setImageIndex(null) }}
                    >
                        <CloseIcon />
                    </Fab>
                </Box>

                :
                <Box
                    display="flex"
                    alignItems="flex-start"
                    position="absolute"
                    sx={{
                        backgroundColor: "rgba(250, 221, 180, 0.97)",
                        flexDirection: "row",
                        p: 1,
                        height: "100%",
                        boxShadow: 10
                    }}
                >

                    <Box
                        display="flex"
                        alignItems="center"
                        position="relative"
                        sx={{
                            flexDirection: "column",
                            height: "100%",
                            width: { xs: "35%", sm: "80%", lg: "100%" },
                            boxShadow: 4,
                            backgroundColor: "rgba(232, 182, 113, 0.86)",
                            borderRadius: 5,
                            p: { xs: 0, lg: 2 },
                            mr: 2
                        }}
                    >
                        {/* Upward Navigation Button */}
                        {!isMobile && (
                            <IconButton
                                onClick={handlePrev}
                                sx={{
                                    position: "absolute",
                                    top: 0,
                                    justifyContent: "center",
                                    zIndex: 2,
                                    backgroundColor: "rgba(250, 221, 180, 0.49)",
                                    boxShadow: 1,
                                }}
                            >
                                <ArrowDropUpIcon />
                            </IconButton>
                        )}

                        {/* Scrollable Cards */}
                        <Box
                            ref={carouselRef}
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "1rem",
                                scrollBehavior: "smooth",
                                height: "100%",
                                width: { xs: "80%", sm: "80%", lg: "100%" },
                                overflowY: "auto",
                                "&::-webkit-scrollbar": { display: "none" }, // Optional: Hide scrollbar
                                pb: 1,
                                alignItems: "center"
                            }}
                        >
                            {/*<Cable /> Add the cable */}
                            {content?.userMediaSubmission.map((img, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        minWidth: { xs: '45vw', sm: '300px', lg: '300px' }, // Adjust card width
                                        maxWidth: '100%',
                                        position: 'relative',
                                        p: 2,
                                        zIndex: 1,
                                    }}
                                >
                                    
                                    <StyledCard >
                                        <CardActionArea onClick={() => { setImageIndex(index + 1) }}>
                                            <CardMedia
                                                component="img"
                                                height="150px"
                                                image={img}
                                                alt="Location Image"
                                            />
                                        </CardActionArea>
                                    </StyledCard>
                                    
                                </Box>
                            ))}
                        </Box>

                        {/* Downward Navigation Button */}
                        {!isMobile && (
                            <IconButton
                                onClick={handleNext}
                                sx={{
                                    position: "absolute",
                                    justifyContent: "center",
                                    bottom: 0,
                                    zIndex: 1,
                                    backgroundColor: "rgba(250, 221, 180, 0.69)",
                                    boxShadow: 1,
                                }}
                            >
                                <ArrowDropDownIcon />
                            </IconButton>
                        )}
                    </Box>
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        position="relative"
                        flexDirection="column"
                        sx={{
                            height: "100%",
                            p: { xs: 1, lg: 5 },
                        }}
                    >
                        <Typography
                            variant='h3'
                            sx={{
                                fontWeight: "bold",
                                fontFamily: montserrat.style.fontFamily,
                                color: "black",
                                p: 2,
                                fontSize: { xs: "h5.fontSize", sm: "h5.fontSize", lg: "h4.fontSize" }
                            }}
                        >
                            {content.title}
                        </Typography>
                        <Box
                            sx={{
                                overflow: "auto",
                                textOverflow: 'clip', // Cut off the text without showing ellipsis
                                whiteSpace: 'normal', // Allow text to wrap to the next line
                                wordBreak: 'break-word', // Ensure long words break to fit inside the box
                                backgroundColor: "rgba(255, 238, 214, 0.69)",
                                p: 2,
                                borderRadius: 3
                            }}
                        >
                            <Typography
                                variant='body1'
                                sx={{
                                    fontFamily: montserrat.style.fontFamily,
                                    color: "black",
                                    fontSize: { xs: "body1.fontSize", lg: "h5.fontSize" }

                                }}
                            >
                                {content.story}
                            </Typography>
                        </Box>
                    </Box>
                    <WoodenCircle
                        sx={{
                            width: { xs: "100%", sm: "30%", md: "25%", lg: "20%" },
                            height: { xs: "3%", sm: "5%", md: "7%", lg: "10%" },
                        }}
                    />
                </Box>}

        </Modal>
    );
};

export default LocationStoryDisplay;