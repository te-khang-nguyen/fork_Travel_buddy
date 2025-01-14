import React from 'react';
import { styled, Box, ButtonBase, Typography } from '@mui/material/';
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  weight: '400',
  subsets: ['latin']
});

const ImageButton = styled(ButtonBase)(({ theme }) => ({
    position: 'relative',
    //height: 200,
    [theme.breakpoints.down('sm')]: {
        width: '100% !important', // Overrides inline-style
        height: 100,
    },
    '&:hover, &.Mui-focusVisible': {
        zIndex: 1,
        '& .MuiImageBackdrop-root': {
            opacity: 0.15,
        },
        '& .MuiImageMarked-root': {
            opacity: 0,
        },
        '& .MuiTypography-root': {
            border: '4px solid currentColor',
        },
    },
}));

const ImageSrc = styled('span')({
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center 40%',
});

const Image = styled('span')(({ theme }) => ({
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.common.white,
}));

const ImageBackdrop = styled('span')(({ theme }) => ({
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: theme.palette.common.black,
    opacity: 0.4,
    transition: theme.transitions.create('opacity'),
}));

const ImageMarked = styled('span')(({ theme }) => ({
    height: 3,
    width: 50,
    backgroundColor: theme.palette.common.white,
    position: 'absolute',
    bottom: -2,
    left: 'calc(45% - 9px)',
    transition: theme.transitions.create('opacity'),
}));

interface CustomButtonProps {
    content: any;
    onClick?: () => void;
}

const CustomButton: React.FC<CustomButtonProps> = ({ content, onClick }) => {
    const buttonWidth = 40;//Math.floor(Math.random() * (60 - 10) + 10);
    const buttonHeight = 100 - buttonWidth;
    return (
        <Box
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                minHeight: {xs:180, lg:200},
                minWidth: {xs:200, lg:100},
                height: `${buttonHeight}%`,
                width: `${buttonWidth}%`,
                border: 5,
                borderColor: "white",
                borderRadius: 1,
                boxShadow: 10,
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            <ImageButton
                focusRipple
                key={content.id}
                sx={{
                    height: {xs:180, lg:200},
                    width: 300,
                }}
                onClick={onClick}
            >
                <ImageSrc style={{ backgroundImage: `url(${content.userMediaSubmission?.[0]})` }} />
                <ImageBackdrop className="MuiImageBackdrop-root" />
                <Image>
                    <Typography
                        component="span"
                        variant="h4"
                        color="inherit"
                        sx={(theme) => ({
                            position: 'relative',
                            p: 4,
                            pt: 2,
                            pb: `calc(${theme.spacing(1)} + 6px)`,
                            fontFamily: montserrat.style.fontFamily,
                            fontSize: {xs: "h5.fontSize", sm: "h5.fontSize", lg: "h4.fontSize"}
                        })}
                    >
                        {content.title}
                        <ImageMarked className="MuiImageMarked-root" />
                    </Typography>
                </Image>
            </ImageButton>
        </Box>
    );
};

export default CustomButton;


