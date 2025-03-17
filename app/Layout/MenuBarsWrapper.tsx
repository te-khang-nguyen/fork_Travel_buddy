import React, { ReactNode, useEffect, useState } from "react";
import { FaPenNib } from "react-icons/fa6";
import { LiaPenNibSolid } from "react-icons/lia";
import { FiPenTool } from "react-icons/fi";
import { RiQuillPenAiLine } from "react-icons/ri";
import { ImCompass2 } from "react-icons/im";
import { FiCompass } from "react-icons/fi";
import { PiCompassFill } from "react-icons/pi";
import { GoPerson } from "react-icons/go";
import { GoPersonAdd } from "react-icons/go";
import { GoGear } from "react-icons/go";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { RiLoginBoxLine } from "react-icons/ri";
import {
  AppBar,
  Box,
  CssBaseline,
  Menu,
  MenuItem,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Fab,
  useTheme, 
  useMediaQuery,
  Grid2,
  Drawer,
  Checkbox, FormControlLabel
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { useRouter } from "next/router";
import {
  AccountCircle, 
  Inventory, 
  Logout, 
  MenuBook,
} from "@mui/icons-material";
import AddIcon from '@mui/icons-material/Add';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import HomeIcon from "@mui/icons-material/Home";
import { useLogOutMutation } from "@/libs/services/user/auth";
import AccountSwitcher from "@app/components/profile/business/AccountSwitcher";
import { store } from "@/libs/store";
import { UserProfileApi } from '@/libs/services/user/profile';
import { StoryApi } from '@/libs/services/user/story';
import { ChannelApi } from "@/libs/services/user/channel";

import { PUBLIC_ROUTES } from "./WithAuthRedirect";



const StyledFab = styled(Fab)({
  position: 'absolute',
  zIndex: 1,
  top: -15,
  left: 0,
  right: 0,
  margin: '0 auto',
});

interface DrawerLayoutProps {
  children: ReactNode;
  showMenuBars?: boolean;
}

const drawerWidth = 240;

const MenuBarsLayout: React.FC<DrawerLayoutProps> = ({
  children,
  showMenuBars = false,
}) => {
  const router = useRouter();
  const [logout] = useLogOutMutation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [ colorOnClicked, setColorOnClicked ] = useState<{
    text:string;
    color:string
  }[]>([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState<null | HTMLElement>(null);
  const [buttonContext, setButtonContext] = useState(false);
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null

  const IconStyle = {
    // transform: 'rotate(90deg)',
    fontSize: '30px',
    color: "white"
  }

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuOpen(event.currentTarget);
  };

  const handleClose = async () => {
    setMenuOpen(null);
  };

  const handleButtonClicked = async (item: any) => {
    router.push(item.route);
    setColorOnClicked([{
        text: item.text,
        color: "rgb(53, 126, 254)",
      },
      ...colorOnClicked
        .filter(e => e.text !== item.text)
        .map((e) => ({
          text: e.text,
          color: e.text !== "Add new"? "primary" : "rgb(53, 126, 254)",
        }))
    ]);
    // await router.replace(item.route);
    // return
  }

  const handleLogOut = async () => {
    logout();
    setColorOnClicked([]);
    localStorage.clear();
    sessionStorage.clear();
    // store.dispatch(UserProfileApi.util.resetApiState());
    // store.dispatch(StoryApi.util.resetApiState());
    // store.dispatch(ChannelApi.util.resetApiState());
    await router.replace(role==="user"? '/' : '/login/business');
    setMenuOpen(null);
  };

  const defaultMenuItems = [
    { 
      text: role==="user"?"Explore":"Dashboard", 
      icon: <ImCompass2 />, 
      route: `/destination/select` 
    },
    { 
      text: "Profile", 
      icon: <GoPerson />, 
      route: `/profile/${role}` },
    { 
      text: "Add new", 
      icon: role === "user"? 
        <RiQuillPenAiLine style={IconStyle} /> : <AddIcon style={IconStyle} />, 
      route: role === "user"? `/profile/${role}/story/create` : `/destination/create`
    },
  ];

  const menuItems =
    role === "user"
      ? [
          // { text: "Challenge", icon: <Inventory />, route: `/challenge` },
          { text: "Settings", icon: <GoGear />, route: `/settings/${role}` },
      ]
      : [
          {
            text: "Destination Management",
            icon: <Inventory />,
            route: `/destination/business`,
          },
          { 
            text: "Settings", 
            icon: <SettingsOutlinedIcon />, 
            route: `/profile/${role}`
          },
        ];
  
  useEffect(()=>{
      setColorOnClicked(
        [...defaultMenuItems, ...menuItems].map((item) => ({
            text: item.text,
            color: "primary"
        }))
      );
  },[]);

  const items = (
    <Toolbar 
      variant = "dense"
      sx={{
        gap: isMobile? 2 : 47
      }}
    > 
        {[...defaultMenuItems, ...menuItems].map((item, index) => (
          <Box
            key={index}
          >
            {item.text == "Add new" ? 
             <Box
              sx={{
                padding: 1
              }}
             >
              <StyledFab
                size="small"
                sx={{
                  backgroundColor: "rgb(53, 126, 254)",
                  color: "rgb(53, 126, 254)",
                  left: "27%",
                  "&:active": {
                    backgroundColor: "rgb(53, 126, 254)",
                    color: "rgb(53, 126, 254)",
                  },
                  "&:focus": {
                    backgroundColor: "rgb(53, 126, 254)",
                    color: "rgb(53, 126, 254)",
                  }
                }}
                onClick={()=>{handleButtonClicked(item)}}
              >
                {item.icon}
              </StyledFab>
              </Box>:
              <Box
                display="flex"
                flexDirection={isMobile? "column" : "row"}
              >
                <IconButton
                  disableRipple
                  sx={{
                    color: colorOnClicked?.find(e => e.text === item.text)?.color || "primary",
                    gap:1,
                    fontSize: isMobile? "1.2rem":"2rem"
                  }}
                  onClick={()=>{handleButtonClicked(item)}}
                >
                  {item.icon}
                  <Typography
                    variant="body1"
                  >
                    {item.text}
                  </Typography>
                </IconButton>
              </Box>}
          </Box>
        ))}
    </Toolbar>
  );

  const mobileBottomBar = (
    <AppBar
          position="fixed"
          sx={{
            display: "flex",
            flexDirection: "row",
            backgroundColor: "white",
            color: "rgb(38, 107, 209)",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            top: "auto",
            bottom: 0,
          }}
        >
          {items}
    </AppBar>
  );

  const drawer = (
      <Box
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
          
        }}
      >
        <Toolbar />
        <List
          sx={{
            display:"flex",
            flexDirection: "column",
            gap: 2
          }}
        >
          <Box
              sx={{
                display: "flex", 
                flexDirection: "row",
                mt: -7, 
                ml: 1
              }}
            >
              <IconButton
                onClick={()=>router.push(`/dashboard/${role}`)}
              >
              <PiCompassFill 
                style={{
                  color: "rgb(38, 107, 209)",
                  transform: 'rotate(135deg)',
                  fontSize: '36px'
                }}
              />
              </IconButton>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "rgb(38, 107, 209)",
                mt: 1,
                ml: 1
              }}
            >
              Travel Buddy
            </Typography>
            </Box>
          {[...defaultMenuItems, ...menuItems].map((item) => (
            item.text !== "Add new" &&
            (<ListItem
              key={item.text}
              onClick={() => handleButtonClicked(item)}
              sx={{
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.08)", // Light gray background on hover
                  cursor: "pointer",
                },
                transition: "background-color 0.3s", // Smooth transition effect
              }}
            >
              <ListItemIcon
                sx={{
                  fontSize: "30px"
                }}
              >{item.icon}</ListItemIcon>
              <ListItemText 
                primary={
                  item.text==="Add new"? 
                  role === "user"? 
                    "Write your story" 
                    : "Create new destination"
                    : item.text
                } 
              />
            </ListItem>)
          ))}
        </List>
      </Box>
  );

  const drawerDisplay = (
    <Drawer
      variant="temporary"
      open={drawerOpen}
      onClose={handleDrawerToggle}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        "& .MuiDrawer-paper": { 
          width: drawerWidth, 
          boxSizing: "border-box" 
        },
      }}
    >
      {drawer}
    </Drawer>
  );



  const menuId = 'user-account-menu'
  const renderMenu = (
    <Menu
      anchorEl={menuOpen}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={!!menuOpen}
      onClose={handleClose}
    >
      <MenuItem onClick={() => role? handleLogOut() : router.push('/')}>
        {role? <><RiLogoutBoxRLine style={{color: "red", fontSize: "20px", marginRight: 3}}/> <p>Logout</p></> 
        : <><RiLoginBoxLine style={{color: "green", fontSize: "20px", marginRight: 3}}/> <p>Login</p></>}
      </MenuItem>
    </Menu>
  )

  return (
    <Box sx={{ 
      display: "flex", 
      flexDirection: "column", 
      height: "100vh",
      flexGrow: 1
     }}>
      <CssBaseline />
      {showMenuBars &&  (
        <>
        <AppBar
          position="fixed"
          sx={{
            backgroundColor: "white",
            color: "black",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Toolbar
            sx={{
              width: "100%",
              display:"flex",
              justifyContent:"space-betwen",
            }}
          >
            {/* <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ "aria-label": "search" }}
              />
            </Search> */}

            {!isMobile && role && 
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ 
                  mr: 2,
                }}
              >
                <MenuIcon /> 
              </IconButton>}


            <Box
              sx={{
                display: "flex", 
                flexDirection: "row", 
              }}
            >
            <IconButton
                onClick={()=>role? router.push(`/dashboard/${role}`) 
                : router.push(`/story`) }
              >
              <PiCompassFill 
                style={{
                  color: "rgb(38, 107, 209)",
                  transform: 'rotate(135deg)',
                  fontSize: '36px'
                }}
              />
            </IconButton>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "rgb(38, 107, 209)",
                mt: 1,
                ml: 1,
                mr: 5,
              }}
            >
              Travel Buddy
            </Typography>

            {/* <FormControlLabel
              control={<Checkbox />}
              label="I did it"
              sx={{
                fontWeight: "bold",
                color: "rgb(38, 107, 209)",
                mt: 1,
                ml: 1,
                mr: 5,
              }}
            /> */}
            </Box>
            
            {!isMobile && role && 
              <>
              {defaultMenuItems.map((item, index) => (
                item.text === "Add new" &&
                <StyledFab
                  key={index}
                  size="small"
                  sx={{
                    display:"flex",
                    flexDirection: "row",
                    backgroundColor: "rgb(53, 126, 254)",
                    color: "rgb(53, 126, 254)",
                    top: 10,
                    "&:hover": {
                      backgroundColor: "rgb(53, 126, 254)",
                    },
                    gap: 1
                  }}
                  // onMouseOver={() => setButtonContext(true)}
                  // onMouseOut={() => setButtonContext(false)}
                  onClick={()=>{handleButtonClicked(item)}}
                >
                  {item.icon}
                  
                </StyledFab>
                
              ))}
              {/* {buttonContext && 
                  <Typography
                    variant="h6"
                    sx={{
                      backgroundColor: "rgb(139, 184, 247)",
                      color: "white",
                    }}
                  >
                    Write your story
                </Typography>} */}
              </>
            }
            {<IconButton
              size="large"
              color="inherit"
              aria-label="account popover"
              aria-controls={menuId}
              edge="end"
              onClick={handleOpen}
              sx={{
                position:"fixed",
                right: 10
              }}
            >
              <AccountCircle 
                fontSize="large"
                sx={{
                  color: "rgb(112, 112, 112)"
                }}
              />
            </IconButton>}
            {role === "business" && (
              <AccountSwitcher />
            )}
            
          </Toolbar>
        </AppBar>
        {role? isMobile? mobileBottomBar : drawerDisplay : <></>}
        {renderMenu}
      </>)
      }
      <Box
        component="main"
        sx={{
          flex: 1,
          marginTop: showMenuBars ? "64px" : 0, //should move to constant height of appbar
          overflow: "auto",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};



export default MenuBarsLayout;
