// src/components/Navbar.js
import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";

export default function StudentNavbar({ user, onLogout }) {
  const navigate = useNavigate();

  const { instance } = useMsal();
  
  const handleLogout = () => {
    instance.logoutRedirect();
  };

  const handleDashboardClick = () => {
  console.log("User:", user);
  console.log("Role:", user?.role);

  if (!user) return;

  if (user.role === "teacher") {
    navigate("/dashboard/teacher");
  } else if (user.role === "student") {
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
            <Button color="inherit" onClick={() => navigate("/dashboard/student")}>
              Courses
            </Button>
            <Button color="inherit" onClick={() => navigate("/pathways")}>
              Pathways
            </Button>
            <Button color="inherit" onClick={() => navigate("/course-selection")}>
              Course Selection
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
