import React, { useState } from "react";
import { Box, List, ListItem, ListItemIcon, ListItemText, Avatar, Typography, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import MessageIcon from "@mui/icons-material/Message";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation, Link, useNavigate } from "react-router-dom";

const generalItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Staff Management", icon: <PeopleAltIcon />, path: "/staff-management" },
];

const manageItems = [
  { text: "Welcome Messages", icon: <MessageIcon />, path: "/welcome-messages" },
  { text: "Onboarding Status", icon: <AssignmentTurnedInIcon />, path: "/onboarding-status" },
  { text: "FAQs", icon: <HelpOutlineIcon />, path: "/faqs" },
];

const othersItems = [
  { text: "Settings", icon: <SettingsIcon />, path: "/settings", action: null },
  { text: "Log Out", icon: <LogoutIcon />, path: "/", action: "logout" },
];

export default function Sidebar({ setAuth, user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const navButtonStyle = {
    padding: "3px 8px",
    fontSize: "12px",
    borderRadius: "6px",
    mb: 0.1,
    color: "#222",
    minHeight: "26px",
    "&:hover": {
      background: "transparent",
      color: "#222",
      "& .MuiListItemIcon-root": { color: "#222" }
    }
  };

  const selectedButtonStyle = {
    background: "#f3f6fa",
    color: "#b0b0b0",
    fontWeight: 600,
    borderRadius: "6px",
    padding: "3px 8px",
    fontSize: "12px",
    minHeight: "26px",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    "& .MuiListItemIcon-root": { color: "#b0b0b0" }
  };

  const handleLogout = () => {
    setAuth(false);
    navigate("/");
    setLogoutOpen(false);
  };

  return (
    <Box
      sx={{
        width: "230px",
        height: "100vh",
        backgroundColor: "#fff",
        boxSizing: "border-box",
        borderRight: "1px solid #eee",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        p: 0,
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1200
      }}
    >
      {/* Logo */}
      <Box sx={{ pl: "18px", pt: 1, pb: 0, mb: 0.5 }}>
        <img src="/sccci_logo.png" alt="SCCCI Logo" style={{ width: 160, margin: "16px auto", display: "block" }} />
      </Box>
      {/* GENERAL */}
      <Typography sx={{ fontSize: "10px", fontWeight: "bold", color: "#b0b0b0", mb: "1px", mt: "6px", pl: "18px", letterSpacing: 1, textTransform: "uppercase" }}>
        GENERAL
      </Typography>
      <List sx={{ mb: 0.2, pl: "4px" }}>
        {generalItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            sx={{
              ...navButtonStyle,
              ...(location.pathname === item.path ? selectedButtonStyle : {})
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 22, fontSize: "15px" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      {/* MANAGE */}
      <Typography sx={{ fontSize: "10px", fontWeight: "bold", color: "#b0b0b0", mb: "1px", mt: "6px", pl: "18px", letterSpacing: 1, textTransform: "uppercase" }}>
        MANAGE
      </Typography>
      <List sx={{ mb: 0.2, pl: "4px" }}>
        {manageItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            sx={{
              ...navButtonStyle,
              ...(location.pathname === item.path ? selectedButtonStyle : {})
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 22, fontSize: "15px" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      {/* Divider above Settings/Logout */}
      <Divider
        variant="fullWidth"
        sx={{
          my: 0.5,
          ml: 0,
          mr: 0,
          borderColor: "#222",
          borderBottomWidth: 2,
          opacity: 1 // ensures it's not faded
        }}
      />
      {/* Custom dark line above Settings/Logout */}
      <Box
        sx={{
          width: "85%",           // Not full width, adjust as needed
          height: "1.5px",        // Thin line
          backgroundColor: "#222",// Dark color
          opacity: 1,
          my: 1.5,                // Vertical margin for spacing
          ml: "auto",
          mr: "auto",
          borderRadius: "1px"
        }}
      />
      <List sx={{ mb: 0.2, pl: "4px" }}>
        {othersItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={item.action === "logout" ? "button" : Link}
            to={item.action === "logout" ? undefined : item.path}
            onClick={item.action === "logout" ? () => setLogoutOpen(true) : undefined}
            sx={{
              ...navButtonStyle,
              ...(location.pathname === item.path ? selectedButtonStyle : {})
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 22, fontSize: "15px" }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      {/* User Profile */}
      <Box
        sx={{
          width: "90%",           // Makes the profile card wider
          mx: "auto",             // Centers the card horizontally
          mb: 1,
          mt: 0.5,
          p: 1,
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          minWidth: 0
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          <Avatar
            src={user?.avatar || "https://randomuser.me/api/portraits/men/32.jpg"}
            sx={{ width: 26, height: 26, mr: 1 }}
          />
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600, fontSize: "11px", color: "#222", lineHeight: 1 }}>
              {user?.name || "Rachel Tan"}
            </Typography>
            <Typography sx={{ fontSize: "10px", color: "#222", fontWeight: 500, lineHeight: 1 }}>
              {user?.email || "user@gmail.com"}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            backgroundColor: "#ffcade",
            mt: 0.5,
            px: 1,
            py: 0.5,
            borderRadius: "5px",
            width: "100%",
            textAlign: "center",
            fontSize: "10px",
            color: "#333",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          Administrator
        </Box>
      </Box>
      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutOpen} onClose={() => setLogoutOpen(false)} maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
        <Box sx={{ background: "linear-gradient(90deg, #00e6c3 0%, #00c6fb 100%)", p: 2, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <DialogTitle sx={{ color: "#fff", fontWeight: 700, m: 0, p: 0, fontSize: 20, flex: 1 }}>
              Confirm Account Deletion
            </DialogTitle>
            <IconButton onClick={() => setLogoutOpen(false)} sx={{ color: "#fff" }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        <DialogContent sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            Are you sure you want to log out?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <Button
            onClick={() => setLogoutOpen(false)}
            variant="contained"
            sx={{ background: "#e74c3c", color: "#fff", px: 4, mr: 2, "&:hover": { background: "#c0392b" } }}
          >
            No
          </Button>
          <Button
            onClick={handleLogout}
            variant="contained"
            sx={{ background: "#27ae60", color: "#fff", px: 4, "&:hover": { background: "#219150" } }}
          >
            Yes, log out
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
