import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import {
  Typography, Box, Button, IconButton, Stack, Paper, Menu, MenuItem
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export default function AdminDashboard() {
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

  useEffect(() => {
    async function fetchData() {
      try {
        const [teacherRes, courseRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/users/teachers`),
          fetch(`${process.env.REACT_APP_API_URL}/courses`)
        ]);
        const teachers = await teacherRes.json();
        const courses = await courseRes.json();

        setAllTeachers(teachers.map(t => ({ value: t.id, label: t.name })));
        setCourses(courses);
        setLoading(false);
      } catch (err) {
        setMessage("❌ Error fetching data");
        setLoading(false);
      }
    }
    fetchData();
  }, [message]);

  const handleCreateCourse = async () => {
    if (!title || !code || selectedTeachers.length === 0) {
      setMessage("❌ Please fill in all fields.");
      return;
    }

    try {
      await fetch(`${process.env.REACT_APP_API_URL}/courses/create`, {
        method: 'POST',
        body: JSON.stringify({
          courseCode: code,
          title,
          teacherIds: selectedTeachers.map(t => t.value)
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      setMessage(`✅ Course "${title}" created.`);
      setTitle("");
      setCode("");
      setSelectedTeachers([]);
      setShowForm(false);
    } catch (err) {
      setMessage("❌ Error creating course.");
    }
  };

  const handleUpdateCourse = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/courses/${editingCourseId}`, {
        method: 'PUT',
        body: JSON.stringify({
          title,
          courseCode: code,
          teacherIds: selectedTeachers.map(t => t.value)
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      setMessage("✅ Course updated.");
      setEditingCourseId(null);
      setTitle("");
      setCode("");
      setSelectedTeachers([]);
    } catch (err) {
      setMessage("❌ Error updating course.");
    }
  };

  const handleEditClick = (course) => {
    setEditingCourseId(course.id);
    setShowForm(false); // Close create form
    setTitle(course.title);
    setCode(course.course_code);
    const matchingTeachers = allTeachers.filter(t =>
      course.teachers?.some(teacher => teacher.id === t.value)
    );
    setSelectedTeachers(matchingTeachers);
  };

  const exportToWord = () => {
    if (!exportRef.current) return;
    const html = `
      <html><head><meta charset="utf-8"></head><body>
        ${exportRef.current.innerHTML}
      </body></html>`;
    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedCourse}-export.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMenuAnchor(null);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 800, margin: "20px auto" }}>
      <Typography variant="h4" mb={2}>Admin Dashboard</Typography>

      <Button
        variant="contained"
        onClick={() => {
          setShowForm(prev => {
            if (!prev) {
              setTitle("");
              setCode("");
              setSelectedTeachers([]);
              setEditingCourseId(null); // Clear edit mode
            }
            return !prev;
          });
        }}
        sx={{ mb: 2 }}
      >
        {showForm ? "Cancel" : "➕ Create New Course"}
      </Button>

      {showForm && (
        <Box mb={3} p={2} border="1px solid #ccc" borderRadius={2} sx={{ position: "relative" }}>
          <Button
            size="small"
            onClick={() => setShowForm(false)}
            sx={{ position: "absolute", top: 8, right: 8 }}
            variant="outlined"
            color="error"
          >
            ❌
          </Button>

          <Typography variant="subtitle1" mb={1}>Create New Course</Typography>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Course Title"
            style={{ display: 'block', marginBottom: 10, width: '100%' }}
          />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Course Code"
            style={{ display: 'block', marginBottom: 10, width: '100%' }}
          />
          <Select
            isMulti
            options={allTeachers}
            value={selectedTeachers}
            onChange={setSelectedTeachers}
            placeholder="Select Teachers"
          />
          <Button variant="contained" onClick={handleCreateCourse} sx={{ mt: 2 }}>Create</Button>
        </Box>
      )}

      {message && (
        <Typography color={message.startsWith("✅") ? "green" : "red"}>{message}</Typography>
      )}

      <Stack spacing={2}>
        {courses.map(course => (
          <Box key={course.id}>
            <Paper sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
              <Box onClick={() => window.open(pdfUrls[course.id], "_blank")}>
                <Typography>{course.title}</Typography>
                <Typography variant="caption">{course.course_code}</Typography>
              </Box>
              <Box>
                <IconButton onClick={() => handleEditClick(course)}><EditIcon /></IconButton>
                <IconButton onClick={(e) => { setMenuAnchor(e.currentTarget); setSelectedCourse(course.id); }}>
                  <MoreVertIcon />
                </IconButton>
              </Box>
            </Paper>

            {editingCourseId === course.id && (
              <Box mt={1} p={2} sx={{ border: "1px solid #ccc", borderRadius: 2, position: "relative" }}>
                <Button
                  size="small"
                  onClick={() => setEditingCourseId(null)}
                  sx={{ position: "absolute", top: 8, right: 8 }}
                  variant="outlined"
                  color="error"
                >
                  ❌
                </Button>

                <Typography>Edit Course</Typography>
                  <Typography fontWeight={500} sx={{ mt: 2 }}>Title</Typography>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Course Title"
                    style={{ display: 'block', marginBottom: 10, width: '100%' }}
                  />
                  <Typography fontWeight={500}>Course Code</Typography>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Course Code"
                    style={{ display: 'block', marginBottom: 10, width: '100%' }}
                  />
                <Button variant="contained" onClick={handleUpdateCourse} sx={{ mt: 2 }}>Update</Button>
              </Box>
            )}
          </Box>
        ))}
      </Stack>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={exportToWord}>Export as Word</MenuItem>
        <MenuItem onClick={() => window.print()}>Print</MenuItem>
      </Menu>

      <Box ref={exportRef} sx={{ display: "none" }}>
        {selectedCourse && <Typography>{selectedCourse}</Typography>}
      </Box>
    </div>
  );
}