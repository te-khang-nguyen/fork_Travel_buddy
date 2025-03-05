import React from "react";
import { Typography } from "@mui/material";
import TextField from "@mui/material/TextField";
import { Controller, Control } from "react-hook-form";


interface TextInputForUserProps {
    item_name: string;
    value?: string;
    onChange?: (value: string) => void;
    label?: string;
    optional?: boolean;
    control: Control<any>;
    rules?: object;
    defaultValue?: string;
    num_rows?: number;
}

function convertUnderscoreToText(str, caseType) {
    // Replace underscores with spaces
    const formattedStr = str.replace(/_/g, ' ');

    switch (caseType) {
        case 'title': // Convert to Title Case
        return formattedStr.replace(/\b\w/g, char => char.toUpperCase());

        case 'upper': // Convert to Upper Case
        return formattedStr.toUpperCase();

        case 'lower': // Convert to Lower Case
        return formattedStr.toLowerCase();

        default:
        return formattedStr; // Return as is if no valid case type is provided
    }
}

const email_rules={
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address'
    }
  }

const TextInputForUser: React.FC<TextInputForUserProps> = ({
    item_name, control, defaultValue= "", optional=true, num_rows = 1,
}) => {
  return (
    <>
    <Typography
        variant="body2"
        sx={{ marginTop: 0.5, marginBottom: 0.8, fontWeight: 500 }}
    >
        {convertUnderscoreToText(item_name, "title")}
        <Typography
            component="span"
            color="error"
            sx={{ marginLeft: 0.5 }}
        >
            {!optional ? "*" : ""}
        </Typography>
    </Typography>
    <Controller
        name={item_name}
        control={control}
        defaultValue={defaultValue}
        rules={item_name==="email"
            ? email_rules 
            : !optional 
                ? { required: `${convertUnderscoreToText(item_name, "title")} is required` } 
                : undefined
            }
        render={({ field, fieldState: { error } }) => (
            <TextField
            {...field}
            label={convertUnderscoreToText(item_name, "title")}
            multiline={num_rows > 1}
            rows={num_rows}
            fullWidth
            variant="outlined"
            margin="normal"
            error={!!error}
            helperText={error ? error.message : ""}
            />
        )}
    />
    </>
  );
};

export default TextInputForUser;
