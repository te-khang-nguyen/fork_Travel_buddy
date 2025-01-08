import React from "react";
import {
    Box,
    Card,
    Typography,

} from "@mui/material";
import Image from 'next/image';
import maintenance from "@/assets/maintenance.gif";

const MaintenancePlaceholder: React.FC = () => {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Image
                src={maintenance}
                alt="Content Placeholder"
                width={500}
                height={500}
                style={{ borderRadius: '10px' }}
                unoptimized
            />
            <Card sx={{ p: 2, backgroundColor: "rgba(169, 251, 248, 0.68)" }}>
                <Typography variant="h3" color="error">
                    Sorry! Service is currently unavailable!
                </Typography>
            </Card>
        </Box>
    );
}

export default MaintenancePlaceholder;

