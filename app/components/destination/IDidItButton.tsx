import { Box, Button } from "@mui/material"
import { useEffect, useState } from "react";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

const IDidItSection = ({id}: {id: string}) => {
    const [liked, setLiked] = useState(false);
    const chosenIds = JSON.parse(localStorage.getItem("chosenIds") || "[]");

    console.log(chosenIds?.includes(id));

    useEffect(()=>{
      setLiked(chosenIds?.includes(id));
    },[chosenIds]);
    
    const handleClick = () => {
        setLiked(prev => !prev);
        localStorage.setItem("chosenIds", JSON.stringify([...chosenIds, id]));

    // TODO: Add your API call here to update the status in the database.
    // e.g., updateLikeStatus(!liked);
    };
    return(
      <Box sx={{ 
        position: 'fixed', top: {xs: 8, sm: 13 , lg: 13}, left: {xs: 200, sm: 330 ,lg: 400}, zIndex: 1200 }}>
        <Button
            onClick={handleClick}
            // color="white"
            variant={liked ? "contained" : "contained"}
            // Conditionally show the icon only when not in the "Like" state.
            startIcon={!chosenIds?.includes(id)? !liked
                ? <CheckBoxOutlineBlankIcon /> 
                : <CheckBoxIcon />
                : <CheckBoxIcon />
            }
            sx={{
                textTransform: 'none',
                // Set a rectangular shape: height is not too tall and width is more than 4 times the height.
                height: '40px',
                minWidth: '140px',
                // Increase opacity when in "not like" state
                opacity: liked ? 1.0 : 1.0,
                borderRadius: 2,
                boxShadow: "none",
                backgroundColor: "rgba(252, 252, 252, 0)",
                color: "green",
                "&:hover": {
                  boxShadow: 0,
                },
                fontSize: {xs: "15px", sm: "20px" , lg: "20px"}
            }}
            disableRipple
        >
            {/* {liked ? "I did it" : "Let's do it"} */}
            {"I Did It!"}
        </Button>
      </Box>
    )
  }

export default IDidItSection;