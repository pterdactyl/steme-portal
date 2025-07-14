import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Modal,
} from "@mui/material";
import OutlineContent from "../Teacher/OutlineContent";
import { AuthContext } from "../../Auth/AuthContext";
import html2pdf from "html2pdf.js";

export default function VersionHistory() {
  const { courseId } = useParams();
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const location = useLocation(); 
  const courseFromState = location.state?.course;
  const { userId } = useContext(AuthContext);

  const [outlineForExport, setOutlineForExport] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef(null);

  // Fetch version history
  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(`http://localhost:4000/api/outlines/${courseId}/history`);
        const data = await res.json();
        setVersions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch version history:", err);
      }
    }
    fetchHistory();
  }, [courseId]);

  // Export logic
  useEffect(() => {
    if (isExporting && exportRef.current && outlineForExport) {
      const element = exportRef.current;
      const options = {
        margin: 0,
        filename: `${outlineForExport.courseCode}_${outlineForExport.courseName}_v${outlineForExport.versionId || "1"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ['css', 'legacy'] },
      };

      setTimeout(async () => {
        try {
          await html2pdf().from(element).set(options).save();
        } catch (error) {
          console.error("PDF generation failed:", error);
          alert("Export failed.");
        } finally {
          setIsExporting(false);
        }
      }, 100);
    }
  }, [isExporting, outlineForExport]);

  const handleView = (version) => {
    const parsed = parseVersion(version);
    setSelectedVersion(parsed);
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    setSelectedVersion(null);
  };

  const handleRestore = async (version) => {
    const confirm = window.confirm("Are you sure you want to restore this version?");
    if (!confirm) return;

    try {
      const res = await fetch(`http://localhost:4000/api/outlines/${courseId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...version,
          updated_by: userId,
          course_code: courseFromState?.course_code,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        alert("Version restored successfully!");
      } else {
        alert(`Restore failed: ${result.message}`);
      }
    } catch (err) {
      console.error("Error restoring version:", err);
      alert("Failed to restore version.");
    }
  };

  const handleExport = (version) => {
    const parsed = parseVersion(version);
    setOutlineForExport(parsed);
    setIsExporting(true);
  };

  const parseVersion = (version) => ({
    versionId: version.id,
    courseCode: courseFromState?.course_code || "Course",
    courseName: version.course_name || "",
    grade: version.grade || "",
    courseType: version.course_type || "",
    credit: version.credit || "",
    description: version.description || "",
    learningGoals: version.learning_goals || "",
    assessment: version.assessment || "",
    units: version.units || [],
    final_assessments: version.final_assessments || [],  // keep underscore here
    totalHours: version.total_hours || 0,
  });

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>Version History</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Version</TableCell>
            <TableCell>Edited By</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {versions.map((v, idx) => (
            <TableRow key={v.id}>
              <TableCell>v{versions.length - idx}</TableCell>
              <TableCell>{v.editor_name}</TableCell>
              <TableCell>{new Date(v.updated_at).toLocaleString()}</TableCell>
              <TableCell>
                <Button size="small" onClick={() => handleView(v)}>View</Button>
                <Button size="small" onClick={() => handleRestore(v)}>Restore</Button>
                <Button size="small" onClick={() => handleExport(v)}>Export</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal View */}
      <Modal open={openModal} onClose={handleClose}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxHeight: '90vh',
          overflowY: 'auto',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}>
          {selectedVersion && (
            <OutlineContent
              outline={selectedVersion}
              units={selectedVersion.units}
              finalAssessments={selectedVersion.final_assessments}
              totalHours={selectedVersion.totalHours}
              viewOnly={true}
            />
          )}
        </Box>
      </Modal>

      {/* Export Rendering (Hidden) */}
      {/* Export Rendering (Hidden) */}
        {isExporting && outlineForExport && (
        <div style={{ opacity: 0, pointerEvents: "none", position: "fixed" }}>
            <div ref={exportRef}>
            <OutlineContent
                outline={outlineForExport}
                units={outlineForExport.units}
                finalAssessments={outlineForExport.final_assessments}
                totalHours={outlineForExport.totalHours}
                viewOnly={true}
            />
            </div>
        </div>
        )}
    </Box>
  );
}