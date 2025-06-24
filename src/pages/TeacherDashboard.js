import React, { useState } from "react";
import {
  Box, Typography, Button, IconButton, Menu, MenuItem, Paper, Avatar, Stack,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ProfileMenu from "../components/ProfileMenu";

const courses = [
  { id: "ENG1D", title: "ENG1D - Grade 9 English Academic", pdf: "/images.jpeg" },
  { id: "MPM1D", title: "MPM1D - Grade 9 Mathematics, Academic", pdf: "/path/to/mpm1d.pdf" },
  { id: "FSF1D", title: "FSF1D - Grade 9 French, Academic", pdf: "/path/to/fsf1d.pdf" },
];

export default function TeacherDashboard({ user }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const handleMenuClick = (event, courseId) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourse(courseId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCourse(null);
  };

  const handleAction = (action) => {
    alert(`"${action}" clicked for ${selectedCourse}`);
    handleMenuClose();
  };

  const handleCourseClick = (pdf) => {
    window.open(pdf, "_blank");
  };

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Dashboard</Typography>
        <ProfileMenu user={user} />
      </Box>

      <Typography mt={4} mb={2}>Course Outlines</Typography>

      <Stack spacing={2}>
        {courses.map(course => (
          <Paper key={course.id} sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#b3e5fc" }}>
            <Typography sx={{ cursor: "pointer" }} onClick={() => handleCourseClick(course.pdf)}>
              {course.title}
            </Typography>
            <IconButton onClick={(e) => handleMenuClick(e, course.id)}>
              <MoreVertIcon />
            </IconButton>
          </Paper>
        ))}
      </Stack>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction("Edit")}>Edit</MenuItem>
        <MenuItem onClick={() => handleAction("Export")}>Export</MenuItem>
        <MenuItem onClick={() => handleAction("View History")}>View History</MenuItem>
      </Menu>
    </Box>
  );
}