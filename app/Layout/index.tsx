import React, { ReactNode } from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import { useRouter } from "next/router";

const drawerWidth = 240;

interface DrawerLayoutProps {
  children: ReactNode;
  showDrawerButton?: boolean; // Prop to control visibility of the app bar and drawer button
}

const DrawerLayout: React.FC<DrawerLayoutProps> = ({ children, showDrawerButton = false }) => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const router = useRouter();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

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
        {[
          { text: "Home", icon: <HomeIcon />, route: "/" },
          { text: "About", icon: <InfoIcon />, route: "/about" },
        ].map((item) => (
          <ListItem
            key={item.text}
            onClick={() => {
              router.push(item.route);
              setDrawerOpen(false); // Close drawer after navigation
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
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {showDrawerButton && (
        <AppBar position="fixed">
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
            <Typography variant="h6" noWrap component="div">
              My App
            </Typography>
          </Toolbar>
        </AppBar>
      )}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
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
          flexGrow: 1,
          p: 3,
          marginLeft: { sm: 0 }, // No reserved space for the drawer
        }}
      >
        {showDrawerButton && <Toolbar />} {/* Keeps content below the app bar */}
        {children}
      </Box>
    </Box>
  );
};

export default DrawerLayout;
