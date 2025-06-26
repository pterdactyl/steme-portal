import React, { useState } from "react";
import {
  Avatar, Menu, MenuItem, IconButton, Typography, Box
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export default function ProfileMenu({ user }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton onClick={handleOpen}>
        <AccountCircleIcon fontSize="large" />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <Box px={2} py={1}>
          <Typography variant="body1"><strong>{user?.name || "Username"}</strong></Typography>
          <Typography variant="body2" color="text.secondary">{user?.role || "Role"}</Typography>
        </Box>
      </Menu>
    </>
  );
}