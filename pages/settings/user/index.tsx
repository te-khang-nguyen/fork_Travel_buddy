import React, {useState, useEffect} from "react";
import { PiCompassFill } from "react-icons/pi";
import { SlSocialInstagram } from "react-icons/sl";
import {
    Box,
    TextField,
    Typography,
    Button,
    Paper,
    IconButton,
    Snackbar,
    Alert,
    useTheme,
    useMediaQuery,
    Container
} from "@mui/material";
import {
    useCreateChannelMutation,
    useGetAllChannelsQuery,
    useUpdateChannelMutation,
    ChannelProps
} from "@/libs/services/user/channel";
import { ImInsertTemplate } from "react-icons/im";
import { Channel } from "diagnostics_channel";
import TableWithButton from "@/app/components/generic_components/TableWithButton";
import { RowProps } from "@/app/components/generic_components/TableRow";
import TextFormModal from "@/app/components/generic_components/TextFormModal";


export const channelFieldsHeaderMap = [
    {
        fieldName: "name",
        header: "Channel Title"
    },
    {
        fieldName: "url",
        header: "Channel URL"
    },
    {
        fieldName: "brand_voice",
        header: "Your Channel Prompt",
        rows: 7
    }
];

export const channelTypes = [
    {
        name: "Travel Buddy",
        icon: <PiCompassFill 
                        style={{
                          color: "rgb(46, 121, 226)",
                          transform: 'rotate(135deg)',
                          fontSize: '36px'
                        }}
                      />
    },
    {
        name: "Instagram",
        icon: <SlSocialInstagram
                style={{ 
                    color: "rgb(46, 121, 226)",
                    fontSize: '36px' 
                }}/>
    }
]


const SettingsPageUI = () => {
    const [createChannel] = useCreateChannelMutation();
    const [updateChannel] = useUpdateChannelMutation();

    const {data: channelsData, isFetching} = useGetAllChannelsQuery();

    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [isClicked, setIsClicked] = useState<boolean>(false);

    const [snackbar, setSnackbar] = useState<{
                open: boolean;
                message: string;
                severity: "success" | "error";
            }>({
                open: false,
                message: "",
                severity: "success",
            });
    
    const handleCloseSnackbar = () => setSnackbar({ 
        ...snackbar, 
        open: false 
    });
    

    const [channels, setChannels] = useState<RowProps[]>([]);

    useEffect(()=>{
        if(channelsData?.data){
            setChannels(channelsData?.data?.map((item)=>({
                id: item.id || "",
                name: item.name || "",
                type: item.channel_type || "",
                url: item.url || "",
                text: item.brand_voice || ""
            })));
        }
    },[channelsData]);

    const handleAddChannel = async (channelInfo: {
        name?: string;
        channel_type?: string;
        url?: string;
        brand_voice?: string;
    }) => {
        setIsClicked(true);
        const result = await createChannel({payload: channelInfo});

        if(result?.data){
            setSnackbar({
                open: true,
                message: result?.data["message"],
                severity: "success"
            });
            setIsClicked(false);
        } else {
            
            setSnackbar({
                open: true,
                message: result?.error as string,
                severity: "error"
            });
            setIsClicked(false);
        }
    }

    const handleUpdateChannel = async (currentChannel: {id: string; text: string}) => {
        const result = await updateChannel({
            channelId: currentChannel.id, 
            payload: {brand_voice: currentChannel.text}
        });
        
        if(result?.data){
            setSnackbar({
                open: true,
                message: "Brand voice is updated!",
                severity: "success"
            });
        } else {
            setSnackbar({
                open: true,
                message: result?.error as string,
                severity: "error"
            });
        }
    }

    return (
        <Container>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: 2,
                    alignItems: "flex-start",
                    justifyContent: "center",
                    mt: 10,
                    p: 2,
                    overflowY: "auto",
                }}
            >
                <Box
                    sx={{
                        display:"flex",
                        flexDirection:"row",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 2,
                        mb: 2,
                        width: "100%"
                    }}
                >
                    <Typography
                       variant="h5"
                       sx={{
                        fontWeight: "bold"
                       }}
                    >
                        Channels
                    </Typography>

                    <Button
                        variant="outlined"
                        sx={{
                            borderColor: "green",
                            color: "green",
                            left: 0,
                        }}
                        onClick={() => setModalOpen(true)}
                    >
                        Add Channel
                    </Button>

                    <TextFormModal
                        open={modalOpen}
                        onClose={() => setModalOpen(false)}
                        mainTitle="Add New Channel"
                        collection={channelFieldsHeaderMap}
                        onSubmit={handleAddChannel}
                        selections={channelTypes}
                        isLoading={isClicked}
                    />

                </Box>

                <TableWithButton
                    tableData={channels}
                    isFetching={isFetching}
                    onRowSubmit={(row) => handleUpdateChannel(row)}
                    withButton
                    isButtonClicked={isClicked}
                />



                {/* <Typography
                    variant="h5"
                >
                    Privacy
                </Typography>

                <Box>

                </Box> */}
            </Box>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={10000}
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
        </Container>
    )
}

export default SettingsPageUI;