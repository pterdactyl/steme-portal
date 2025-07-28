import React from "react";
import { AppBar, Toolbar, Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";

export default function StudentNavbar({ user }) {
  const navigate = useNavigate();
  const { instance } = useMsal();

  const handleLogout = () => {
    instance.logoutRedirect();
  };

  const handleDashboardClick = () => {
    if (!user) return;
    if (user.role === "teacher") navigate("/dashboard/teacher");
    else if (user.role === "student") navigate("/dashboard/student");
  };

  return (
    <AppBar
      position="static"
      sx={{
        background: "linear-gradient(90deg, #ffffffff, #ffffffff)",
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
            src="/stem-e.png" // use absolute path from public folder
            alt="STEM-E Logo"
            style={{
              height: "100px", // bigger logo
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
              <Button color="inherit" onClick={() => navigate("/dashboard/student")} sx={{ color: "#228B22", fontWeight: 600, fontSize: "1rem", px: 2, py: 1.5 }}>
  Courses
</Button>
<Button color="inherit" onClick={() => navigate("/pathways")} sx={{ color: "#228B22", fontWeight: 600, fontSize: "1rem", px: 2, py: 1.5}}>
  Pathways
</Button>
<Button color="inherit" onClick={() => navigate("/course-selection")} sx={{ color: "#228B22", fontWeight: 600, fontSize: "1rem", px: 2, py: 1.5}}>
  Course Selection
</Button>
<Button color="inherit" onClick={() => navigate("/profile")} sx={{ color: "#228B22", fontWeight: 600, fontSize: "1rem", px: 2, py: 1.5}}>
  Profile
</Button>
<Button
  color="inherit"
  onClick={handleLogout}
  sx={{
    color: "#228B22",
    fontWeight: 600,
    border: "1.5px solid #228B22",
    borderRadius: "20px",
    paddingX: 2,
    paddingY: 1.5,
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
