// src/pages/CourseDashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCoursesForTeacher } from "../../Auth/getTeacherCourses";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../Auth/firebase";
import {
  Box,
  Typography,
  Paper,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  TextField,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export default function CourseDashboard({ user }) {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [pdfUrls, setPdfUrls] = useState({});
  const [filterText, setFilterText] = useState("");

  // Menu states
  const [anchorEl, setAnchorEl] = useState(null);
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Selected course for PDF preview
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  useEffect(() => {
    async function fetchCourses() {
      if (!user?.uid) return;

      const fetchedCourses = await getCoursesForTeacher(user.uid);
      setCourses(fetchedCourses);

      const urls = {};
      for (const course of fetchedCourses) {
        if (!course.currentVersion) continue;
        const versionRef = doc(db, "courses", course.id, "versions", course.currentVersion);
        const versionSnap = await getDoc(versionRef);
        if (versionSnap.exists()) {
          urls[course.id] = versionSnap.data().pdf;
        }
      }
      setPdfUrls(urls);
    }

    fetchCourses();
  }, [user]);

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(filterText.toLowerCase()) ||
      course.id.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleMenuClick = (event, course) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedCourse(course);
  };

  const handleExportClick = (event) => {
    event.stopPropagation();
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportPdf = () => {
    if (selectedCourse) {
      const url = pdfUrls[selectedCourse.id];
      if (url) window.open(url, "_blank");
    }
    handleCloseMenus();
  };

  const handleExportWord = () => {
    alert("Export to Word coming soon.");
    handleCloseMenus();
  };

  const handlePrint = () => {
    window.print();
    handleCloseMenus();
  };

  const handleEdit = () => {
    if (selectedCourse) {
      navigate(`/edit/${selectedCourse.id}`);
    }
    handleCloseMenus();
  };

  const handleHistory = () => {
    if (selectedCourse) {
      navigate(`/course/${selectedCourse.id}`);
    }
    handleCloseMenus();
  };

  const handleCloseMenus = () => {
    setAnchorEl(null);
    setExportAnchorEl(null);
    setSelectedCourse(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" mb={3}>
        Course Outlines
      </Typography>

      <TextField
        placeholder="Search courses..."
        fullWidth
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        sx={{ mb: 4 }}
      />

      <Stack spacing={2}>
        {filteredCourses.length === 0 ? (
          <Typography>No courses found.</Typography>
        ) : (
          filteredCourses.map((course) => (
            <Paper
              key={course.id}
              sx={{
                p: 2,
                bgcolor: selectedCourseId === course.id ? "#bbdefb" : "#e3f2fd",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                userSelect: "none",
              }}
              onClick={() => setSelectedCourseId(course.id)}
            >
              <Box>
                <Typography variant="h6">{course.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Course ID: {course.id}
                </Typography>
              </Box>
              <Tooltip title="Options">
                <IconButton
                  onClick={(e) => handleMenuClick(e, course)}
                  size="small"
                  aria-controls={anchorEl ? "course-menu" : undefined}
                  aria-haspopup="true"
                >
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
            </Paper>
          ))
        )}
      </Stack>

      {/* PDF Viewer */}
      {selectedCourseId && pdfUrls[selectedCourseId] ? (
        <Box mt={6}>
          <Typography variant="h5" gutterBottom>
            Outline for {courses.find((c) => c.id === selectedCourseId)?.title}
          </Typography>
          <iframe
            src={pdfUrls[selectedCourseId]}
            title="Course Outline PDF"
            width="100%"
            height="700px"
            style={{ border: "1px solid #ccc", borderRadius: 4 }}
          />
        </Box>
      ) : selectedCourseId ? (
        <Typography mt={6} color="error">
          No outline PDF available for this course.
        </Typography>
      ) : null}

      {/* Main Menu */}
      <Menu
        id="course-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenus}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleExportClick}>Export</MenuItem>
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleHistory}>History</MenuItem>
      </Menu>

      {/* Export Submenu */}
      <Menu
        id="export-submenu"
        anchorEl={exportAnchorEl}
        open={Boolean(exportAnchorEl)}
        onClose={handleCloseMenus}
        anchorOrigin={{ vertical: "center", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <MenuItem onClick={handleExportPdf}>Export as PDF</MenuItem>
        <MenuItem onClick={handlePrint}>Print</MenuItem>
      </Menu>
    </Box>
  );
}
