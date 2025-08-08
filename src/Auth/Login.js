import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./AzureAuth";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export default function Login() {
  const { instance } = useMsal();
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(true);

  // Portal preview images
  const images = ["/steme3.png", "/steme2.png", "/steme4.png"];
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleLogin = async () => {
    setError("");
    try {
      const response = await instance.loginPopup({
        ...loginRequest,
        prompt: "select_account",
      });
      instance.setActiveAccount(response.account);
    } catch (e) {
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
        backgroundImage: 'url("/classroom.jpg")', // background image
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
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          zIndex: 0,
        },
        "& > *": {
          position: "relative",
          zIndex: 1,
        },
      }}
    >
      <Box
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        maxWidth="1200px"
        width="100%"
        gap={4}
      >
        {/* Left Section - Info + Carousel */}
        <Box
          flex={1}
          color="white"
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
          <Box mb={3}>
            <Typography
              variant="h3"
              fontWeight="bold"
              gutterBottom
              sx={{ lineHeight: 1.2 }}
            >
              STEME Portal supports your best learning strategies.
            </Typography>
            <Typography variant="body1" mb={3}>
              The STEME Portal connects students, teachers, and resources in one
              place—making it easier to learn, share, and grow together.
            </Typography>

            <List>
              {[
                "Access all your STEME resources in one place.",
                "Simple, powerful tools made for education.",
                "Secure login with your school Microsoft account.",
              ].map((text, idx) => (
                <ListItem key={idx} disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon sx={{ color: "#22b55f" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={text}
                    primaryTypographyProps={{ color: "white" }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Carousel */}
          <Box
            position="relative"
            display="flex"
            alignItems="center"
            justifyContent="center"
            maxWidth="700px"
            mx="auto"
          >
            <IconButton
              onClick={handlePrev}
              sx={{
                position: "absolute",
                left: -20,
                color: "white",
                backgroundColor: "rgba(0,0,0,0.4)",
                "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
              }}
            >
              <ArrowBackIosNewIcon />
            </IconButton>

            <Box
              component="img"
              src={images[currentIndex]}
              alt={`Portal preview ${currentIndex + 1}`}
              sx={{
                width: "100%",
                height: "auto",
                borderRadius: 2,
                boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                transition: "opacity 0.5s ease-in-out",
              }}
            />

            <IconButton
              onClick={handleNext}
              sx={{
                position: "absolute",
                right: -20,
                color: "white",
                backgroundColor: "rgba(0,0,0,0.4)",
                "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
              }}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Right Section - Login Box */}
        <Box flex={1} display="flex" justifyContent="center" alignItems="center">
          <Paper
            elevation={3}
            sx={{
              backgroundColor: "#ffffff",
              borderRadius: 4,
              p: 6,
              width: "100%",
              maxWidth: 500,
            }}
          >
            <Stack spacing={3} alignItems="center">
              <Box
                component="img"
                src="/steme.png"
                alt="STEME Portal Logo"
                sx={{
                  width: 180,
                  height: "auto",
                  objectFit: "contain",
                }}
              />

              <Typography variant="h5" fontWeight="bold" align="center">
                Sign in to STEME Portal
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
              >
                Please use your school Microsoft account to sign in.
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
                  backgroundColor: "#22b55f",
                  "&:hover": {
                    backgroundColor: "#1a9a4d",
                  },
                }}
              >
                Sign in with Microsoft
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
