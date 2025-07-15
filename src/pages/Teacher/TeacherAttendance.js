import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Stack,
} from "@mui/material";

export default function TeacherAttendance() {
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [students, setStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);

  const teacherId = localStorage.getItem("teacherId"); // Or use auth context

  // Fetch teacher's courses
  useEffect(() => {
    if (!teacherId) return;

    setLoading(true);
    axios
      .get(`/api/courses?teacherId=${teacherId}`)
      .then((res) => {
        setTeacherCourses(res.data);
        if (res.data.length > 0 && !selectedCourseId) {
          setSelectedCourseId(res.data[0].id);
        }
      })
      .catch((err) => console.error("Error fetching courses:", err))
      .finally(() => setLoading(false));
  }, [teacherId]);

  // Fetch students for selected course
  useEffect(() => {
    if (!selectedCourseId) {
      setStudents([]);
      return;
    }

    setLoading(true);
    axios
      .get(`/api/students?courseId=${selectedCourseId}`)
      .then((res) => setStudents(res.data))
      .catch((err) => console.error("Error fetching students:", err))
      .finally(() => setLoading(false));
  }, [selectedCourseId]);

  // Fetch attendance for course & date
  useEffect(() => {
    if (!selectedCourseId || !attendanceDate) return;

    axios
      .get(`/api/attendance?courseId=${selectedCourseId}&date=${attendanceDate}`)
      .then((res) => setAttendanceData(res.data || {}))
      .catch(() => setAttendanceData({}));
  }, [selectedCourseId, attendanceDate]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = () => {
    if (!selectedCourseId || !attendanceDate) return;

    const payload = {
      courseId: selectedCourseId,
      date: attendanceDate,
      attendance: attendanceData,
    };

    axios
      .post("/api/attendance", payload)
      .then(() => alert("Attendance saved successfully!"))
      .catch((err) => alert("Error saving attendance: " + err.message));
  };

  return (
    <Box sx={{ maxWidth: 900, margin: "20px auto" }}>
      <Typography variant="h4" mb={3}>Attendance Management</Typography>

      {/* Course Selector */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Course</InputLabel>
        <Select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          disabled={teacherCourses.length === 0}
        >
          {teacherCourses.map((course) => (
            <MenuItem key={course.id} value={course.id}>
              {course.title || course.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Date Picker */}
      <TextField
        label="Select Date"
        type="date"
        value={attendanceDate}
        onChange={(e) => setAttendanceDate(e.target.value)}
        sx={{ mb: 3 }}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />

      {/* Attendance List */}
      <Typography variant="h6" gutterBottom>Mark Attendance</Typography>
      {students.length === 0 ? (
        <Typography>No students found for this course.</Typography>
      ) : (
        <Stack spacing={2}>
          {students.map((student) => (
            <Box key={student.id} sx={{ p: 2, border: "1px solid #ccc", borderRadius: 1 }}>
              <Typography variant="subtitle1">{student.fullName || student.email}</Typography>
              <RadioGroup
                row
                value={attendanceData[student.id] || "Absent"}
                onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
              >
                <FormControlLabel value="Present" control={<Radio />} label="Present" />
                <FormControlLabel value="Absent" control={<Radio />} label="Absent" />
              </RadioGroup>
            </Box>
          ))}
        </Stack>
      )}

      <Box mt={4}>
        <Button variant="contained" onClick={handleSaveAttendance} disabled={students.length === 0}>
          Save Attendance
        </Button>
      </Box>
    </Box>
  );
}
