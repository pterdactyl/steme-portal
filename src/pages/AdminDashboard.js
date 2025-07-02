import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { auth, db } from "../Auth/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { createCourseWithInitialVersion } from "../Auth/createCourses";
import {
  Typography,
  Box,
  Button,
  IconButton,
  Stack,
  Paper,
  Menu,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export default function AdminDashboard() {
  const [claims, setClaims] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [allTeachers, setAllTeachers] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [message, setMessage] = useState("");

  const [courses, setCourses] = useState([]);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [pdfUrls, setPdfUrls] = useState({});

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const exportRef = useRef(null);

  // Fetch admin claims
  useEffect(() => {
    async function fetchClaims() {
      const user = auth.currentUser;
      if (user) {
        const tokenResult = await user.getIdTokenResult(true);
        setClaims(tokenResult.claims);
      }
      setLoading(false);
    }
    fetchClaims();
  }, []);

  // Fetch teachers
  useEffect(() => {
    async function fetchTeachers() {
      const q = query(collection(db, "users"), where("role", "==", "teacher"));
      const snapshot = await getDocs(q);
      const options = snapshot.docs.map(doc => ({
        value: doc.id,
        label: doc.data().fullName,
      }));
      setAllTeachers(options);
    }
    fetchTeachers();
  }, []);

  // Fetch courses and PDF URLs
  useEffect(() => {
    async function fetchCoursesAndPDFs() {
      const snapshot = await getDocs(collection(db, "courses"));
      const courseData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(courseData);

      const pdfs = {};
      for (const course of courseData) {
        if (course.currentVersion) {
          const versionRef = doc(db, "courses", course.id, "versions", course.currentVersion);
          const versionSnap = await getDoc(versionRef);
          if (versionSnap.exists()) {
            pdfs[course.id] = versionSnap.data().pdf;
          }
        }
      }
      setPdfUrls(pdfs);
    }

    fetchCoursesAndPDFs();
  }, [message]);

  const handleCreateCourse = async () => {
    if (!title || !code || selectedTeachers.length === 0) {
      setMessage("❌ Please fill in all fields.");
      return;
    }

    const teacherUIDs = selectedTeachers.map(t => t.value);

    try {
      await createCourseWithInitialVersion(code, title, teacherUIDs);
      setMessage(`✅ Course "${title}" (${code}) created.`);
      setTitle("");
      setCode("");
      setSelectedTeachers([]);
      setShowForm(false);
    } catch (error) {
      setMessage("❌ Error creating course: " + error.message);
    }
  };

  const handleUpdateCourse = async () => {
    if (!editingCourseId || selectedTeachers.length === 0) {
      setMessage("❌ Please select teachers.");
      return;
    }

    const courseRef = doc(db, "courses", editingCourseId);
    const teacherUIDs = selectedTeachers.map(t => t.value);

    try {
      await updateDoc(courseRef, {
        teacherIds: teacherUIDs,
        title,
        id: code,
      });
      setMessage(`✅ Course "${title}" updated.`);
      setEditingCourseId(null);
      setSelectedTeachers([]);
    } catch (err) {
      setMessage("❌ Error updating course: " + err.message);
    }
  };

  const handleEditClick = (course) => {
    setEditingCourseId(course.id);
    setTitle(course.title);
    setCode(course.id);
    const teacherOptions = allTeachers.filter(t => course.teacherIds?.includes(t.value));
    setSelectedTeachers(teacherOptions);
  };

  const handleCancelEdit = () => {
    setEditingCourseId(null);
    setTitle("");
    setCode("");
    setSelectedTeachers([]);
  };

  const handleExportClick = (event, courseId) => {
    setMenuAnchor(event.currentTarget);
    setSelectedCourse(courseId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedCourse(null);
  };

  const exportToWord = () => {
    if (!exportRef.current) return;
    const sourceHTML = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office'
            xmlns:w='urn:schemas-microsoft-com:office:word'
            xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'></head><body>
          ${exportRef.current.innerHTML}
        </body></html>
    `;
    const blob = new Blob(["\ufeff", sourceHTML], {
      type: "application/msword",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedCourse}-export.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleMenuClose();
  };

  const printContent = () => {
    if (!exportRef.current) return;
    const printWindow = window.open("", "", "width=900,height=650");
    printWindow.document.write(`<html><head><title>Print</title></head><body>${exportRef.current.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.print();
    handleMenuClose();
  };

  if (loading) return <p>Loading...</p>;
  if (!claims?.admin) return <p>Access denied. Admins only.</p>;

  return (
    <div style={{ maxWidth: 800, margin: "20px auto", fontFamily: "Arial, sans-serif" }}>
      <Typography variant="h4" mb={2}>Admin Dashboard</Typography>

      <Button
        variant="contained"
        onClick={() => setShowForm(!showForm)}
        sx={{ mb: 2 }}
      >
        {showForm ? "Cancel" : "➕ Create New Course"}
      </Button>

      {showForm && (
        <Box mb={3} p={2} sx={{ border: "1px solid #ccc", borderRadius: 2 }}>
          <div style={{ marginBottom: 10 }}>
            <label>Course Title:</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Grade 11 Functions"
              style={{ marginLeft: 10, width: "100%" }}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label>Course Code:</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. MCR3U"
              style={{ marginLeft: 10, width: "100%" }}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label>Select Teachers:</label>
            <Select
              isMulti
              options={allTeachers}
              value={selectedTeachers}
              onChange={setSelectedTeachers}
              placeholder="Select one or more teachers"
            />
          </div>

          <Button variant="contained" onClick={handleCreateCourse}>
            Create Course
          </Button>
        </Box>
      )}

      {message && (
        <Typography sx={{ mt: 2, color: message.startsWith("✅") ? "green" : "red" }}>
          {message}
        </Typography>
      )}

      <Typography variant="h5" mt={4} mb={2}>All Courses</Typography>

      <Stack spacing={2}>
        {courses.map((course) => (
          <Box key={course.id}>
            <Paper
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                bgcolor: "#e0f7fa",
              }}
            >
              <Box
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
                <Typography variant="subtitle1">{course.title}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {course.id}
                </Typography>
              </Box>

              <Box>
                <IconButton onClick={() => handleEditClick(course)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={(e) => handleExportClick(e, course.id)}>
                  <MoreVertIcon />
                </IconButton>
              </Box>
            </Paper>

            {editingCourseId === course.id && (
              <Box mt={1} mb={2} p={2} sx={{ border: "1px solid #ccc", borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1">Edit Course</Typography>
                  <Button onClick={handleCancelEdit} color="error" size="small" variant="outlined">
                    ❌ 
                  </Button>
                </Box>

                <div style={{ marginBottom: 10 }}>
                  <label>Course Title:</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ marginLeft: 10, width: "100%" }}
                  />
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label>Select Teachers:</label>
                  <Select
                    isMulti
                    options={allTeachers}
                    value={selectedTeachers}
                    onChange={setSelectedTeachers}
                  />
                </div>

                <Button variant="contained" onClick={handleUpdateCourse}>
                  Update Course
                </Button>
              </Box>
            )}
          </Box>
        ))}
      </Stack>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={exportToWord}>Export as Word</MenuItem>
        <MenuItem onClick={printContent}>Print</MenuItem>
        <MenuItem onClick={() => {
          alert(`View History clicked for ${selectedCourse}`);
          handleMenuClose();
        }}>
          View History
        </MenuItem>
      </Menu>

      {/* Hidden export content */}
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
        {selectedCourse && (
          <>
            <Typography variant="h5">{selectedCourse}</Typography>
            <Typography mt={2}>
              This is the export content for {selectedCourse}.
            </Typography>
          </>
        )}
      </Box>
    </div>
  );
}