import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { Box, Typography, Button } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import "../../styles/AttendanceHistory.css";

const STATUS_COLORS = {
  Present: "#C8E6C9",
  Absent: "#FFCDD2",
  Late: "#FFF9C4",
  Excused: "#BBDEFB",
  default: "#EEEEEE"
};

function Legend() {
  return (
    <Box display="flex" gap={3} mt={2}>
      {Object.entries(STATUS_COLORS).filter(([key]) => key !== 'default').map(([status, color]) => (
        <Box key={status} display="flex" alignItems="center" gap={1}>
          <Box 
            sx={{ 
              width: 20, 
              height: 20, 
              backgroundColor: color, 
              borderRadius: 1,
              border: '1px solid #999' 
            }} 
          />
          <Typography variant="body2">{status}</Typography>
        </Box>
      ))}
    </Box>
  );
}

export default function AttendanceHistory() {
  const { courseId, studentId } = useParams();
  const [records, setRecords] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`http://localhost:4000/api/attendance/student/${studentId}/course/${courseId}`);
      const data = await res.json();
      setRecords(data);
    }
    fetchData();
  }, [courseId, studentId]);

  const getStatusForDate = (date) => {
    const formatted = date.toISOString().split("T")[0];
    const record = records.find(r => r.date.startsWith(formatted));
    return record?.status || null;
  };

  return (
    <Box p={3}>
      <Button
  variant="contained"
  color="success"
  startIcon={<ArrowBackIcon />}
  onClick={() => navigate(-1)}
  sx={{ mb: 3 }}
>
  Back to Attendance
</Button>

      <Box display="flex" flexDirection="column" alignItems="center">
        <Calendar
          tileClassName={({ date, view }) => {
            if (view === 'month') {
              const status = getStatusForDate(date);
              if (status) return `attendance-${status.toLowerCase()}`;
            }
            return null;
          }}
        />
        <Legend />
      </Box>
    </Box>
  );
}