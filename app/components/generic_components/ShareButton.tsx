import React, {useState} from "react";
import { 
    Box, 
    Fab, 
    Menu,  
    MenuItem,
} from "@mui/material";
import { Share } from "@mui/icons-material";
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import { LuShare2 } from "react-icons/lu";
import {
    FacebookShareButton,
    FacebookIcon,
    TwitterShareButton,
    TwitterIcon,
} from 'next-share';
import { baseUrl } from "@/app/constant";
import { useRouter } from "next/router";

interface ShareButtonProps {
    texts: {
        [x: string] : string;
    };
    disabled?: boolean
}


const ShareButton: React.FC<ShareButtonProps> = ({
    texts,
    disabled
}) => {
    const router = useRouter();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
        const [open, setOpen] = useState<boolean>(false);

    const handleShareClick = (event: React.MouseEvent<HTMLButtonElement>) => {
            setOpen(true);
            setAnchorEl(event.currentTarget);
        };
        const handleClose = () => {
            setAnchorEl(null);
            setOpen(false);
        };

    return (
        <>
        {/* Sharing To Social Channels*/ }
        
        <Fab
        size="small"
        sx={{
            position: "absolute",
            top: "12%",
            right: "2%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgb(255, 255, 255)",
            boxShadow: 200,
        }}
        onClick={handleShareClick}
        disabled={disabled}
    >
        <LuShare2
            style={{
                color: "rgb(0, 0, 0)",
                fontSize: "20px"
                // "&:hover": {
                //     color: "rgb(77, 147, 244)",
                // },
            }}

        />
    </Fab>

    <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        sx={{

            justifyContent: "center",
            alignItems: "center",
        }}
        MenuListProps={{
            'aria-labelledby': 'basic-button',
        }}
        slotProps={{
            paper: {
                elevation: 0,
                sx: {
                    borderRadius: 7,
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    backgroundColor: "rgb(255, 255, 255)",
                    ml: 1.6,
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                    },
                    '&::before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        left: "43%",
                        width: 10,
                        height: 10,
                        bgcolor: "rgb(255, 255, 255)",
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                    },
                },
            },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
        <MenuItem sx={{ borderRadius: 100 }}>
            <FacebookShareButton
                url={`${baseUrl + router.asPath}`}
                quote={`My amazing blog for the ${texts.title} trip.`}
                hashtag={`#${texts.title}:\n ${baseUrl + router.asPath}`}
            >
                <FacebookIcon size={32} round />
            </FacebookShareButton>
        </MenuItem>
        <MenuItem sx={{ borderRadius: 100 }}>
            <TwitterShareButton
                url={`${baseUrl + router.asPath}`}
                title={`My amazing blog for the ${texts.title} trip.`}
            >
                <TwitterIcon size={32} round />
            </TwitterShareButton>
        </MenuItem>
    </Menu>
    </>
    );
};

export default ShareButton;