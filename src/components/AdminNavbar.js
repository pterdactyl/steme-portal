import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout?.();
    navigate("/");
  };

  const handleCoursesClick = () => {
    navigate("/dashboard/admin");
  };
  const handleTeachersClick = () => {
    navigate("/admin/teachers");
  };

  const handleStudentsClick = () => {
    navigate("/admin/students");
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
            <Button color="inherit" onClick={handleTeachersClick}>
              Teachers
            </Button>
            <Button color="inherit" onClick={handleStudentsClick}>
              Students
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
