import React, { ReactNode, useState } from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import HomeIcon from "@mui/icons-material/Home";
import { styled, alpha } from "@mui/material/styles";
import { useRouter } from "next/router";
import { AccountCircle, Inventory, Logout, MenuBook } from "@mui/icons-material";
import { useLogOutMutation } from "@/libs/services/user/auth";
import AccountSwitcher from "@app/components/profile/business/AccountSwitcher";
import { store } from "@/libs/store";
import { UserProfileApi } from '@/libs/services/user/profile';
import { StoryApi } from '@/libs/services/user/story';
import { BusinessProfileApi } from '@/libs/services/business/profile';
import { JoinChallengeApi } from '@/libs/services/user/challenge';
import { ChallengeApi } from '@/libs/services/business/challenge';
import { LocationApi } from '@/libs/services/business/location';


const drawerWidth = 240;
const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.grey[200], 0.9),
  "&:hover": {
    backgroundColor: alpha(theme.palette.grey[300], 0.9),
  },
  border: "1px solid grey",
  margin: "0 auto",
  width: "100%",
  maxWidth: "600px",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
  },
}));

interface DrawerLayoutProps {
  children: ReactNode;
  showDrawerButton?: boolean;
}

const DrawerLayout: React.FC<DrawerLayoutProps> = ({
  children,
  showDrawerButton = false,
}) => {
  const [logout] = useLogOutMutation();

  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const router = useRouter();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogOut = async (item: any) => {
    if (item.text == "Logout") {
      logout();
      localStorage.clear();
      sessionStorage.clear();
      // store.dispatch(UserProfileApi.util.resetApiState());
      // store.dispatch(StoryApi.util.resetApiState());
      // store.dispatch(BusinessProfileApi.util.resetApiState());
      // store.dispatch(JoinChallengeApi.util.resetApiState());
      // store.dispatch(ChallengeApi.util.resetApiState());
      // store.dispatch(LocationApi.util.resetApiState());
    }
    await router.replace(item.route);
    setDrawerOpen(false);
  };

  const defaultMenuItems = [
    { text: "Dashboard", icon: <HomeIcon />, route: `/dashboard/${role}` },
    { text: "Destination", icon: <AccountCircle />, route: `/destination` },
  ];

  const menuItems =
    role === "user"
      ? [
          // { text: "Challenge", icon: <Inventory />, route: `/challenge` },
          { text: "My stories", icon: <MenuBook />, route: `/profile/user/story` },
          {
            text: "Logout",
            icon: <Logout />,
            route: `/`,
          },
        ]
      : [
          {
            text: "Challenge Management",
            icon: <Inventory />,
            route: `/profile/business/#challenges`,
          },
          {
            text: "Create Account",
            icon: <AccountCircle />,
            route: `/profile/business/createAccount`,
          },
          {
            text: "Logout",
            icon: <Logout />,
            route: `/login/business`,
          },
        ];

  const drawer = (
    <Box
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
      }}
    >
      <Toolbar />
      <List>
        {[...defaultMenuItems, ...menuItems].map((item) => (
          <ListItem
            key={item.text}
            onClick={async () => handleLogOut(item)}
            sx={{
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.08)", // Light gray background on hover
                cursor: "pointer",
              },
              transition: "background-color 0.3s", // Smooth transition effect
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <CssBaseline />
      {showDrawerButton && (
        <AppBar
          position="fixed"
          sx={{
            backgroundColor: "white",
            color: "black",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ "aria-label": "search" }}
              />
            </Search>
            {role === "business" && (
              <AccountSwitcher />
            )}
          </Toolbar>
        </AppBar>
      )}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        {drawer}
      </Drawer>
      <Box
        component="main"
        sx={{
          flex: 1,
          marginTop: showDrawerButton ? "64px" : 0, //should move to constant height of appbar
          overflow: "auto",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};



export default DrawerLayout;
