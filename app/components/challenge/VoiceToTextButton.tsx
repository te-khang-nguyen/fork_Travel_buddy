import React, { useRef, useState, useReducer } from "react";
import {
    Box,
    Fab,
    Typography,
    Snackbar,
    Alert,
} from "@mui/material";
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import StopIcon from '@mui/icons-material/Stop';
import PulsingFab from "../kits/PulsingFab";

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
    " dash": "-"
}

let persistedListening = false;

const VoiceToTextButton: React.FC<VoiceButtonForm> = ({ 
    language, 
    onTranscribe, 
    existingTexts 
}) => {
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

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
        return (<Box>
            <Typography>
                Your browser does not suport speech recognition!
            </Typography>
        </Box>)
    }

    let recognition = new SpeechRecognition();
    recognition.continous = true; // Keep listening until stop event
    recognition.interimResults = false; // Show only the finalized results
    recognition.lang = language; // Set language

    const listeningEventTrigger = () => {
        if (persistedListening) {
            persistedListening = false;
            setIsListening(false);
            recognition.stop();
            recognition = new SpeechRecognition();
            return;
        }
        
        recognition.onend = () => {
            if (persistedListening) {
                recognition.start();
                setTimeout(() => {
                    persistedListening = false;
                    setIsListening(false);
                    recognition.stop();
                    recognition = new SpeechRecognition();
                }, 300000); // Five minute standy after restart for any speech before termination
                return;
            }
        };
    
        recognition.onerror = (event) => {
            let timeout;
            if (event.error == "no-speech") {
                timeout = setTimeout(() => {
                    setSnackbar({
                        open: true,
                        message: "Do you want to say something?",
                        severity: "warning"
                    });
                }, 180000);
            } else if (event.error == "aborted") {
                setSnackbar({
                    open: true,
                    message: "Sorry! Your message was aborted. Please try again!",
                    severity: "error"
                });
            }
            clearTimeout(timeout);
        };
    
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

        setIsListening(true);
        persistedListening = true;
        recognition.start();

    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'flex-end', // Aligns the button to the right
                alignItems: 'flex-end', // Aligns the button vertically at the bottom of the Box
            }}
        >

            <PulsingFab
                variant="circular"
                size="small"
                color="primary"
                onClick={listeningEventTrigger}
                isPulsing={isListening} 
            >
                {isListening ? <StopIcon/> : <GraphicEqIcon />}
            </PulsingFab>

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