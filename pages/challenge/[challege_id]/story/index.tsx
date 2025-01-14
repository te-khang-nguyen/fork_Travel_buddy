import React, { use, useState, useRef, useEffect } from "react";
import {
    styled,
    Box,
    Typography,
    Card,
    Snackbar,
    Alert,
    Stack,
    Fab,
    Menu,
    MenuItem
} from "@mui/material";
import { Share } from "@mui/icons-material";
import {
    FacebookShareButton,
    FacebookIcon,
    TwitterShareButton,
    TwitterIcon,
} from 'next-share';
import CustomButton from "@/app/components/kits/CustomButton";
import { useRouter } from "next/router";
import LocationStoryDisplay from "@/app/components/challenge/LocationStoryDisplay";
import { useGetChallengeQuery } from "@/libs/services/user/challenge";
import { baseUrl } from "@/app/constant";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
    weight: '400',
    subsets: ['latin']
});

const StoryPageUI = () => {
    const [locationIndex, setLocationIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { challege_id } = router.query;

    const {data: challengeData} = useGetChallengeQuery({challengeId: challege_id})
    console.log(challengeData);
    const challengeTitle = challengeData? challengeData?.data?.[0].title : "";

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleShareClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({
        open: false,
        message: "",
        severity: "success",
    });
    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    const handleClick = (id) => {
        setLocationIndex(id);
        setIsOpen(true);
    };

    const historyData = [
        {
            id: 0,
            title: "Kickoff at the Vespa Hub",
            userQuestionSubmission: `The group gathered at Vespa Adventures’ headquarters, the buzzing starting point of the Saigon After Dark tour. A mix of excitement and curiosity filled the air as everyone met their guides and hopped on the retro-style Vespas. Each rider adjusted their helmets while soaking in the evening vibes of Saigon’s streets. The hum of the scooters added to the thrill as they set off, weaving through the chaotic yet fascinating traffic.\n
Their first stop wasn’t far. Everyone dismounted, laughing as they exchanged first impressions of the city’s organized chaos. The guides, with their infectious energy, made sure everyone felt like a local already. Cameras clicked, and the group was ready to dive headfirst into the night’s adventure.`,
            userMediaSubmission: [
                'https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/challenge/12476348-2704-408c-8355-0f689627213c/Demo%20Challenge/StorySample/Sample1_1.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjaGFsbGVuZ2UvMTI0NzYzNDgtMjcwNC00MDhjLTgzNTUtMGY2ODk2MjcyMTNjL0RlbW8gQ2hhbGxlbmdlL1N0b3J5U2FtcGxlL1NhbXBsZTFfMS53ZWJwIiwiaWF0IjoxNzM2NDM2MzIyLCJleHAiOjE3Njc5NzIzMjJ9.OxLzilEGFClP-CIftwPkrYbmJuls3wILfycylFxQcYY&t=2025-01-09T15%3A31%3A55.002Z',
                'https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/challenge/12476348-2704-408c-8355-0f689627213c/Demo%20Challenge/StorySample/Sample1_2.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjaGFsbGVuZ2UvMTI0NzYzNDgtMjcwNC00MDhjLTgzNTUtMGY2ODk2MjcyMTNjL0RlbW8gQ2hhbGxlbmdlL1N0b3J5U2FtcGxlL1NhbXBsZTFfMi53ZWJwIiwiaWF0IjoxNzM2NDM2MzM5LCJleHAiOjE3Njc5NzIzMzl9.C-Yr18hQDemVkjuUy5pTs2zW-WD-DQe3klbzPRJVro0&t=2025-01-09T15%3A32%3A11.171Z'
            ],
        },
        {
            id: 1,
            title: "Street Food Feast in District 3",
            userQuestionSubmission: `The first food stop was a street-side eatery, bustling with locals. The aroma of sizzling meats and herbs greeted the group as they squeezed into low stools around metal tables. The guide introduced the menu—banh xeo (Vietnamese pancakes), grilled skewers, and fresh spring rolls.\n
            Everyone eagerly dug in, balancing their plates on their knees while marveling at the bold flavors. The guides demonstrated how to wrap banh xeo with leafy greens and dip it in tangy fish sauce. Some travelers struggled at first, but laughter erupted as they got the hang of it. Between bites, the group exchanged travel stories, quickly bonding over their shared love for food and adventure.`,
            userMediaSubmission: [
                'https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/challenge/12476348-2704-408c-8355-0f689627213c/Demo%20Challenge/StorySample/Sample2_1.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjaGFsbGVuZ2UvMTI0NzYzNDgtMjcwNC00MDhjLTgzNTUtMGY2ODk2MjcyMTNjL0RlbW8gQ2hhbGxlbmdlL1N0b3J5U2FtcGxlL1NhbXBsZTJfMS53ZWJwIiwiaWF0IjoxNzM2NDM2MzQ1LCJleHAiOjE3Njc5NzIzNDV9.mI5CCah2izXw92qBj_yscSonxkXpo_XGMDbDbNkN6cI&t=2025-01-09T15%3A32%3A17.957Z',
                'https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/challenge/12476348-2704-408c-8355-0f689627213c/Demo%20Challenge/StorySample/Sample2_2.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjaGFsbGVuZ2UvMTI0NzYzNDgtMjcwNC00MDhjLTgzNTUtMGY2ODk2MjcyMTNjL0RlbW8gQ2hhbGxlbmdlL1N0b3J5U2FtcGxlL1NhbXBsZTJfMi53ZWJwIiwiaWF0IjoxNzM2NDM2MzU3LCJleHAiOjE3Njc5NzIzNTd9.4UnWI3yEOC6rs7qObtVfy3NPwFqCHHZI6pFscCubmhk&t=2025-01-09T15%3A32%3A29.156Z',
                'https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/challenge/12476348-2704-408c-8355-0f689627213c/Demo%20Challenge/StorySample/Sample5.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjaGFsbGVuZ2UvMTI0NzYzNDgtMjcwNC00MDhjLTgzNTUtMGY2ODk2MjcyMTNjL0RlbW8gQ2hhbGxlbmdlL1N0b3J5U2FtcGxlL1NhbXBsZTUud2VicCIsImlhdCI6MTczNjQzOTQ1OCwiZXhwIjoxNzY3OTc1NDU4fQ.B4HEkjRWXdCVvcQrztv-Cv8mMM4ow09SVF5BRmcDwbI&t=2025-01-09T16%3A24%3A10.504Z',
                'https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/challenge/12476348-2704-408c-8355-0f689627213c/Demo%20Challenge/StorySample/Sample6.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjaGFsbGVuZ2UvMTI0NzYzNDgtMjcwNC00MDhjLTgzNTUtMGY2ODk2MjcyMTNjL0RlbW8gQ2hhbGxlbmdlL1N0b3J5U2FtcGxlL1NhbXBsZTYud2VicCIsImlhdCI6MTczNjQzOTUwNiwiZXhwIjoxNzY3OTc1NTA2fQ.m05_rS0mdtGebZmc62J7HAhzU2a0Rb5zfghaTeJS-jA&t=2025-01-09T16%3A24%3A58.119Z'

            ],
        },
        {
            id: 2,
            title: "Night Market Buzz",
            userQuestionSubmission: `Next, the Vespas sped towards a lively night market. Brightly lit stalls lined the street, displaying everything from knock-off sneakers to colorful trinkets. The guides led the group through the maze of vendors, sharing tips on haggling and pointing out the best finds.\n
            One traveler couldn’t resist buying a pair of sandals, while another marveled at the variety of exotic fruits. A juice stall became a popular pit stop, with everyone slurping on refreshing sugarcane juice. The crowd, the lights, and the non-stop chatter made it feel like they were in the heart of Saigon’s pulse.`,
            userMediaSubmission: [
                'https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/challenge/12476348-2704-408c-8355-0f689627213c/Demo%20Challenge/StorySample/Sample3_1.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjaGFsbGVuZ2UvMTI0NzYzNDgtMjcwNC00MDhjLTgzNTUtMGY2ODk2MjcyMTNjL0RlbW8gQ2hhbGxlbmdlL1N0b3J5U2FtcGxlL1NhbXBsZTNfMS53ZWJwIiwiaWF0IjoxNzM2NDM2Mzc2LCJleHAiOjE3Njc5NzIzNzZ9.nWz00LvWZ3pgVi0yLtQ_ZFZ8QH5A9ryt3XhVQGD9axc&t=2025-01-09T15%3A32%3A48.754Z',
                'https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/challenge/12476348-2704-408c-8355-0f689627213c/Demo%20Challenge/StorySample/Sample3_2.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjaGFsbGVuZ2UvMTI0NzYzNDgtMjcwNC00MDhjLTgzNTUtMGY2ODk2MjcyMTNjL0RlbW8gQ2hhbGxlbmdlL1N0b3J5U2FtcGxlL1NhbXBsZTNfMi53ZWJwIiwiaWF0IjoxNzM2NDM2Mzg1LCJleHAiOjE3Njc5NzIzODV9._qnToO-HnNSyzKYZn2fox9X5zNk3mdNDEuv834TnUPA&t=2025-01-09T15%3A32%3A57.620Z'
            ],
        },
        {
            id: 3,
            title: "Hidden Alleyway Café",
            userQuestionSubmission: `The guides took the group to a hidden gem—a small café tucked away in a narrow alley. The sound of live acoustic music greeted them as they climbed up to the rooftop. The view was breathtaking, with Saigon’s skyline twinkling in the distance.\n
            The group sipped on Vietnamese coffee, its strong, sweet flavor a perfect pick-me-up for the night. Some tried the famous egg coffee, pleasantly surprised by its creamy texture. Sitting under string lights, everyone relaxed, sharing their favorite moments from the tour so far. It felt like they’d known each other forever.`,
            userMediaSubmission: [
                'https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/challenge/12476348-2704-408c-8355-0f689627213c/Demo%20Challenge/StorySample/Sample3_2.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjaGFsbGVuZ2UvMTI0NzYzNDgtMjcwNC00MDhjLTgzNTUtMGY2ODk2MjcyMTNjL0RlbW8gQ2hhbGxlbmdlL1N0b3J5U2FtcGxlL1NhbXBsZTNfMi53ZWJwIiwiaWF0IjoxNzM2NDM2Mzg1LCJleHAiOjE3Njc5NzIzODV9._qnToO-HnNSyzKYZn2fox9X5zNk3mdNDEuv834TnUPA&t=2025-01-09T15%3A32%3A57.620Z',
                'https://kkhkvzjpcnivhhutxled.supabase.co/storage/v1/object/sign/challenge/12476348-2704-408c-8355-0f689627213c/Demo%20Challenge/StorySample/Sample4_2.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjaGFsbGVuZ2UvMTI0NzYzNDgtMjcwNC00MDhjLTgzNTUtMGY2ODk2MjcyMTNjL0RlbW8gQ2hhbGxlbmdlL1N0b3J5U2FtcGxlL1NhbXBsZTRfMi53ZWJwIiwiaWF0IjoxNzM2NDM2NDAzLCJleHAiOjE3Njc5NzI0MDN9.pEgCA9c_cGLSX301_bIaZxvg-so4E0gjyFG9GUDDCvc&t=2025-01-09T15%3A33%3A15.433Z'
            ],
        },
    ]

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "rgb(252, 241, 216)",
                p: 2,
                fontSize: '1.2rem',
                alignItems: "center",
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
                    mb: 3,
                }}
            >
                <Typography
                    variant="h2"
                    sx={{
                        fontSize: { xs: "h5.fontSize", sm: "h4.fontSize", md: "h3.fontSize", lg: "h2.fontSize" },
                        fontFamily: montserrat.style.fontFamily,
                        color: "black",
                        textAlign: "center"
                    }}>
                    {`Your ${challengeTitle||'Travel'} Diaries`}
                </Typography>
            </Box>

            {/* Location Cards Container */}
            <Box display="flex" alignItems="center" justifyContent="center" position="relative" width="80%">

                {/* Stack Image Buttons */}
                <Stack
                    spacing={{ xs: 1, sm: 1, md: 1, lg: 2 }}
                    direction={{ xs: 'column', sm: 'column', md: 'column', lg: 'row' }}
                    useFlexGap
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                        display: "flex",
                        gap: "1rem",
                        scrollBehavior: "smooth",
                        width: "80%",
                        overflowX: "auto",
                        "&::-webkit-scrollbar": { display: "none" }, // Optional: Hide scrollbar
                        pb: 1,
                        flexWrap: 'wrap'
                    }}
                >
                    {historyData?.map((content, index) => (
                        <CustomButton
                            key={index}
                            content={content}
                            onClick={() => { handleClick(content.id) }}
                        />
                    ))}
                </Stack>
            </Box>
            <LocationStoryDisplay
                content={historyData?.[locationIndex]}
                open={isOpen}
                onClose={() => { setIsOpen(false) }}
            />
            <Fab
                size="small"
                sx={{
                    position: "absolute",
                    top: "12%",
                    right: "2%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(251, 146, 0, 0.2)"
                }}
                onClick={handleShareClick}
            >
                <Share
                    sx={{
                        color: "rgb(0, 0, 0)",
                        "&:hover": {
                            color: "rgb(77, 147, 244)",
                        },
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
                <MenuItem sx={{borderRadius: 100}}>
                    <FacebookShareButton
                        url={`${baseUrl + router.asPath}`}
                        quote={`My amazing blog for the ${challengeTitle} trip.`}
                        hashtag={`#${challengeTitle}:\n ${baseUrl + router.asPath}`}
                    >
                        <FacebookIcon size={32} round />
                    </FacebookShareButton>
                </MenuItem>
                <MenuItem sx={{borderRadius: 100}}>
                    <TwitterShareButton 
                        url={`${baseUrl + router.asPath}`}
                        title={`My amazing blog for the ${challengeTitle} trip.`}
                    >
                        <TwitterIcon size={32} round />
                    </TwitterShareButton>
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default StoryPageUI;