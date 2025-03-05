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
import ImageCarousel from '../generic_components/ImageCarousel';
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
    content: {
        title: string;
        story: string;
        media: string[];
        destination: string;
    };
    isTriggered?: boolean;
    isPublic?: boolean;
    onSaveChanges?: (storyUpdated: {
        title: string;
        updatedStory: string
    }) => void;
    onPublished?: () => void;
    onTrigger?: () => void;
}

const LocationStoryDisplay: React.FC<LocationStoryProps> = ({ 
    content,
    isTriggered, 
    isPublic,
    onSaveChanges,
    onPublished,
    onTrigger,
}) => {
    const carouselRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    
    const [imageError, setImageError] = useState(false);
    const [imageIndex, setImageIndex] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [travelStory, setTravelStory] = useState<string>('');
    const [seoTitle, setSeoTitle] = useState<string>('');
    const [media, setMedia] = useState<string[]>([]);
    const persitedTexts = sessionStorage.getItem("story");
    const persistedSeoTitle = sessionStorage.getItem("title")

    useEffect(() => {
        if (!content) {
            setImageIndex(null);
        } else {
            setSeoTitle(persistedSeoTitle || content.title);
            setTravelStory(persitedTexts || content?.story);
            setMedia(content?.media ?? []);
        }
    }, [content]);

    const handleSaveChanges = () => {
        onSaveChanges?.({title: seoTitle, updatedStory: travelStory});
    };

    const handleArchive = () => {
        onTrigger?.();
    };

    const handlePublishing = () => {
        onPublished?.();
    };

    const editingButtons = 
        (<Box
            position="absolute"
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems:"center",
                justifyContent:"flex-start",
                gap: 1,
                mb: 2,
                top: 70,
                left: 10,
                zIndex: 2
            }}
        >
        {isTriggered || isEditing? <></>:
            <Button
                size="small"
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
                    // ml:{xs:5,sm:30,md:50,lg:50},
                }}
                onClick={()=>setIsEditing(true)}
                // disabled={isTriggered}
            >
                Edit
            </Button>}
            <Button
                sx={{
                    backgroundColor: "rgba(21, 228, 17, 0.73)",
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
                onClick={handlePublishing}
            >
                Publish
            </Button>
        </Box>);

    return (
        <>
        {!isPublic && (<>{editingButtons}</>)}
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
                        image={content?.media?.[imageIndex - 1]}
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
                    flexDirection= "column"
                    alignItems="center"
                    position="relative"
                    sx={{
                        p: {xs: 0, sm: 0, md: 1, lg: 1},
                        maxWidth: {xs: "80%", sm: "80%", md: "80%", lg: "100%"},
                        height: "100%",
                        bottom: 5,
                    }}
                >
                    <Box
                                position="relative"
                                justifyContent="center"
                                sx={{
                                    display: "inline-flex",
                                    borderRadius: 2,
                                    backgroundColor: "rgba(255, 220, 171, 0)",
                                    p: 4,
                                    width: "80%"
                                }}
                            >
                                {isEditing? 
                                <TextField
                                    value={seoTitle}
                                    onChange={(e)=>{
                                        setSeoTitle(e.target.value);
                                        sessionStorage.setItem("title", e.target.value);
                                    }}
                                    sx={{
                                        backgroundColor: "#fff",
                                        color: "#000",
                                        borderRadius: 3,
                                        mt: 1,
                                        mb: 3,
                                        width: {xs: 300, sm: 300, md: 600, lg:1300},
                                        '.MuiInputBase-input': {
                                            fontFamily: montserrat.style.fontFamily, 
                                            fontSize: {
                                                xs:'0.7rem',
                                                sm:'0.9rem',
                                                md:'1rem',
                                                lg:'1.3rem'
                                            }
                                        },
                                    }}
                                />
                                
                                :
                                <Typography
                                    variant="h2"
                                    sx={{
                                        fontSize: { 
                                            xs: "h6.fontSize", 
                                            sm: "h5.fontSize", 
                                            md: "h4.fontSize", 
                                            lg: "h3.fontSize" 
                                        },
                                        fontWeight: "bold",
                                        fontFamily: montserrat.style.fontFamily,
                                        color: "black",
                                        textAlign: "center",
                                    }}>
                                    {seoTitle || `An Travel Experience around ${content.destination}`}
                                </Typography>}
                        </Box>
                    <ImageCarousel
                        images={media}
                        sx={{
                            position: 'relative',
                            width: {xs: "90%", sm: "90%", md: "45%", lg: "30%"},
                            height: "100%",
                            mb: 4
                        }}
                        onCardClick={(idx) => setImageIndex((idx?? 0) + 1)}
                    />
                    
                    <Box
                        sx={{
                            display:"flex",
                            flexDirection:"row",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 2,
                            m: 2
                        }}
                    >
                    <Typography 
                        variant="h5" 
                        sx={{
                            fontFamily: montserrat.style.fontFamily,
                            fontWeight : "bold"
                        }}
                    >
                      Destination:  
                    </Typography>
                    <Typography 
                        variant="h6" 
                        sx={{
                            fontFamily: montserrat.style.fontFamily,
                        }}>
                        {content.destination}
                    </Typography>
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

                        {isEditing && (
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
                                    backgroundColor: "rgba(228, 17, 17, 0.73)",
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
                                Archive
                            </Button>
                            <Button
                                sx={{
                                    backgroundColor: "rgb(255, 255, 255)",
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

                        </Box>)}
                        
                        <Box
                            sx={{
                                display: "flex",
                                // overflow: "auto",
                                textOverflow: 'clip', // Cut off the text without showing ellipsis
                                whiteSpace: 'normal', // Allow text to wrap to the next line
                                wordBreak: 'break-word', // Ensure long words break to fit inside the box
                                backgroundColor: "rgba(255, 255, 255, 0.33)",
                                p: 2,
                                borderRadius: 3,
                                // boxShadow: 2,
                                width: {xs: "100%", sm: "100%", md:"80%", lg: "80%"}
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
                                    multiline
                                    rows={12}
                                    value={travelStory}
                                    sx={{
                                        backgroundColor: "#fff",
                                        color: "#000",
                                        borderRadius: 3,
                                        mt: 1,
                                        mb: 3,
                                        width: {xs: 300, sm: 300, md: 600, lg:1300},
                                        '.MuiInputBase-input': {
                                            fontFamily: montserrat.style.fontFamily, 
                                            fontSize: {
                                                xs:'0.7rem',
                                                sm:'0.9rem',
                                                md:'1rem',
                                                lg:'1.3rem'
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