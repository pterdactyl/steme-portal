import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Table, TableHead, TableRow,
  TableCell, TableBody, Select, MenuItem, Button, TextField, Stack
} from "@mui/material";
import { AuthContext } from "../../Auth/AuthContext";
import 'react-calendar/dist/Calendar.css';

const STATUS_OPTIONS = ["Present", "Absent", "Late", "Excused"];

export default function AttendanceTab() {
  const { courseId } = useParams();
  const { userId } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [courseCode, setCourseCode] = useState();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [year, month, day] = selectedDate.split("-");
  const localDate = new Date(year, month - 1, day);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCourseInfo() {
      const res = await fetch(`http://localhost:4000/api/courses/${courseId}`);
      const data = await res.json();
      setStudents(data.students);
      setCourseCode(data.course_code);
    }
  
    if (courseId) {
      fetchCourseInfo();
    }
  }, [courseId]);
  
  useEffect(() => {
    async function fetchAttendance() {
      if (!courseId || !selectedDate) return;
  
      const defaultAttendance = {};
      students.forEach(s => (defaultAttendance[s.id] = "Present"));
  
      const attendanceRes = await fetch(`http://localhost:4000/api/attendance/${courseId}/${selectedDate}`);
      const attendanceData = await attendanceRes.json();
  
      attendanceData.forEach(record => {
        defaultAttendance[record.student_id] = record.status;
      });
  
      setAttendance(defaultAttendance);
    }
  
    fetchAttendance();
  }, [courseId, selectedDate, students]);

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    const records = students.map(student => ({
      student_id: student.id,
      course_id: courseId,
      date: selectedDate,
      status: attendance[student.id],
      recorded_by: userId,
    }));

    const res = await fetch("http://localhost:4000/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(records),
    });

    alert(res.ok ? "Attendance saved!" : "Error saving attendance.");
  };

  const exportCSV = () => {
    const rows = students.map(student => ({
      Name: student.name,
      Status: attendance[student.id] || "Not Marked",
    }));

    const csv = [
      ["Name", "Status"],
      ...rows.map(row => [row.Name, row.Status])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `attendance-${selectedDate}.csv`;
    link.click();
  };

  const exportCourseAttendanceCSV = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/attendance/${courseId}/all`);
      const data = await res.json();
  
      // Step 1: Get all unique dates across all students
      const allDatesSet = new Set();
      data.forEach(student => {
        Object.keys(student.attendance).forEach(date => allDatesSet.add(date));
      });
  
      const allDates = Array.from(allDatesSet).sort(); // e.g., ["2025-07-14", "2025-07-15", ...]
  
      // Step 2: Create CSV header
      const header = ["Student Name", ...allDates];
  
      // Step 3: Create rows for each student
      const rows = data.map(student => {
        const row = [student.student_name];
        allDates.forEach(date => {
          row.push(student.attendance[date] || "-");
        });
        return row;
      });
  
      // Step 4: Combine into CSV string
      const csv = [header, ...rows].map(e => e.join(",")).join("\n");
  
      // Step 5: Trigger CSV download
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
  
      link.href = url;
      link.download = `${courseCode}-full-attendance.csv`;
      link.click();
    } catch (error) {
      console.error("Error exporting pivoted attendance:", error);
      alert("Failed to export attendance. Check console for details.");
    }
  };

 
  return (
    <Box p={4}>
      <Stack spacing={3} mb={3}>
      <Typography variant="h6">
        Attendance for {localDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "America/New_York"
        })}
      </Typography>
  
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            type="date"
            label="Select Date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Select
            defaultValue=""
            onChange={(e) => {
              const updated = {};
              students.forEach(s => updated[s.id] = e.target.value);
              setAttendance(updated);
            }}
            displayEmpty
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="" disabled>Set all to ... </MenuItem>
            {STATUS_OPTIONS.map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
        </Stack>
      </Stack>
  
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell><strong>Student</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
            <TableCell><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map((student, index) => (
            <TableRow key={student.id} sx={{ backgroundColor: index % 2 === 0 ? "#fafafa" : "#fff" }}>
              <TableCell>{student.name}</TableCell>
              <TableCell>
                <Select
                  size="small"
                  value={attendance[student.id] || "Present"}
                  onChange={(e) => handleStatusChange(student.id, e.target.value)}
                  sx={{ minWidth: 140 }}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate(`/dashboard/course/${courseId}/attendance/${student.id}/history`)}
                >
                  View Attendance
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
  
      <Stack direction="row" spacing={2} mt={4}>
        <Button variant="contained" onClick={handleSave}>
          Save Attendance
        </Button>
        <Button variant="outlined" onClick={exportCSV}>
          Export today's attendance
        </Button>
        <Button variant="outlined" onClick={exportCourseAttendanceCSV}>
          Export Full Course Attendance
        </Button>
      </Stack>
    </Box>
  );
} 