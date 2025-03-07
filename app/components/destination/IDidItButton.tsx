import { Box, Button } from "@mui/material"
import { useEffect, useState } from "react";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { Destination } from "@/libs/services/user/destination";

const IDidItSection = ({id}: {id: string}) => {
    const [liked, setLiked] = useState(false);
    const chosenId = localStorage.getItem("chosenId");

    useEffect(()=>{
      setLiked(id === chosenId);
    },[chosenId]);
    
    const handleClick = () => {
        setLiked(prev => !prev);
        localStorage.setItem("chosenId", id);

    // TODO: Add your API call here to update the status in the database.
    // e.g., updateLikeStatus(!liked);
    };
    return(
      <Box sx={{ 
        position: 'fixed', top: {xs: 8, sm: 13 , lg: 13}, left: {xs: 200, sm: 330 ,lg: 400}, zIndex: 10000 }}>
        <Button
            onClick={handleClick}
            // color="white"
            variant={liked ? "contained" : "contained"}
            // Conditionally show the icon only when not in the "Like" state.
            startIcon={id !== chosenId? !liked
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