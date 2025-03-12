import React from "react";
import {
    Typography,
    Box,
} from "@mui/material";
import ImageUploader from "@app/components/image_picker/ImagePicker";
import { Controller, Control } from "react-hook-form";

interface ImageInputProps {
    name: string;
    text_display: string;
    control: Control<any>;
    optional?: boolean;
    allowMultiple?: boolean;
}

export const CustomImageUpload = ({
    text_display,
    optional,
    allowMultiple,
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
                    // if (handleImageUpload) {
                    //     handleImageUpload(uploadedImages);
                    // }
                    if (onChange) {
                        onChange(uploadedImages);
                    }
                }}
                withResize={true}
            />
        </Box>
    )
};

const ImageInput = ({ name, text_display, control, optional=true, allowMultiple=true }: ImageInputProps) => {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value } }) => (
                <CustomImageUpload
                    text_display={text_display}
                    optional={optional}
                    allowMultiple={allowMultiple}
                    onChange={onChange}
                />
            )}
        />
    )
}

export default ImageInput;
