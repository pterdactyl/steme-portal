// src/components/Navbar.js
import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout?.();
    navigate("/");
  };

  const handleDashboardClick = () => {
    if (!user) return;
    switch (user.role) {
      case "teacher":
        navigate("/dashboard/teacher");
        break;
      case "student":
        navigate("/dashboard/student");
        break;
      default:
        console.warn("Unrecognized role:", user.role);
        break;
    }
  };

  return (
    <AppBar
      position="static"
      sx={{ backgroundColor: "#2e7d32" }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, cursor: "pointer" }}
          onClick={handleDashboardClick}
        >
          STEM-e Portal
        </Typography>

        {user ? (
          <>
            <Button color="inherit" onClick={handleDashboardClick}>
              Dashboard
            </Button>
            <Button color="inherit" onClick={() => navigate("/pathways")}>
              Pathways
            </Button>
            <Button color="inherit" onClick={() => navigate("/profile")}>
              Profile
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <Typography variant="body2">Not logged in</Typography>
        )}
      </Toolbar>
    </AppBar>
  );
}
