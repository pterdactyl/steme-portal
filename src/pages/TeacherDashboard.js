import React, { useEffect, useState, useRef } from "react";
// src/pages/TeacherDashboard.jsx
import { useNavigate } from "react-router-dom";
// import html2pdf from "html2pdf.js";
import { getCoursesForTeacher } from '../Auth/getTeacherCourses'; 
import { doc, getDoc } from "firebase/firestore";
import { db } from "../Auth/firebase";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ProfileMenu from "../components/ProfileMenu";
import { createCourseWithInitialVersion } from "../Auth/createCourses";


export default function TeacherDashboard({ user }) {
  
  const navigate = useNavigate();


  const [courses, setCourses] = useState([]);
  const [pdfUrls, setPdfUrls] = useState({});

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.uid) return;
      const fetchedCourses = await getCoursesForTeacher(user.uid);
      setCourses(fetchedCourses);
  
      // Fetch PDF URLs for each course’s current version
      const urls = {};
      for (const course of fetchedCourses) {
        const versionId = course.currentVersion;
        const versionRef = doc(db, "courses", course.id, "versions", versionId);
        const versionSnap = await getDoc(versionRef);
        if (versionSnap.exists()) {
          urls[course.id] = versionSnap.data().pdf;
        }
      }
      setPdfUrls(urls);
    };
  
    fetchCourses();
  }, [user]);

  const handleCreate = () => {
    const courseId = "ENG1D";
    const title = "Grade 9 English Academic";
    const teacherIds = ["OsZp2t0Z2dNWf5fphJGcRpitycJ3", "uid456"]; // replace with real user IDs

    createCourseWithInitialVersion(courseId, title, teacherIds);
  };




  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const [filterText, setFilterText] = useState("");

  const exportRef = useRef(null);

  const handleMenuClick = (event, courseId) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourse(courseId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCourse(null);
  };

  const handleExportClick = (event) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  const handleAction = (action) => {
    if (action === "Edit") {
      navigate("/edit");
    } else {
      alert(`${action} clicked for ${selectedCourse}`);
    }
    handleMenuClose();
  };

  const getCourseById = (id) => courses.find((c) => c.id === id);

  // Export functions
  const exportToPDF = () => {
    
  };

  const exportToWord = () => {
    if (!exportRef.current) return;
    const header =
      "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + exportRef.current.innerHTML + footer;

    const blob = new Blob(["\ufeff", sourceHTML], {
      type: "application/msword",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedCourse}-export.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    handleExportMenuClose();
  };

  const printContent = () => {
    if (!exportRef.current) return;
    const printWindow = window.open("", "", "width=900,height=650");
    printWindow.document.write(
      `<html><head><title>Print</title></head><body>${exportRef.current.innerHTML}</body></html>`
    );
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
    handleExportMenuClose();
  };

  const selectedCourseObj = getCourseById(selectedCourse);

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(filterText.toLowerCase()) ||
      course.id.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <Box p={4} sx={{ bgcolor: "#f0fdf4", minHeight: "100vh" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" color="green">Teacher Dashboard</Typography>
        <Box>
          <Button
            variant="contained"
            sx={{ mr: 2, bgcolor: "green", color: "white", '&:hover': { bgcolor: "darkgreen" } }}
            onClick={() => navigate("/attendance")}
          >
            Take Attendance
          </Button>
          <Button
            variant="contained"
            sx={{ mr: 2, bgcolor: "green", color: "white", '&:hover': { bgcolor: "darkgreen" } }}
            onClick={() => navigate("/grades/manage")}
          >
            Manage Grades
          </Button>
          <ProfileMenu user={user} />
        </Box>
      </Box>

      <Box mb={2} maxWidth={300}>
        <input
          type="text"
          placeholder="Search courses..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        />
      </Box>

      <Stack spacing={2}>
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <Paper
              key={course.id}
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                bgcolor: "#d0f0c0",
              }}
            >
              <Typography
                sx={{ cursor: "pointer" }}
                onClick={() => {
                  const url = pdfUrls[course.id];
                  if (url) {
                    window.open(url, "_blank");
                  } else {
                    alert("PDF not available.");
                  }
                }}
              >
                {course.title}
              </Typography>
              <IconButton onClick={(e) => handleMenuClick(e, course.id)}>
                <MoreVertIcon />
              </IconButton>
            </Paper>
          ))
        ) : (
          <Typography>You do not have any courses currently.</Typography>
        )}
      </Stack>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleAction("Edit")}>Edit</MenuItem>
        <MenuItem onClick={handleExportClick}>Export</MenuItem>
        <MenuItem
          onClick={() => {
            alert(`View History clicked for ${selectedCourse}`);
            handleMenuClose();
          }}
        >
          View History
        </MenuItem>
      </Menu>

      <Menu anchorEl={exportMenuAnchor} open={Boolean(exportMenuAnchor)} onClose={handleExportMenuClose}>
        <MenuItem onClick={exportToPDF}>Export as PDF</MenuItem>
        <MenuItem onClick={exportToWord}>Export as Word</MenuItem>
        <MenuItem onClick={printContent}>Print</MenuItem>
      </Menu>

      <Box
        ref={exportRef}
        sx={{
          position: "fixed",
          top: "-10000px",
          left: "-10000px",
          width: 600,
          bgcolor: "white",
          p: 2,
          boxShadow: 3,
          zIndex: -1,
        }}
      >
        {selectedCourseObj && (
          <>
            <Typography variant="h5">{selectedCourseObj.title}</Typography>
            <Typography mt={2}>
              This is the export content for {selectedCourseObj.title}. You can add more detailed outlines, descriptions, or any other content here.
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}
