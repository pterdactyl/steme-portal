import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";

export default function StudentNavbar({ user, onLogout }) {
  const navigate = useNavigate();
  const { instance } = useMsal();

  const handleLogout = () => {
    instance.logoutRedirect();
  };

  const handleDashboardClick = () => {
    if (!user) return;

    if (user.role === "teacher") {
      navigate("/dashboard/teacher");
    } else if (user.role === "student") {
      navigate("/dashboard/student");
    }
  };

  return (
    <AppBar
      position="static"
      sx={{
        background: "linear-gradient(90deg, #1976d2, #0d47a1)", // blue gradient
        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        paddingX: { xs: 2, sm: 4 },
        paddingY: 1,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Typography
          variant="h5"
          onClick={handleDashboardClick}
          sx={{
            flexGrow: 1,
            cursor: "pointer",
            fontWeight: 700,
            letterSpacing: 1.2,
            userSelect: "none",
            color: "#e3f2fd", // light blue text
            transition: "color 0.3s ease",
            "&:hover": {
              color: "#bbdefb",
            },
          }}
        >
          STEM-e Portal
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {user ? (
            <>
              <Button
                color="inherit"
                onClick={() => navigate("/dashboard/student")}
                sx={{
                  fontWeight: 600,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    color: "#bbdefb",
                  },
                }}
              >
                Courses
              </Button>

              <Button
                color="inherit"
                onClick={() => navigate("/pathways")}
                sx={{
                  fontWeight: 600,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    color: "#bbdefb",
                  },
                }}
              >
                Pathways
              </Button>

              <Button
                color="inherit"
                onClick={() => navigate("/course-selection")}
                sx={{
                  fontWeight: 600,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    color: "#bbdefb",
                  },
                }}
              >
                Course Selection
              </Button>

              <Button
                color="inherit"
                onClick={() => navigate("/profile")}
                sx={{
                  fontWeight: 600,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    color: "#bbdefb",
                  },
                }}
              >
                Profile
              </Button>

              <Button
                color="inherit"
                onClick={handleLogout}
                sx={{
                  fontWeight: 600,
                  textTransform: "none",
                  border: "1.5px solid #bbdefb",
                  borderRadius: "20px",
                  paddingX: 2,
                  "&:hover": {
                    backgroundColor: "#bbdefb",
                    color: "#0d47a1",
                    borderColor: "#bbdefb",
                  },
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Typography
              variant="body2"
              sx={{ color: "#e3f2fd", fontStyle: "italic", userSelect: "none" }}
            >
              Not logged in
            </Typography>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
