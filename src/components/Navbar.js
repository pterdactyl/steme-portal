import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Navbar({ onLogout, user }) {
  const navigate = useNavigate();

  console.log("Navbar user:", user); // <--- Check this in browser console

  const handleLogout = () => {
    onLogout?.();
    navigate("/");
  };

  const handleDashboardClick = () => {
    if (user?.role === "teacher") {
      navigate("/dashboard/teacher");
    } else if (user?.role === "student") {
      navigate("/dashboard/student");
    }
  };

  return (
    <AppBar position="static">
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
