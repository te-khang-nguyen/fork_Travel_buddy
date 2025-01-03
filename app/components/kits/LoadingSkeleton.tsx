// components/LoadingSkeleton.js
import React from "react";
import { Skeleton, Box, Typography } from "@mui/material";

interface CustomLoadingParameter {
    isLoading: boolean;
    skeletonLayout?: any
}

const LoadingSkeleton: React.FC<CustomLoadingParameter> = ({ isLoading, skeletonLayout }) => {
    if (isLoading) {
        return (
            <Box>
                {skeletonLayout ?
                    (skeletonLayout) : (
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center", // Changed from center to flex-start
                                width: "100%",
                                minHeight: "100vh", // Use minHeight instead of height
                                py: 2, // Vertical padding
                                px: { xs: 1, sm: 2, md: 4 }, // Responsive horizontal padding
                                boxSizing: "border-box",
                            }}
                        >
                            <Skeleton variant="text" width="30%" height={80} animation="wave" />
                            <Skeleton variant="rectangular" width="80%" height={200} animation="wave" />
                            <Skeleton variant="text" width="60%" height={50} animation="wave" />
                            <Skeleton variant="text" width="60%" height={50} animation="wave" />
                            <Skeleton variant="text" width="60%" height={50} animation="wave" />
                            <Skeleton variant="rectangular" width="100%" height={150} animation="wave" />
                        </Box>
                    )}
            </Box>
        )
    }
};

export default LoadingSkeleton;
