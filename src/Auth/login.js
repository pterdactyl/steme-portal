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
  const { instance } = useMsal();
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      const response = await instance.loginPopup({
        ...loginRequest,
        prompt: "select_account",
      });
      instance.setActiveAccount(response.account);
    } catch (e) {
      setError(e.message);
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
        backgroundColor: "#dbeafe", // Soft solid blue background
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
          <Typography
            variant="h4"
            fontWeight="bold"
            align="center"
            color="primary"
            sx={{ fontFamily: "Segoe UI, sans-serif" }}
          >
            STEME Portal Login
          </Typography>

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
              backgroundColor: "#3b82f6",
              "&:hover": {
                backgroundColor: "#2563eb",
              },
            }}
          >
            Sign in with Microsoft
          </Button>

          <Typography variant="body2" color="text.secondary" align="center">
            Please use your school Microsoft account to sign in.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
