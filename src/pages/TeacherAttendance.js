import React, { useState } from "react";
import {
  Box, Typography, MenuItem, Select, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, TextField
} from "@mui/material";

const courses = [
  { id: "ENG1D", title: "Grade 9 English Academic", students: ["Alice", "Bob", "Charlie"] },
  { id: "MPM1D", title: "Grade 9 Math Academic", students: ["David", "Ella", "Frank"] },
];

export default function TeacherAttendance() {
  const [date, setDate] = useState(() => {
    // default to today
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [attendance, setAttendance] = useState({});

  const handleCourseChange = (event) => {
    const courseId = event.target.value;
    setSelectedCourseId(courseId);

    const course = courses.find(c => c.id === courseId);
    const initial = {};
    course.students.forEach(s => initial[s] = "Present");
    setAttendance(initial);
  };

  const toggleStatus = (student) => {
    setAttendance(prev => ({
      ...prev,
      [student]: prev[student] === "Present" ? "Absent" : "Present"
    }));
  };

  const handleSubmit = () => {
    alert(`Attendance submitted for ${selectedCourseId} on ${date}`);
    console.log({ date, course: selectedCourseId, attendance });
  };

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>Take Attendance</Typography>

      <TextField
        label="Select Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        sx={{ mb: 3, maxWidth: 300 }}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />

      <FormControl fullWidth sx={{ maxWidth: 300, mb: 3 }}>
        <InputLabel>Select Course</InputLabel>
        <Select
          value={selectedCourseId}
          label="Select Course"
          onChange={handleCourseChange}
        >
          {courses.map(course => (
            <MenuItem key={course.id} value={course.id}>
              {course.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedCourse && (
        <Box>
          <TableContainer component={Paper} sx={{ maxWidth: 600, mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Attendance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedCourse.students.map(student => (
                  <TableRow key={student}>
                    <TableCell>{student}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color={attendance[student] === "Present" ? "success" : "error"}
                        onClick={() => toggleStatus(student)}
                      >
                        {attendance[student]}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Button variant="contained" onClick={handleSubmit}>
            Submit Attendance
          </Button>
        </Box>
      )}
    </Box>
  );
}
