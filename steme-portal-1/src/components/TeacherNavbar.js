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
        background: "linear-gradient(90deg, #ffffffff, #ffffffff)", 
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
              height: "100px", // bigger logo like student navbar
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
              <Button
  color="inherit"
  onClick={() => navigate("/courses")}
  sx={{
    fontWeight: 600,
    color: '#228B22',
    textTransform: "none",
    fontSize: "1rem",    // bigger font size
    px: 2,                 // horizontal padding
    py: 1.5,               // vertical padding
  }}
>
  COURSES
</Button>

<Button
  color="inherit"
  onClick={() => navigate("/outline")}
  sx={{
    fontWeight: 600,
    color: '#228B22',
    textTransform: "none",
    fontSize: "1rem",
    px: 2,
    py: 1.5,
  }}
>
  OUTLINES
</Button>

<Button
  color="inherit"
  onClick={() => navigate("/profile")}
  sx={{
    fontWeight: 600,
    textTransform: "none",
    color: '#228B22',
    fontSize: "1rem",
    px: 2,
    py: 1.5,
  }}
>
  PROFILE
</Button>

<Button
  color="inherit"
  onClick={handleLogout}
  sx={{
    border: "1.5px solid #228B22",
    borderRadius: "20px",
    paddingX: 2,
    color: '#228B22',
    paddingY: 1.5,
    fontSize: "0.9em",
    "&:hover": {
      backgroundColor: "#228B22",
      color: "#ffffffff",
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