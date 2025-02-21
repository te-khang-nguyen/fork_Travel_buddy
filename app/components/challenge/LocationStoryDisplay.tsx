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
    Fab,
    Button,
    TextField
} from "@mui/material";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CloseIcon from '@mui/icons-material/Close';
import { styled, keyframes } from '@mui/system';
import { Montserrat } from "next/font/google";

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
    borderRadius: '10%',
    position: 'relative',
    transform: 'rotate(-5deg)', // Tilt the card to the left
    animation: `${wiggle} 5s infinite ease-in-out`, // Slow wiggle animation
    '&::after': {
        content: '""',
        position: 'absolute',
        top: '3%',
        left: '47%',
        width: '13px',
        height: '13px',
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
    onSaveChanges?: (storyUpdated: string) => void;
    onTrigger?: () => void;
    isTriggered?: boolean;
    isEditor?: boolean;
}

const LocationStoryDisplay: React.FC<LocationStoryProps> = ({ 
    content,
    onSaveChanges,
    onTrigger,
    isTriggered, 
    isEditor
}) => {
    const carouselRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();

    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [imageError, setImageError] = useState(false);
    const [imageIndex, setImageIndex] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [travelStory, setTravelStory] = useState<string>('');
    const [media, setMedia] = useState<string[]>([]);
    const persitedTexts = sessionStorage.getItem("story");

    useEffect(() => {
        if (!content) {
            setImageIndex(null);
        } else {
            setTravelStory(persitedTexts || content?.story);
            setMedia(content?.userMediaSubmission ?? []);
        }
    }, [content]);

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

    const handleSaveChanges = () => {
        onSaveChanges?.(travelStory);
    };

    const handleArchive = () => {
        onTrigger?.();
    };

    return (
        <>
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
                        boxShadow: 10,
                        mt: 2,
                        borderRadius: 2,
                    }}
                >
                    <CardMedia
                        component="img"
                        image={content?.userMediaSubmission?.[imageIndex - 1]}
                        alt={`Image ${imageIndex}`}
                        sx={{
                            height:"100%",
                            width:"100%",
                            borderRadius: 2,
                        }}
                    />
                    <Fab
                        size="small"
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "rgba(255, 250, 247, 0.66)",
                            ml: 2
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
                    overflow= "auto"
                    sx={{
                        // backgroundColor: "rgba(250, 221, 180, 0.97)",
                        flexDirection: "row",
                        p: {xs: 0, sm: 0, md: 1, lg: 1},
                        height: "70%",
                        mt: 15,
                        bottom: 5
                        //boxShadow: 10
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
                            mr: 2,
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
                                gap: "0.01rem",
                                scrollBehavior: "smooth",
                                height: "100%",
                                width: { xs: "80%", sm: "80%", lg: "100%" },
                                overflowY: "auto",
                                "&::-webkit-scrollbar": { display: "none" }, // Optional: Hide scrollbar
                                pb: "0.75rem",
                                alignItems: "center",
                                mb: 1
                            }}
                        >
                            {/*<Cable /> Add the cable */}
                            {media.map((img, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        minWidth: { 
                                            xs: '45vw', 
                                            sm: '300px', 
                                            lg: '300px' 
                                        }, // Adjust card width
                                        maxWidth: '100%',
                                        width:"100%",
                                        position: 'relative',
                                        p: 1,
                                        zIndex: 1,
                                    }}
                                >
                                    
                                    <StyledCard>
                                        <CardActionArea onClick={() => 
                                            { setImageIndex(index + 1) }
                                        }>
                                            <CardMedia
                                                component="img"
                                                height="100%"
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
                            p: { xs: 0, lg: 5 },
                        }}
                    >
                        {!isEditor?
                            <Button
                                sx={{
                                    backgroundColor: "rgba(0, 0, 0, 0.85)",
                                    color: "rgb(255, 255, 255)",
                                    fontFamily: montserrat.style.fontFamily,
                                    fontSize: {
                                        xs:"body2.fontSize",
                                        sm:"body1.fontSize",
                                        md:"body1.fontSize",
                                        lg:"body1.fontSize",
                                    },
                                    borderRadius: 3,
                                    boxShadow: 3,
                                    ml:{xs:5,sm:30,md:50,lg:50},
                                    mb: 2
                                }}
                                onClick={onTrigger}
                                disabled={isTriggered}
                            >
                                To Story Editor
                            </Button>
                        :
                        !isEditing?
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems:"center",
                                justifyContent:"center",
                                position:"relative",
                                gap: 1,
                            }}
                        >
                            <Button
                                sx={{
                                    backgroundColor: isTriggered?"rgba(15, 148, 10, 0.84)"
                                                                :"rgba(228, 17, 17, 0.73)",
                                    color: "rgb(255, 255, 255)",
                                    fontFamily: montserrat.style.fontFamily,
                                    fontSize: {
                                        xs:"body2.fontSize",
                                        sm:"body1.fontSize",
                                        md:"body1.fontSize",
                                        lg:"body1.fontSize",
                                    },
                                    borderRadius: 3,
                                    boxShadow: 3,
                                    mb: 2
                                }}
                                onClick={handleArchive}
                            >
                                {isTriggered? "Reactivate" : "Archive"}
                            </Button>
                            {isTriggered?<></>:<Button
                                sx={{
                                    backgroundColor: "rgba(0, 0, 0, 0.85)",
                                    color: "rgb(255, 255, 255)",
                                    fontFamily: montserrat.style.fontFamily,
                                    fontSize: {
                                        xs:"body2.fontSize",
                                        sm:"body1.fontSize",
                                        md:"body1.fontSize",
                                        lg:"body1.fontSize",
                                    },
                                    borderRadius: 3,
                                    boxShadow: 3,
                                    ml:{xs:5,sm:30,md:50,lg:50},
                                    mb: 2
                                }}
                                onClick={()=>setIsEditing(true)}
                                disabled={isTriggered}
                            >
                                Edit
                            </Button>}
                        </Box>
                        :
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems:"center",
                                justifyContent:"center",
                                position:"relative",
                                gap: 1,
                            }}
                        >
                            <Button
                                sx={{
                                    backgroundColor: "rgb(242, 183, 105)",
                                    color: "rgb(0, 0, 0)",
                                    fontFamily: montserrat.style.fontFamily,
                                    fontSize: {
                                        xs:"body2.fontSize",
                                        sm:"body1.fontSize",
                                        md:"body1.fontSize",
                                        lg:"body1.fontSize",
                                    },
                                    borderRadius: 3,
                                    boxShadow: 3,
                                    ml:{xs:5,sm:30,md:50,lg:50},
                                    mb: 2
                                }}
                                onClick={handleSaveChanges}
                            >
                                Save
                            </Button>
                            <Button
                                sx={{
                                    backgroundColor: "rgba(0, 0, 0, 0.52)",
                                    color: "rgb(255, 255, 255)",
                                    fontFamily: montserrat.style.fontFamily,
                                    fontSize: {
                                        xs:"body2.fontSize",
                                        sm:"body1.fontSize",
                                        md:"body1.fontSize",
                                        lg:"body1.fontSize",
                                    },
                                    borderRadius: 3,
                                    boxShadow: 3,
                                    mb: 2
                                }}
                                onClick={()=>setIsEditing(false)}
                            >
                                Cancel
                            </Button>

                        </Box>
                        }
                        

                        <Box
                            sx={{
                                overflow: "auto",
                                textOverflow: 'clip', // Cut off the text without showing ellipsis
                                whiteSpace: 'normal', // Allow text to wrap to the next line
                                wordBreak: 'break-word', // Ensure long words break to fit inside the box
                                backgroundColor: "rgba(246, 224, 188, 0.43)",
                                p: 2,
                                borderRadius: 3,
                                boxShadow: 2,
                                width: {xs: "100%", lg: "100%"}
                            }}
                        >
                                {!isEditing?
                                <Typography 
                                    // display="block"
                                    variant='body1'
                                    sx={{
                                        fontFamily: montserrat.style.fontFamily,
                                        color: "black",
                                        fontSize: { 
                                            xs: "body1.fontSize", 
                                            lg: "h5.fontSize" 
                                        },
                                        wordWrap: "break-word",
                                        whiteSpace: "pre-wrap",
                                    }}
                                >
                                    {content?.story}
                                </Typography>:
                                <TextField
                                    variant="outlined"
                                    fullWidth
                                    multiline
                                    rows={12}
                                    value={travelStory}
                                    sx={{
                                        backgroundColor: "#fff",
                                        color: "#000",
                                        borderRadius: 3,
                                        mt: 1,
                                        mb: 3,
                                        width: {xs: 160, sm: 300, md: 600, lg:600},
                                        '.MuiInputBase-input': {
                                            fontFamily: montserrat.style.fontFamily, 
                                            fontSize: {
                                                xs:'0.7rem',
                                                sm:'0.9rem',
                                                md:'1rem',
                                                lg:'1.2rem'
                                            }
                                        },
                                    }}

                                    onChange={(e) => {
                                        sessionStorage.setItem('story', e.target.value)
                                        setTravelStory(e.target.value);
                                    }}
                                />}
                        </Box>
                    </Box>
                    {/* <WoodenCircle
                        sx={{
                            width: { xs: "100%", sm: "30%", md: "25%", lg: "20%" },
                            height: { xs: "3%", sm: "5%", md: "7%", lg: "10%" },
                        }}
                    /> */}
                </Box>}
        </>
    );
};

export default LocationStoryDisplay;