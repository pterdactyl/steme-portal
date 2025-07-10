// src/pages/CourseDashboard.js
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCoursesForTeacher } from "../../Auth/getTeacherCourses";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../Auth/firebase";
import OutlineContent from "./OutlineContent";
import '../../styles/EditOutline.css';
import html2pdf from "html2pdf.js";
import { createRoot } from 'react-dom/client';
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

export default function OnlinePage({ user }) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filterText, setFilterText] = useState("");

  // State for menus and selection
  const [anchorEl, setAnchorEl] = useState(null);
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // State for on-the-fly PDF generation
  const [outlineForExport, setOutlineForExport] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const exportContainerRef = useRef(null);

  // Fetch courses and their existing PDF URLs
  useEffect(() => {
    async function fetchCourses() {
      if (!user?.uid) return;
      const fetchedCourses = await getCoursesForTeacher(user.uid);
      setCourses(fetchedCourses);
    }
    fetchCourses();
  }, [user]);

  // useEffect for On-the-Fly PDF Generation
  useEffect(() => {
    // This now correctly triggers when exportToPDF sets isExporting to true
    if (isExporting && exportContainerRef.current && outlineForExport) {
      const element = exportContainerRef.current;
      const options = {
        margin: 0,
        filename: `${outlineForExport.courseCode}_${outlineForExport.courseName}_Outline.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, logging: true, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ['css', 'legacy'] },
      };

      console.log("Starting PDF generation from ref element...");
      setTimeout(async () => {
        try {
          await html2pdf().from(element).set(options).save();
          console.log("PDF generation successful.");
        } catch (error) {
          console.error("PDF generation failed:", error);
          alert("Failed to generate PDF. Check console for errors.");
        } finally {
          setIsExporting(false);
          handleCloseMenus(); // Close all menus after export
        }
      }, 100);
    }
  }, [isExporting, outlineForExport]);

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
    setAnchorEl(null); // Close the main menu
    setExportAnchorEl(event.currentTarget); // Open the export submenu
  };
  
  const handleCloseMenus = () => {
    setAnchorEl(null);
    setExportAnchorEl(null);
    // Don't reset selectedCourse here, we might need it for the iframe
  };

  // --- UNIFIED EXPORT FUNCTIONS ---

  const exportToPDF = async () => {
    if (!selectedCourse) return;
    
    // Fetch data needed for on-the-fly generation
    const docRef = doc(db, "courseOutlines", selectedCourse.id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        setOutlineForExport({ ...docSnap.data(), courseCode: selectedCourse.id });
        setIsExporting(true); // This triggers the useEffect
    } else {
        alert("Outline content not found for generation!");
    }
    handleCloseMenus();
  };

  const printContent = async () => {
    if (!selectedCourse) return;
    const docRef = doc(db, "courseOutlines", selectedCourse.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const outlineData = { ...docSnap.data(), courseCode: selectedCourse.id };
        const tempDivForPrint = document.createElement('div');
        document.body.appendChild(tempDivForPrint);
        const reactRootForPrint = createRoot(tempDivForPrint);
        reactRootForPrint.render(
            <OutlineContent
                outline={outlineData}
                units={outlineData.units || []}
                finalAssessments={outlineData.finalAssessments || []}
                totalHours={outlineData.totalHours || 0}
                viewOnly={true}
            />
        );
        setTimeout(() => {
            const printWindow = window.open("", "", "width=900,height=650");
            printWindow.document.write(`<html><head><title>${outlineData.courseCode} Outline</title></head><body>${tempDivForPrint.innerHTML}</body></html>`);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
            reactRootForPrint.unmount();
            document.body.removeChild(tempDivForPrint);
        }, 100);
    } else {
        alert("Outline content not found for printing!");
    }
    handleCloseMenus();
  };

  const handleEdit = () => {
    if (selectedCourse) navigate(`/edit/${selectedCourse.id}`);
    handleCloseMenus();
  };

  const handleHistory = () => {
    if (selectedCourse) navigate(`/course/${selectedCourse.id}`);
    handleCloseMenus();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" mb={3}>Course Outlines</Typography>
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
                bgcolor: "#e3f2fd",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                userSelect: "none",
                '&:hover': {
                  bgcolor: '#bbdefb', 
                },
              }}
              onClick={() => navigate(`/view/${course.id}`)} 
            >
              <Box>
                <Typography variant="h6">{course.title}</Typography>
                <Typography variant="body2" color="text.secondary">Course ID: {course.id}</Typography>
              </Box>
              <Tooltip title="Options">
                <IconButton onClick={(e) => handleMenuClick(e, course)} size="small">
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
      >
        <MenuItem onClick={handleExportClick}>Export</MenuItem>
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleHistory}>History</MenuItem>
      </Menu>

      {/* Export Submenu - FIXED to call correct functions */}
      <Menu
        anchorEl={exportAnchorEl}
        open={Boolean(exportAnchorEl)}
        onClose={handleCloseMenus}
      >
        <MenuItem onClick={exportToPDF}>Generate New PDF</MenuItem>
        <MenuItem onClick={printContent}>Print</MenuItem>
      </Menu>

      {/* Hidden container for PDF generation */}
      {isExporting && outlineForExport && (
         <div style={{ opacity: 0, pointerEvents: 'none', position: 'fixed' }}>
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