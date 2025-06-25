import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Navbar({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Logic for Logging Out
    navigate("/");         // Redirect to login route
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          STEM-e Portal
        </Typography>

        <Button color="inherit">Dashboard</Button>
        <Button color="inherit">Profile</Button>
        <Button color="inherit" onClick={handleLogout}>Logout</Button>
      </Toolbar>
    </AppBar>
  );
}