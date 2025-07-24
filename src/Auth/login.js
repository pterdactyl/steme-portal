import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./azureAuth";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
} from "@mui/material";

export default function Login() {
  console.log("API URL:", process.env.REACT_APP_API_URL);
  console.log(process.env.REACT_APP_CLIENT_ID);
  console.log(process.env.REACT_APP_AUTHORITY);
  console.log(process.env.REACT_APP_REDIRECT_URI);
  const { instance } = useMsal();
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      const response = await instance.loginPopup({
        ...loginRequest,
        prompt: "select_account",
      });
      console.log("Login response:", response);
      instance.setActiveAccount(response.account);
    } catch (e) {
      console.error("MSAL Login error:", e);
      setError(e.message || "Login failed");
    }
  };

  return (
    <Box
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={2}
      
       sx={{
      position: "relative",
      backgroundImage: 'url("/image.jpg")',
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
  

      "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.62)", // dark overlay
      zIndex: 0,
    },
    "& > *": {
      position: "relative",
      zIndex: 1,
    },
  }}
    >
      <Paper
        elevation={3}
        sx={{
          backgroundColor: "#ffffff",
          borderRadius: 4,
          padding: { xs: 4, sm: 5 },
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 12px 24px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Stack spacing={4} alignItems="center">
         <Box
            component="img"
            src="/steme.png"
            alt="STEME Portal Logo"
            sx={{
              width: 200, 
              height: "auto",
              objectFit: "contain",
            }}
          />

          {error && (
            <Alert severity="error" sx={{ width: "100%" }}>
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            onClick={handleLogin}
            fullWidth
            size="large"
            sx={{
              textTransform: "none",
              fontWeight: "bold",
              fontSize: "1rem",
              paddingY: 1.5,
              borderRadius: 2,
              backgroundColor: "#149c4cff",
              "&:hover": {
                backgroundColor: "#22b55f8f",
              },
            }}
          >
            Sign in with Microsoft dsadasd
          </Button>

          <Typography variant="body2" color="text.secondary" align="center">
            Please use your school Microsoft account to sign in.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
