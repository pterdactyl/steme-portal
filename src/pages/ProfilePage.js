import React, { useEffect, useState } from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../Auth/firebase";

export default function ProfilePage({ user }) {
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFullName = async () => {
      if (user?.uid) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setFullName(docSnap.data().fullName || "");
          }
        } catch (error) {
          console.error("Error fetching full name:", error);
        }
      }
      setLoading(false);
    };
    fetchFullName();
  }, [user]);

  if (!user) {
    return (
      <Box p={4}>
        <Typography variant="h5">No user logged in.</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box p={4}>
        <Typography>Loading profile...</Typography>
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
        Email: {user.email}
      </Typography>
      <Typography variant="body1">Role: {user.role || "No role assigned"}</Typography>
    </Box>
  );
}
