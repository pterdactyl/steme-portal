import React from "react";
import { Box, Typography, Avatar } from "@mui/material";

export default function ProfilePage({ user }) {
  if (!user) {
    return (
      <Box p={4}>
        <Typography variant="h5">No user logged in.</Typography>
      </Box>
    );
  }

  return (
    <Box p={4} display="flex" flexDirection="column" alignItems="center">
      <Avatar
        src={user.photoURL || "/default-pfp.png"}
        alt={user.name}
        sx={{ width: 100, height: 100, mb: 2 }}
      />
      <Typography variant="h5">{user.name}</Typography>
      <Typography variant="body1" mt={1}>Email: {user.email}</Typography>
      <Typography variant="body1">Role: {user.role}</Typography>
    </Box>
  );
}
