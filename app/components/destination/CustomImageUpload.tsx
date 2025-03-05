import React, { useState } from "react";
import {
    Typography,
    Box,
} from "@mui/material";
import ImageUploader from "@app/components/image_picker/ImagePicker";


const CustomImageUpload = ({
    text_display,
    optional,
    allowMultiple,
    handleImageUpload,
    onChange
}) => {
    return (
        <Box>
            <Typography
                variant="body2"
                sx={{ marginBottom: 0.5, fontWeight: 500 }}
            >
                {text_display}
                <Typography
                    component="span"
                    color="error"
                    sx={{ marginLeft: 0.5 }}
                >
                    {!optional ? "*" : ""}
                </Typography>
            </Typography>
            <ImageUploader
                allowMultiple={allowMultiple}
                withDropzone={true}
                onImageUpload={(uploadedImages) => {
                    // Call both the original handleImageUpload and the new onChange
                    if (handleImageUpload) {
                        handleImageUpload(uploadedImages);
                    }
                    if (onChange) {
                        onChange(uploadedImages);
                    }
                }}
                withResize={true}
            />
        </Box>
    )
};

export default CustomImageUpload;
