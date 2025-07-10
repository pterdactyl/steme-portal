import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Typography, Box, Button, IconButton, Stack, Paper } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [studentsRes, coursesRes] = await Promise.all([
          fetch('http://localhost:4000/api/users/students'),
          fetch('http://localhost:4000/api/courses'),
        ]);
        const studentsData = await studentsRes.json();
        const coursesData = await coursesRes.json();

        setStudents(studentsData);
        console.log(studentsData);
        setAllCourses(coursesData.map(course => ({ value: course.id, label: course.title })));
        setLoading(false);
      } catch (err) {
        setMessage("❌ Error loading data");
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleEditClick = (student) => {
    setEditingStudentId(student.id);
    const selected = allCourses.filter(course =>
      student.courseIds?.includes(course.value)
    );
    setSelectedCourses(selected);
  };

  const handleUpdateStudentCourses = async () => {
    if (!editingStudentId) return;

    setMessage("");
    try {
      const courseIds = selectedCourses.map(c => c.value);
      await fetch(`http://localhost:4000/api/users/students/${editingStudentId}/courses`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseIds }),
      });

      setStudents(prev => prev.map(stu =>
        stu.id === editingStudentId ? { ...stu, courseIds } : stu
      ));
      setMessage("✅ Student courses updated.");
      setEditingStudentId(null);
      setSelectedCourses([]);
    } catch (err) {
      setMessage("❌ Error updating courses: " + err.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingStudentId(null);
    setSelectedCourses([]);
    setMessage("");
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ maxWidth: 900, margin: "20px auto", fontFamily: "Arial, sans-serif" }}>
      <Typography variant="h4" mb={3}>Admin - Students</Typography>

      {message && <Typography sx={{ mb: 2, color: message.startsWith("✅") ? "green" : "red" }}>{message}</Typography>}

      <Stack spacing={2}>
        {students.map(student => (
          <Box key={student.id}>
            <Paper sx={{ p: 2, bgcolor: "#e1f5fe", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="subtitle1">{student.name || "Unnamed Student"}</Typography>
                <Typography variant="body2" color="textSecondary">{student.email}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Courses: {student.courseIds?.length
                    ? student.courseIds.map(cid => allCourses.find(c => c.value === cid)?.label || cid).join(", ")
                    : "None"}
                </Typography>
              </Box>
              <Box>
                <IconButton onClick={() => handleEditClick(student)}>
                  <EditIcon />
                </IconButton>
              </Box>
            </Paper>

            {editingStudentId === student.id && (
              <Box mt={1} mb={2} p={3} sx={{ border: "1px solid #ccc", borderRadius: 2, bgcolor: "#f0f4c3" }}>
                <Typography variant="h6" mb={2}>Edit Student Courses</Typography>
                <Select
                  isMulti
                  options={allCourses}
                  value={selectedCourses}
                  onChange={setSelectedCourses}
                  placeholder="Select courses"
                />
                <Box mt={2}>
                  <Button variant="contained" onClick={handleUpdateStudentCourses} sx={{ mr: 2 }}>Update</Button>
                  <Button variant="outlined" onClick={handleCancelEdit}>Cancel</Button>
                </Box>
              </Box>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}