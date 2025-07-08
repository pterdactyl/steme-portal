import React, { useEffect, useState, useRef } from "react"; // Import useRef
import { createRoot } from 'react-dom/client';
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { getCoursesForTeacher } from '../Auth/getTeacherCourses';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../Auth/firebase";
import { Box, Typography, Button, IconButton, Menu, MenuItem, Paper, Stack } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ProfileMenu from "../components/ProfileMenu";
import OutlineContent from "./OutlineContent";
import '../styles/EditOutline.css';

export default function TeacherDashboard({ user }) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [outlineForExport, setOutlineForExport] = useState(null);
  const [unitsForExport, setUnitsForExport] = useState([]);
  const [finalAssessmentsForExport, setFinalAssessmentsForExport] = useState([]);
  const [totalHoursForExport, setTotalHoursForExport] = useState(0);
  const [isExportContentReady, setIsExportContentReady] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  const exportContainerRef = useRef(null);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.uid) return;
      const fetchedCourses = await getCoursesForTeacher(user.uid);
      setCourses(fetchedCourses);
    };
    fetchCourses();
  }, [user]);

  // useEffect for PDF Generation
  useEffect(() => {
    if (isExporting && exportContainerRef.current) {
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
      // Timeout ensures browser has painted the new elements
      setTimeout(async () => {
        try {
          await html2pdf().from(element).set(options).save();
          console.log("PDF generation successful.");
        } catch (error) {
          console.error("PDF generation failed:", error);
          alert("Failed to generate PDF. Check console for errors.");
        } finally {
          setIsExporting(false);
          handleExportMenuClose();
        }
      }, 50);
    }
  }, [isExporting, outlineForExport]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const [filterText, setFilterText] = useState("");

  const handleMenuClick = (event, courseId) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourse(courseId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCourse(null);
  };

  const handleExportClick = async (event) => {
    setExportMenuAnchor(event.currentTarget);
    setIsExportContentReady(false);
    if (selectedCourse) {
      const docRef = doc(db, "courseOutlines", selectedCourse);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setOutlineForExport({ ...data, courseCode: selectedCourse });
        setUnitsForExport(data.units || []);
        setFinalAssessmentsForExport(data.finalAssessments || []);
        setTotalHoursForExport(data.totalHours || 0);
        setIsExportContentReady(true);
      } else {
        alert("Outline not found for export!");
        setOutlineForExport(null);
        setIsExportContentReady(false);
      }
    }
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
    setOutlineForExport(null);
    setUnitsForExport([]);
    setFinalAssessmentsForExport([]);
    setTotalHoursForExport(0);
    setIsExportContentReady(false);
  };

  const handleAction = (action) => {
    if (action === "Edit") navigate(`/edit/${selectedCourse}`);
    else alert(`${action} clicked for ${selectedCourse}`);
    handleMenuClose();
  };

  const exportToPDF = () => {
    if (!isExportContentReady || !outlineForExport) {
      console.error("Data not ready for export.");
      return;
    }
    setIsExporting(true);
  };

  // The printContent function remains unchanged
  const printContent = () => {
    if (!isExporting && outlineForExport && isExportContentReady) {
        const tempDivForPrint = document.createElement('div');
        document.body.appendChild(tempDivForPrint);

        const reactRootForPrint = createRoot(tempDivForPrint);
        reactRootForPrint.render(
            <OutlineContent
                outline={outlineForExport}
                units={unitsForExport}
                finalAssessments={finalAssessmentsForExport}
                totalHours={totalHoursForExport}
                viewOnly={true}
            />
        );

        setTimeout(() => {
            const printWindow = window.open("", "", "width=900,height=650");
            printWindow.document.write(`<html><head><title>${outlineForExport.courseCode} Outline</title></head><body>${tempDivForPrint.innerHTML}</body></html>`);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();

            reactRootForPrint.unmount();
            document.body.removeChild(tempDivForPrint);
            handleExportMenuClose();
        }, 100);
    }
  };


  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(filterText.toLowerCase()) ||
      course.id.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <>
      <Box p={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">Dashboard</Typography>
            <Box>
                <Button variant="outlined" sx={{ mr: 2 }} onClick={() => navigate("/attendance")}>
                    Take Attendance
                </Button>
                <ProfileMenu user={user} />
            </Box>
        </Box>
        <Box mb={2} maxWidth={300}>
            <input type="text" placeholder="Search courses..." value={filterText} onChange={(e) => setFilterText(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "14px" }}/>
        </Box>
        <Stack spacing={2}>
            {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                    <Paper key={course.id} sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#b3e5fc" }}>
                        <Typography sx={{ cursor: "pointer" }} onClick={() => { navigate(`/view/${course.id}`); }}>
                            {course.title || course.id || "Untitled Course"}
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
            <MenuItem onClick={() => { alert(`View History clicked for ${selectedCourse}`); handleMenuClose(); }}>View History</MenuItem>
        </Menu>

        {/* --- UPDATED Export Menu --- */}
        <Menu anchorEl={exportMenuAnchor} open={Boolean(exportMenuAnchor)} onClose={handleExportMenuClose}>
            <MenuItem onClick={exportToPDF} disabled={!isExportContentReady}>Export as PDF</MenuItem>
            <MenuItem onClick={printContent} disabled={!isExportContentReady}>Print</MenuItem>
        </Menu>
      </Box>

      {/* Exporting Overlay and Container */}
      {isExporting && outlineForExport && (
        <>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            opacity: 0,
            pointerEvents: 'none',
          }}>
            <div ref={exportContainerRef} id="pdf-container" style={{
              width: '210mm',
              backgroundColor: 'white',
              padding: '15mm',
              boxSizing: 'border-box'
            }}>
              <OutlineContent
                outline={outlineForExport}
                units={unitsForExport}
                finalAssessments={finalAssessmentsForExport}
                totalHours={totalHoursForExport}
                viewOnly={true}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}