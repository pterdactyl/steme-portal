import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Table, TableHead, TableRow,
  TableCell, TableBody, Select, MenuItem, Button, TextField, Stack
} from "@mui/material";
import { AuthContext } from "../../Auth/AuthContext";
import 'react-calendar/dist/Calendar.css';
import CustomSnackbar from "../../components/CustomSnackbar";

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

  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [snackbarSeverity, setSnackbarSeverity] = React.useState("info");

  const showSnackbar = (message, severity = "info") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
   };
  
  
   const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
   };
 

   useEffect(() => {
    async function fetchCourseInfo() {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/courses/${courseId}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch course info: ${res.statusText}`);
        }
        const data = await res.json();
        setStudents(data.students);
        setCourseCode(data.course_code);
      } catch (err) {
        console.error("Error fetching course info:", err);
        showSnackbar("Failed to load course information.", "error");
      }
    }
  
    if (courseId) {
      fetchCourseInfo();
    }
  }, [courseId]);
  
  useEffect(() => {
    async function fetchAttendance() {
      if (!courseId || !selectedDate) return;
  
      try {
        const defaultAttendance = {};
        students.forEach(s => (defaultAttendance[s.id] = "Present"));
  
        const attendanceRes = await fetch(
          `${process.env.REACT_APP_API_URL}/attendance/${courseId}/${selectedDate}`
        );
  
        if (!attendanceRes.ok) {
          throw new Error(`Failed to fetch attendance: ${attendanceRes.statusText}`);
        }
  
        const attendanceData = await attendanceRes.json();
        attendanceData.forEach(record => {
          defaultAttendance[record.student_id] = record.status;
        });
  
        setAttendance(defaultAttendance);
      } catch (err) {
        console.error("Error fetching attendance:", err);
        showSnackbar("Failed to load attendance for the selected date.", "error");
      }
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

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(records),
      });
  
      if (res.ok) {
        showSnackbar("Attendance saved!", "success");
      } else {
        const errorText = await res.text();
        throw new Error(`Server error: ${errorText}`);
      }
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to save attendance.", "error");
    }
  }

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
      const res = await fetch(`${process.env.REACT_APP_API_URL}/attendance/${courseId}/all`);
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
      showSnackbar("Failed to export full course attendance.", "error");
    }
  };

 
  return (
    <Box p={4}>
      <Stack spacing={3} mb={3}>
      <Typography variant="h5">
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
                  sx={{
    backgroundColor: "#4caf50", // green
    color: "white",
    "&:hover": {
      backgroundColor: "#45a049", // darker green on hover
    },
  }}
                >
                  View Attendance
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
  
     <Stack direction="row" spacing={2} mt={4}>
  <Button
    variant="contained"
    onClick={handleSave}
    sx={{
      backgroundColor: "#4caf50", // green
      color: "white",
      "&:hover": {
        backgroundColor: "#45a049", // darker green on hover
      },
    }}
  >
    Save Attendance
  </Button>

  <Button
    variant="outlined"
    onClick={exportCSV}
    sx={{
      backgroundColor: "#4caf50", // green background for outlined button
      color: "white",
      borderColor: "#4caf50",
      "&:hover": {
        backgroundColor: "#45a049", // darker green on hover
        borderColor: "#45a049",
      },
    }}
  >
    Export today's attendance
  </Button>

  <Button
    variant="outlined"
    onClick={exportCourseAttendanceCSV}
    sx={{
      backgroundColor: "#4caf50",
      color: "white",
      borderColor: "#4caf50",
      "&:hover": {
        backgroundColor: "#45a049",
        borderColor: "#45a049",
      },
    }}
  >
    Export Full Course Attendance
  </Button>
  <CustomSnackbar
         open={snackbarOpen}
         onClose={handleSnackbarClose}
         severity={snackbarSeverity}
         message={snackbarMessage}
       />
</Stack>

    </Box>
  );
} 