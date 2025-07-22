import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";

export default function TeacherNavbar({ user }) {
  const navigate = useNavigate();
  const { instance } = useMsal();

  const handleLogout = () => {
    instance.logoutRedirect();
  };

  const handleDashboardClick = () => {
    if (!user) return;
    if (user.role === "teacher") navigate("/dashboard/teacher");
  };

  return (
    <AppBar
      position="static"
      sx={{
        background: "linear-gradient(90deg, #66bb6a, #2e7d32)", // green gradient
        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        paddingX: { xs: 2, sm: 4 },
        paddingY: 1,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            gap: 1,
          }}
          onClick={handleDashboardClick}
        >
          <img
            src="/stem-e.png" // absolute path from public folder
            alt="STEM-E Logo"
            style={{
              height: "100px", // same as student navbar
              width: "auto",
              borderRadius: "8px",
              padding: "4px",
            }}
          />
        </Box>

        {/* Buttons */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {user ? (
            <>
              <Button color="inherit" onClick={() => navigate("/courses")}>
                Courses
              </Button>
              <Button color="inherit" onClick={() => navigate("/outline")}>
                Outlines
              </Button>
              <Button color="inherit" onClick={() => navigate("/profile")}>
                Profile
              </Button>
              <Button
                color="inherit"
                onClick={handleLogout}
                sx={{
                  border: "1.5px solid #bbdefb",
                  borderRadius: "20px",
                  paddingX: 2,
                  "&:hover": {
                    backgroundColor: "#bbdefb",
                    color: "#0d47a1",
                  },
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Typography sx={{ color: "#e3f2fd" }}>Not logged in</Typography>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
