import React, { useEffect, useState, useContext } from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { AuthContext } from "../Auth/AuthContext";

export default function ProfilePage() {
  const [fullName, setFullName] = useState("");

  const { user, role, userId } = useContext(AuthContext);
  
  if (!user) {
    return (
      <Box p={4}>
        <Typography variant="h5">No user logged in.</Typography>
      </Box>
    );
  }

  // Get first letter for avatar fallback
  const firstLetter = (fullName || user.name || "U").charAt(0).toUpperCase();

  return (
    <Box p={4} display="flex" flexDirection="column" alignItems="center">
      <Avatar
        src={user.photoURL || ""}
        alt={fullName || user.name || "User"}
        sx={{
          width: 140,
          height: 140,
          mb: 2,
          fontSize: 72, // bigger letter inside avatar
          bgcolor: "primary.main",
        }}
      >
        {!user.photoURL && firstLetter}
      </Avatar>

      <Typography variant="h5">{fullName || user.name || "No Name"}</Typography>
      <Typography variant="body1" mt={1}>
        Email: {user.username}
      </Typography>
      <Typography variant="body1">Role: {role || "No role assigned"}</Typography>
    </Box>
  );
}
