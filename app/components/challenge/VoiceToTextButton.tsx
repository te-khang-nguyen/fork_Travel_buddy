import React, { useState } from "react";
import {
    Box,
    Fab,
    Typography,
    Snackbar,
    Alert,
} from "@mui/material";
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import StopIcon from '@mui/icons-material/Stop';

interface VoiceButtonForm {
    language: string;
    onTranscribe: (voiceTranscription: string) => void;
    existingTexts: string
}

const punctuations = {
    " comma": ",",
    " period": ".",
    " question mark": "?",
    " exclamation mark": "!",
    " semicolon": ";",
    " colon": ":",
    " dash": "-",
}

const VoiceToTextButton: React.FC<VoiceButtonForm> = ({ language, onTranscribe, existingTexts }) => {
    let cummulativeTranscript = existingTexts;
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error" | "warning";
    }>({
        open: false,
        message: "",
        severity: "success",
    });

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });
    const [isListening, setIsListening] = useState(false);

    const SpeechRecognition =
        typeof window !== 'undefined' && (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
        return (<Box>
            <Typography>
                Your browser does not suport speech recognition!
            </Typography>
        </Box>)
    }

    const recognition = new SpeechRecognition();
    recognition.continous = true; // Keep listening until stop event
    recognition.interimResults = false; // Show only the finalized results
    recognition.lang = language; // Set language

    const startListening = () => {
        setIsListening(true);
        recognition.start();

        recognition.onresult = (event) => {
            const rawTranscription = event.results?.[0]?.[0]?.transcript;

            const currentTranscription = rawTranscription.charAt(0).toUpperCase() + rawTranscription.slice(1);

            const punctuatedTranscript = currentTranscription
                            .replace(/(\s)(comma|period|question mark|exclamation mark|semicolon|colon|dash)/gi, (matched) => {
                                return punctuations[matched];
                            });

            cummulativeTranscript += " " + (punctuatedTranscript || currentTranscription);

            cummulativeTranscript = cummulativeTranscript.replace(/[.!?](\s)(\w)/g, s => s.toUpperCase());

            cummulativeTranscript = cummulativeTranscript.replace(/[-,:;](\s)(\w)/g, s => s.toLowerCase());

            onTranscribe(cummulativeTranscript);
        };

        recognition.onerror = (event) => {
            console.error('Speech transcription error:', event.error);
            if (event.error == "no-speech") {
                setSnackbar({
                    open: true,
                    message: "Do you want to say something?",
                    severity: "warning"
                });
            } else if (event.error == "aborted") {
                setSnackbar({
                    open: true,
                    message: "Sorry! Your message was aborted. Please try again!",
                    severity: "error"
                });
            }

        };

        recognition.onend = () => {
            setIsListening(false);
            recognition.stop();
        };

    };

    const stopListening = () => {
        setIsListening(false);
        recognition.stop();
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'flex-end', // Aligns the button to the right
                alignItems: 'center', // Aligns the button vertically in the center of the Box
                margin: '10px',
            }}
        >
            {isListening ?
                <Fab
                    variant="circular"
                    size="small"
                    color="primary"
                    onClick={stopListening}
                >
                    <StopIcon />
                </Fab> :
                <Fab
                    variant="circular"
                    size="small"
                    color="primary"
                    onClick={startListening}
                >
                    {<GraphicEqIcon />}
                </Fab>
            }


            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    )

};

export default VoiceToTextButton;