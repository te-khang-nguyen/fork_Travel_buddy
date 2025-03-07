import { Box, Button } from "@mui/material"
import { useState } from "react";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { Destination } from "@/libs/services/user/destination";

const IDidItSection: React.FC<{destination: Destination}> = ({destination}) => {
    const [liked, setLiked] = useState(true);
    
    const handleClick = () => {
        setLiked(prev => !prev);

    // TODO: Add your API call here to update the status in the database.
    // e.g., updateLikeStatus(!liked);
    };
    return(
      <Box sx={{ position: 'fixed', top: 80, right: 16, zIndex: 1000 }}>
        <Button
            onClick={handleClick}
            color="secondary"
            variant={liked ? "contained" : "contained"}
            // Conditionally show the icon only when not in the "Like" state.
            startIcon={!liked 
                ? <CheckBoxOutlineBlankIcon /> 
                : <CheckBoxIcon />
                // : null
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
            }}
        >
            {liked ? "I did it" : "Let's do it"}
        </Button>
      </Box>
    )
  }

export default IDidItSection;