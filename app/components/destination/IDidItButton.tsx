import { Box, Button } from "@mui/material"
import { useEffect, useState } from "react";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

const IDidItSection = ({
  checked,
  text,
  onClick
}: {
  checked: boolean;
  text?:string;
  onClick?: () => void;
}) => {
    
    const handleClick = () => {
        onClick?.();
    };
    return(
      <Box sx={{ 
        position: 'fixed', top: {xs: 8, sm: 13 , lg: 13}, left: {xs: 200, sm: 330 ,lg: 400}, zIndex: 1200 }}>
        <Button
            onClick={handleClick}
            // color="white"
            variant={checked ? "contained" : "contained"}
            // Conditionally show the icon only when not in the "Like" state.
            startIcon={!checked
                ? <CheckBoxOutlineBlankIcon /> 
                : <CheckBoxIcon />
            }
            sx={{
                textTransform: 'none',
                // Set a rectangular shape: height is not too tall and width is more than 4 times the height.
                height: '40px',
                minWidth: '140px',
                // Increase opacity when in "not like" state
                opacity: checked ? 1.0 : 1.0,
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
            disabled={checked}
        >
            {/* {checked ? "I did it" : "Let's do it"} */}
            {text ?? "I Did It!"}
        </Button>
      </Box>
    )
  }

export default IDidItSection;