import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase"; // adjust path if needed
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
} from "@mui/material";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      if (userData?.role === "teacher") {
        navigate("/dashboard/teacher");
      } else if (userData?.role === "student") {
        navigate("/dashboard/student");
      } else if (userData?.role === "admin") {
        navigate("/dashboard/admin");
      } else {
        setError("Unrecognized user role.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError("");
    } catch (err) {
      setError(err.message);
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
          Sign In
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            {resetSent && (
              <Alert severity="success">
                Password reset email sent. Check your inbox.
              </Alert>
            )}
            <TextField
              label="Email"
              fullWidth
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button variant="contained" type="submit" fullWidth>
              Login
            </Button>

            <Button
              onClick={handleForgotPassword}
              sx={{ textTransform: "none" }}
              color="secondary"
            >
              Forgot Password?
            </Button>

            <Typography variant="body2" align="center">
              Don’t have an account?{" "}
              <Link to="/signup" style={{ color: "#1976d2", textDecoration: "none" }}>
                Sign up
              </Link>
            </Typography>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
