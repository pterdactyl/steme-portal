// src/components/TeacherNavbar.js
import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";

export default function TeacherNavbar({ user, onLogout }) {
  const navigate = useNavigate();
  const { instance } = useMsal();
  
  const handleLogout = () => {
    instance.logoutRedirect();
  };

  const handleCoursesClick = () => {
    navigate("/courses");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, cursor: "pointer" }}
          onClick={handleCoursesClick}
        >
          STEM-e Portal
        </Typography>

        {user ? (
          <>
            <Button color="inherit" onClick={handleCoursesClick}>
              Courses
            </Button>

            <Button color="inherit" onClick={() => navigate("/attendance")}>
              Attendance
            </Button>

            {/* Outline button navigates to the new Outline page */}
            <Button color="inherit" onClick={() => navigate("/outline")}>
              Outlines
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
