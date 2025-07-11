import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./azureAuth";
import { Box, Paper, Typography, Button, Stack, Alert } from "@mui/material";

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
    instance.setActiveAccount(response.account); // 🔥 Critical!
    // App.js will now detect `user` and redirect correctly
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
      bgcolor="#f0f0f0"
    >
      <Paper elevation={3} sx={{ padding: 4, width: 400 }}>
        <Typography variant="h5" mb={2} align="center">
          Sign In with Microsoft
        </Typography>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <Button variant="contained" onClick={handleLogin} fullWidth>
            Login with Microsoft
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}