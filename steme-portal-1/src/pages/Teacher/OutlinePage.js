// src/pages/CourseDashboard.js
import React, { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import OutlineContent from "./OutlineContent";
import '../../styles/EditOutline.css';
import html2pdf from "html2pdf.js";
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
import { AuthContext } from "../../Auth/AuthContext";

export default function OutlinePage() {
  const navigate = useNavigate();
  const { user, role, userId } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [filterText, setFilterText] = useState("");

  const [anchorEl, setAnchorEl] = useState(null);
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [outlineForExport, setOutlineForExport] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const exportContainerRef = useRef(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/courses?teacherId=${userId}`);
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error("Failed to fetch courses from Azure:", err);
      }
    }
    if (userId) fetchCourses();
  }, [userId]);

  useEffect(() => {
    if (isExporting && exportContainerRef.current && outlineForExport) {
      const element = exportContainerRef.current;
      const options = {
        margin: 0,
        filename: `${outlineForExport.courseCode}_${outlineForExport.courseName}_Outline.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, logging: false, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ['css', 'legacy'] },
      };

      setTimeout(async () => {
        try {
          await html2pdf().from(element).set(options).save();
        } catch (error) {
          console.error("PDF generation failed:", error);
          alert("Failed to generate PDF. Check console for errors.");
        } finally {
          setIsExporting(false);
          handleCloseMenus();
        }
      }, 100);
    }
  }, [isExporting, outlineForExport]);

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(filterText.toLowerCase()) ||
      course.course_code.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleMenuClick = (event, course) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedCourse(course);
  };

  const handleExportClick = (event) => {
    setAnchorEl(null);
    setExportAnchorEl(event.currentTarget);
  };

  const handleCloseMenus = () => {
    setAnchorEl(null);
    setExportAnchorEl(null);
  };

  const exportToPDF = async () => {
    if (!selectedCourse) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/outlines/${selectedCourse.id}`);
      if (!res.ok) throw new Error("Outline not found");

      const outlineData = await res.json();
      setOutlineForExport({
        courseCode: selectedCourse.course_code,
        courseName: outlineData.course_name || "",
        grade: outlineData.grade || "",
        courseType: outlineData.course_type || "",
        credit: outlineData.credit || "",
        description: outlineData.description || "",
        learningGoals: outlineData.learning_goals || "",
        assessment: outlineData.assessment || "",
        units: outlineData.units || [],
        finalAssessments: outlineData.final_assessments || [],
        totalHours: outlineData.total_hours || 0,
      });

      setIsExporting(true);
    } catch (error) {
      console.error("Failed to fetch outline for export:", error);
      alert(`Failed to export PDF: ${error.message}`);
    }

    handleCloseMenus();
  };


  const handleEdit = () => {
    if (selectedCourse) {
      navigate(`/edit/${selectedCourse.id}`, { state: { course: selectedCourse } });
    }
    handleCloseMenus();
  };

  const handleHistory = () => {
    if (selectedCourse) navigate(`/course/${selectedCourse.id}/history`, { state: { course: selectedCourse } });
    handleCloseMenus();
  };

 return (
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 1100, mx: "auto" }}>
      <Typography variant="h4" mb={3} sx={{ fontWeight: 700, letterSpacing: 1, color: "#2e7d32" }}>
        Course Outlines
      </Typography>

      <TextField
        placeholder="Search courses..."
        fullWidth
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        sx={{
          mb: 4,
          backgroundColor: "white",
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(46, 125, 50, 0.1)", // green shadow
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            "&.Mui-focused fieldset": {
              borderColor: "#4caf50", // green border on focus
            },
          },
        }}
        variant="outlined"
        size="medium"
      />

      <Stack spacing={3}>
        {filteredCourses.length === 0 ? (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: "center", mt: 6, fontStyle: "italic" }}
          >
            No courses found.
          </Typography>
        ) : (
          filteredCourses.map((course) => (
            <Paper
              key={course.id}
              sx={{
                p: 3,
                bgcolor: "background.paper",
                borderRadius: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(76, 175, 80, 0.1)", // green shadow
                transition: "all 0.3s ease",
                userSelect: "none",
                "&:hover": {
                  boxShadow: "0 8px 20px rgba(76, 175, 80, 0.25)", // stronger green shadow
                  transform: "translateY(-4px)",
                  bgcolor: "#e8f5e9", // very light green bg on hover
                },
              }}
              onClick={() => navigate(`/view/${course.course_code}`, { state: { course } })}
              elevation={4}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#388e3c" }}>
                  {course.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {course.course_code}
                </Typography>
              </Box>
              <Tooltip title="Options" arrow>
                <IconButton
                  onClick={(e) => handleMenuClick(e, course)}
                  size="small"
                  sx={{
                    color: "#4caf50",
                    "&:hover": { bgcolor: "rgba(76, 175, 80, 0.1)" },
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
            </Paper>
          ))
        )}
      </Stack>

      {/* Main Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenus}
        MenuListProps={{ sx: { p: 0 } }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
            minWidth: 160,
          },
        }}
      >
        <MenuItem onClick={handleExportClick} sx={{ fontWeight: 600, color: "#4caf50" }}>
          Export
        </MenuItem>
        <MenuItem onClick={handleEdit} sx={{ fontWeight: 600, color: "#4caf50" }}>
          Edit
        </MenuItem>
        <MenuItem onClick={handleHistory} sx={{ fontWeight: 600, color: "#4caf50" }}>
          History
        </MenuItem>
      </Menu>

      {/* Export Submenu */}
      <Menu
        anchorEl={exportAnchorEl}
        open={Boolean(exportAnchorEl)}
        onClose={handleCloseMenus}
        MenuListProps={{ sx: { p: 0 } }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
            minWidth: 180,
          },
        }}
      >
        <MenuItem onClick={exportToPDF} sx={{ fontWeight: 600, color: "#4caf50" }}>
          Export as PDF
        </MenuItem>
  
      </Menu>

      {/* Hidden PDF export container */}
      {isExporting && outlineForExport && (
        <div style={{ opacity: 0, pointerEvents: "none", position: "fixed" }}>
          <div ref={exportContainerRef}>
            <OutlineContent
              outline={outlineForExport}
              units={outlineForExport.units || []}
              finalAssessments={outlineForExport.finalAssessments || []}
              totalHours={outlineForExport.totalHours || 0}
              viewOnly={true}
            />
          </div>
        </div>
      )}
    </Box>
  );
}