// src/pages/StudentDashboard.jsx
import React from "react";
import { Typography, Box } from "@mui/material";

export default function StudentDashboard() {
  return (
    <div>
      <Typography variant="h4">🎓 Welcome to the Student Dashboard!</Typography>
      <button onClick={() => navigate("/upload")}>
        Go to Dropbox
      </button>
    </div>
  )

}
