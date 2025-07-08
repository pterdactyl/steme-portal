import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCoursesForTeacher } from "../Auth/getTeacherCourses";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../Auth/firebase";
import {
  Box,
  Typography,
  Paper,
  Stack,
  IconButton,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ProfileMenu from "../components/ProfileMenu";





export default function TeacherDashboard({ user }) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [pdfUrls, setPdfUrls] = useState({});
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.uid) return;
      const fetchedCourses = await getCoursesForTeacher(user.uid);
      setCourses(fetchedCourses);

      const urls = {};
      for (const course of fetchedCourses) {
        const versionId = course.currentVersion;
        if (!versionId) continue;
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





  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);


  const exportRef = useRef(null);



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
      console.log("Navigating to edit:", selectedCourse);
      navigate(`/edit/${selectedCourse}`);
    } else {
      console.log("na");
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

  const handleMenuClick = (event, courseId) => {
    event.stopPropagation();
    console.log("More menu clicked for course:", courseId);
    // Add menu logic here if needed
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        My Courses
      </Typography>

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
                cursor: "pointer",
                bgcolor: "#b3e5fc",
              }}
              onClick={() => navigate(`/dashboard/course/${course.id}`)}
            >
              <Box
                sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <Typography
                  sx={{ cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/dashboard/course/${course.id}`);
                  }}
                >
                  {course.title}
                </Typography>
                <IconButton
                  onClick={(e) => handleMenuClick(e, course.id)}
                >
                  <MoreVertIcon />
                </IconButton>
              </Box>
            </Paper>
          ))
        ) : (
          <Typography>No courses found.</Typography>
        )}
      </Stack>
    </Box>
  );
}