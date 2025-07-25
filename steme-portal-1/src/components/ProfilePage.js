import React, { useContext, useState } from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { AuthContext } from "../Auth/AuthContext";

export default function ProfilePage() {
  const { user, role } = useContext(AuthContext);
  const [fullName, setFullName] = useState("");

  if (!user) {
    return (
      <Box p={4}>
        <Typography variant="h5">No user logged in.</Typography>
      </Box>
    );
  }

  const firstInitial = (fullName || user.name || "U").charAt(0).toUpperCase();
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    firstInitial
  )}&background=random`;

  return (
    <Box p={4} display="flex" flexDirection="column" alignItems="center">
      <Avatar
        src={user.photoURL || avatarUrl}
        alt={fullName || user.name || "User"}
        sx={{
          width: 140,
          height: 140,
          mb: 2,
          fontSize: 72,
        }}
      >
        {!user.photoURL && firstInitial}
      </Avatar>
      <Typography variant="h5">{fullName || user.name || "No Name"}</Typography>
      <Typography variant="body1" mt={1}>
        Email: {user.username}
      </Typography>
      <Typography variant="body1">
        Role: {role || "No role assigned"}
      </Typography>
    </Box>
  );
}
