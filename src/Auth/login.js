import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase"; // relative path to firebase.js inside Auth
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
} from '@mui/material';
import { getIdTokenResult } from "firebase/auth";



export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

    const tokenResult = await getIdTokenResult(user);
    console.log("Is admin:", tokenResult.claims.admin);


    if (tokenResult.claims.admin) {
      navigate("/dashboard/admin", { state: { claims: tokenResult.claims } });
    } else if (userData?.role === 'teacher') {
      navigate('/dashboard/teacher');
    } else {
      navigate('/dashboard/student');
    } 
  } catch (err) {
    alert(err.message);
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
