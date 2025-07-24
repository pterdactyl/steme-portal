import React, { useState, useEffect } from "react";
import Select from "react-select";
import {
  Typography,
  Box,
  Paper,
  Stack,
  Button,
  CircularProgress,
} from "@mui/material";

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchData() {
      const [teacherRes, courseRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/users/teachers`),
        fetch(`${process.env.REACT_APP_API_URL}/courses`)
      ]);

      const teachers = await teacherRes.json();
      const courses = await courseRes.json();

      setTeachers(teachers);
      setCourses(courses);
      setLoading(false);
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedTeacher) {
      setSelectedCourses([]);
      return;
    }

    const assigned = courses.filter(course =>
      course.teachers?.some(t => t.id === selectedTeacher.id)
    );

    const selected = assigned.map(course => ({
      value: course.id,
      label: course.title
    }));

    setSelectedCourses(selected);
  }, [selectedTeacher, courses]);

  const courseOptions = courses.map(course => ({
    value: course.id,
    label: course.title
  }));

  const handleSave = async () => {
    if (!selectedTeacher) return;

    setSaving(true);
    setMessage("");

    try {
      const courseIds = selectedCourses.map(c => c.value);

      await fetch(`${process.env.REACT_APP_API_URL}/users/teachers/${selectedTeacher.id}/courses`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseIds })
      });

      const updatedCourseRes = await fetch(`${process.env.REACT_APP_API_URL}/courses`);
      const updatedCourses = await updatedCourseRes.json();

      setCourses(updatedCourses); // This will trigger the selectedCourses update
      setMessage("✅ Courses updated for teacher.");
    } catch (err) {
      setMessage("❌ Error: " + err.message);
    }

    setSaving(false);
  };

  return (
    <Box maxWidth={900} margin="20px auto" padding={2}>
      <Typography variant="h4" mb={3}>Teacher Management</Typography>

      <Box display="flex" gap={4}>
        <Paper sx={{ flex: 1, maxHeight: 600, overflowY: "auto", padding: 2 }}>
          <Typography variant="h6" mb={1}>All Teachers</Typography>
          <Stack spacing={1}>
            {teachers.map((teacher) => (
              <Box
                key={teacher.id}
                onClick={() => setSelectedTeacher(teacher)}
                sx={{
                  padding: "8px 12px",
                  borderRadius: 1,
                  backgroundColor: selectedTeacher?.id === teacher.id ? "#b3e5fc" : "#f0f0f0",
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "#90caf9" },
                }}
              >
                {teacher.name || teacher.email}
              </Box>
            ))}
          </Stack>
        </Paper>

        <Paper sx={{ flex: 2, padding: 2, minHeight: 300 }}>
          {!selectedTeacher ? (
            <Typography>Select a teacher to assign courses.</Typography>
          ) : (
            <>
              <Typography variant="h6" mb={2}>
                Assign Courses to {selectedTeacher.name}
              </Typography>

              {loading ? (
                <CircularProgress />
              ) : (
                <>
                  <Select
                    isMulti
                    options={courseOptions}
                    value={selectedCourses}
                    onChange={setSelectedCourses}
                    placeholder="Select courses"
                  />

                  <Box mt={2}>
                    <Button variant="contained" onClick={handleSave} disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </Box>

                  {message && (
                    <Typography mt={2} color={message.startsWith("✅") ? "green" : "red"}>
                      {message}
                    </Typography>
                  )}
                </>
              )}
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
}