import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

const LikeButton = () => {
  // true indicates the "Like" state, false indicates "not like"
  const [liked, setLiked] = useState(false);

  const handleClick = () => {
    setLiked(prev => !prev);

    // TODO: Add your API call here to update the status in the database.
    // e.g., updateLikeStatus(!liked);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
      <Button
        onClick={handleClick}
        color="inherit"
        variant={liked ? "outlined" : "contained"}
        // Conditionally show the icon only when not in the "Like" state.
        startIcon={!liked ? <ThumbUpIcon /> : null}
        sx={{
          textTransform: 'none',
          // Set a rectangular shape: height is not too tall and width is more than 4 times the height.
          height: '40px',
          minWidth: '180px',
          // Increase opacity when in "not like" state
          opacity: liked ? 0.7 : 1.0,
          borderRadius: 2,
          boxShadow: "none",
        }}
      >
        {liked ? "Liked" : "Like"}
      </Button>
    </Box>
  );
};

export default LikeButton;
