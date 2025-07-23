import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  CircularProgress,
  Avatar,
} from "@mui/material";

export default function StudentClasslist({ courseId }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchClassList() {
      try {
        const res = await fetch(`http://localhost:4000/api/courses/${courseId}/students`);
        if (!res.ok) throw new Error("Failed to fetch student list");
        const data = await res.json();
        setStudents(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (courseId) fetchClassList();
  }, [courseId]);

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Classmates ({students.length})
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : students.length === 0 ? (
        <Typography color="text.secondary">No students enrolled.</Typography>
      ) : (
        <Stack spacing={2}>
          {students.map((student) => {
            const name = student.fullName || "Unnamed Student";
            const firstInitial = name.charAt(0).toUpperCase() || "U";
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
              firstInitial
            )}&background=random`;

            return (
              <Paper
                key={student.id}
                elevation={2}
                sx={{
                  p: 2,
                  borderRadius: "16px",
                  transition: "box-shadow 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    alt={firstInitial}
                    src={avatarUrl}
                    sx={{ width: 44, height: 44, fontWeight: 500 }}
                  />
                  <Box>
                    <Typography variant="subtitle1" fontWeight={500}>
                      {name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {student.email || "No email"}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
