// src/pages/StudentClasslist.js
import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Stack, CircularProgress } from "@mui/material";

export default function StudentClassList({ courseId }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchClassList() {
      try {
        const res = await fetch(`http://localhost:4000/api/courses/${courseId}/students`);
        if (!res.ok) throw new Error("Failed to fetch student list");
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (courseId) fetchClassList();
  }, [courseId]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Class List
      </Typography>

      {students.length === 0 ? (
        <Typography color="text.secondary">No students enrolled.</Typography>
      ) : (
        <Stack spacing={2}>
          {students.map((student) => (
            <Paper key={student.id} sx={{ p: 2 }}>
              <Typography variant="subtitle1">{student.fullName}</Typography>
              <Typography variant="body2" color="text.secondary">{student.email}</Typography>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}
