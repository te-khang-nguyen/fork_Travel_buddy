import React, { useEffect, useState } from 'react';
import { RxAvatar } from "react-icons/rx";
import { VscHubot } from "react-icons/vsc";
import {
  Typography,
  CircularProgress,
  IconButton,
  Button,
  Box,
  Paper,
  Grow,
  TextField,
  InputAdornment,
  Modal,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';



export interface ChatInitialContent {
  title: string;
  description: string;
  tags: {
    tagName: string;
    fullText: string;
  }[];
  promptQuestion?: string;
}


const InitialResponseLayout: React.FC<{
    content: ChatInitialContent, 
    setContent: (text: string) => void;
}> = ({content, setContent}) =>(
            <Box sx={{
              display: "flex", 
              flexDirection: "column", 
              justifyContent:"center",
              alignItems:"center",
              boxShadow: 3, 
              p:2}}>
              <Typography variant="h6" sx={{fontWeight: "bold"}}>
                {content.title}
              </Typography>
              <Typography variant="body1">
                {content.description}
              </Typography>
              <Typography variant="body1">
              </Typography>
              <Typography variant="h6" sx={{mt: 5}}>
                {"What would you like to know more?"}
              </Typography>

              <Box sx={{
                display: "flex", 
                flexDirection: "row", 
                justifyContent:"center",
                alignItems:"center",
                boxShadow: 0, 
                gap: 2,
                p:2
              }}>
                {content.tags.map((tag, index) => (
                  <Button
                    variant='contained'
                    key={index}
                    sx={{
                      backgroundColor: "rgba(32, 171, 193, 0.76)",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "11px",
                      borderRadius: 2
                    }}
                    onClick={()=> setContent(tag.fullText.trim())}
                  >
                    {`${tag.tagName}`}
                  </Button>
                ))}
                
              </Box>

            </Box>
  );

  const ResponseLayout: React.FC<{response: string}> = ({response}) => (
            <Box sx={{
              display: "flex", 
              flexDirection: "column", 
              justifyContent:"flex-start",
              alignItems:"flex-start",
              alignSelf: "flex-start",
              boxShadow: 3, 
              p:2,
              ml: 2,
              width:"50%"
              }}
            >
              
              <Typography variant="body2"
                sx={{
                  wordWrap: "break-word",
                  whiteSpace: "pre-wrap",
                }}
              >
                {response}
              </Typography>
            </Box>
  )

  const UserMessageLayout: React.FC<{message: string}> = ({message}) => (
            <Box sx={{
              display: "flex", 
              flexDirection: "column", 
              justifyContent:"flex-end",
              alignItems:"flex-end",
              alignSelf: "flex-end",
              boxShadow: 3, 
              mr: 2,
              p:2,
              width:"50%"
              }}>

                
                <Typography variant="body2" 
                    sx={{
                        wordWrap: "break-word",
                        whiteSpace: "pre-wrap",
                    }}
                >
                    {message}
                </Typography>
            </Box>
  )

const ChatBoxSection: React.FC<{
    content: ChatInitialContent,
    response: string;
    message: string;
    open: boolean;
    inputs: string;
    setOpen: () => void;
    setInputs: (text: string) => void;
    displayMess: string;
    isLoading: boolean;
    handleChat: () => void;
    clearChat: () => void;
  }> = ({
  content, 
  response, 
  message,
  open,
  inputs,
  setOpen,
  setInputs,
  displayMess,  
  isLoading,
  handleChat,
  clearChat,
}) => {
    return(
      <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000,  }}>
        <Modal
          open={open}
          onClose={setOpen}
          sx={{
            position: "absolute",
            top: 40,
            left: 400,
            width: "100%",
            minWidth: 450
          }}
        >
          <Paper
            elevation={4}
            sx={{
              display: "flex",
              flexDirection: "column",
              width: { xs: 300, sm: 750 },
              height: { xs: 400, sm: 600 },
              p: 2,
              mb: 1, 
              
            }}
          >
            <Box sx={{
                display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 3
              }}>
            <Typography variant="h6" gutterBottom>
                Explore with your AI Buddy (Beta)
            </Typography>
            <Button
                variant='outlined'
                color='inherit'
                onClick={clearChat}
            >
                Clear chat
            </Button>
            </Box>

            <Box
              sx={{
                display: "flex", 
                flexDirection: "column", 
                justifyContent:"center",
                alignItems:"center",
                overflowY: "auto", 
                gap: 3
              }}
            >

            <InitialResponseLayout 
                content={content}
                setContent={setInputs}
            />

            {/* <Grow in={checked}> */}
            {displayMess !== "" ?<Box sx={{
              display: "flex", 
              flexDirection: "row", 
              justifyContent:"flex-end",
              alignItems:"flex-start",
              alignSelf: "flex-end",
              mr: 2,
              }}>
            <UserMessageLayout message={message} /> 
            <RxAvatar style={{fontSize: "20px"}}/>
            </Box> : <></>}
            {/* </Grow> */}

            {isLoading && 
            <CircularProgress sx={{
              display: "flex", 
              flexDirection: "column", 
              justifyContent:"flex-start",
              alignItems:"flex-start",
              alignSelf: "flex-start",
              m: 2,
              }}/>}
            {/* <Grow in={checked}> */}
            {response !== "" ?<Box
            sx={{
              display: "flex", 
              flexDirection: "row", 
              justifyContent:"flex-start",
              alignItems:"flex-start",
              alignSelf: "flex-start",
              ml: 2,
              mt: 2,
            }}><VscHubot style={{fontSize: "30px"}}/>
             <ResponseLayout response={response}/> 
            </Box>: <></>}
            {/* </Grow> */}

            </Box>

            <TextField
              variant="outlined"
              value={inputs}
              multiline
              rows={2}
              onChange={(e)=>setInputs(e.target.value)}
              sx={{
                fontSize: "body1.fontSize",
                width: "100%"
              }}
              slotProps={{
                input: {
                  endAdornment: 
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="send-message"
                      onClick={handleChat}
                      edge="end"
                    >
                      <SendIcon />
                    </IconButton>
                  </InputAdornment>
                }}}
            />
            <Button
              variant="outlined"
              color="primary"
              onClick={setOpen}
              sx={{ 
                mt: 2,
                fontSize: "10px" 
              }}
            >
              Close
            </Button>
          </Paper>
        </Modal>
        <Button
          variant="contained"
          color="secondary"
          onClick={setOpen}
        >
          Explore with your AI Buddy (Beta)
        </Button>
      </Box>
    )
  }

export default ChatBoxSection;