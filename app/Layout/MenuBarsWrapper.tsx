import React, { ReactNode, useEffect, useState } from "react";
import { FaPenNib } from "react-icons/fa6";
import { LiaPenNibSolid } from "react-icons/lia";
import { ImCompass2 } from "react-icons/im";
import { FiCompass } from "react-icons/fi";
import { PiCompassFill } from "react-icons/pi";
import { GoPerson } from "react-icons/go";
import { GoPersonAdd } from "react-icons/go";
import {
  AppBar,
  Box,
  CssBaseline,
  Menu,
  MenuItem,
  IconButton,
  InputBase,
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

const MenuBarsLayout: React.FC<DrawerLayoutProps> = ({
  children,
  showMenuBars = false,
}) => {
  const [logout] = useLogOutMutation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [ colorOnClicked, setColorOnClicked ] = useState<{
    text:string;
    color:string
  }[]>([]);

  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null

  const [menuOpen, setMenuOpen] = useState<null | HTMLElement>(null);
  const router = useRouter();

  const IconStyle = {
    transform: 'rotate(90deg)',
    fontSize: isMobile? '30px' : '40px',
    color: "white"
  }

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuOpen(event.currentTarget);
  };

  const handleClose = async () => {
    setMenuOpen(null);
  };

  const handleButtonClicked = (item: any) => {
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
  }

  const handleLogOut = async () => {
    logout();
    setColorOnClicked([]);
    localStorage.clear();
    sessionStorage.clear();
    await router.replace(role==="user"? '/' : '/login/business');
    setMenuOpen(null);
  };

  const defaultMenuItems = [
    { 
      text: role==="user"?"Explore":"Dashboard", 
      icon: <ImCompass2 />, 
      route: `/dashboard/${role}` 
    },
    { 
      text: "Profile", 
      icon: <GoPerson />, 
      route: `/profile/${role}` },
    { 
      text: "Add new", 
      icon: role === "user"? 
        <LiaPenNibSolid style={IconStyle} /> : <AddIcon style={IconStyle} />, 
      route: role === "user"? `/profile/${role}/story/create` : `/`
    },
  ];

  const menuItems =
    role === "user"
      ? [
          // { text: "Challenge", icon: <Inventory />, route: `/challenge` },
          { text: "Settings", icon: <SettingsOutlinedIcon />, route: `/profile/${role}` },
      ]
      : [
          {
            text: "Challenge Management",
            icon: <Inventory />,
            route: `/profile/business/#challenges`,
          },
          {
            text: "Create Account",
            icon: <GoPersonAdd />,
            route: `/profile/business/createAccount`,
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
        {[...defaultMenuItems, ...menuItems].map((item) => (
          <>
            {item.text == "Add new" ? 
             <Box
              sx={{
                padding: 1
              }}
             >
              <StyledFab
                size={isMobile? "small": "large"}
                sx={{
                  backgroundColor: colorOnClicked?.find(e => e.text === item.text)?.color,
                  color: colorOnClicked?.find(e => e.text === item.text)?.color,
                  left: isMobile? "27%":"45%",
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
          </>
        ))}
    </Toolbar>
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
      <MenuItem onClick={handleLogOut}>Logout</MenuItem>
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
            <Box
              sx={{
                display: "flex", 
                flexDirection: "row", 
              }}
            >
            <PiCompassFill 
              style={{
                color: "rgb(38, 107, 209)",
                transform: 'rotate(135deg)',
                fontSize: '36px'
              }}
            />
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "rgb(38, 107, 209)",
                top: 1,
                ml: 1
              }}
            >
              Travel Buddy
            </Typography>
            </Box>
            <IconButton
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
            </IconButton>
            {role === "business" && (
              <AccountSwitcher />
            )}
            
          </Toolbar>
        </AppBar>
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
