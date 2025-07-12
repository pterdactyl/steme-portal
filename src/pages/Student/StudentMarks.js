// src/pages/StudentMarks.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Stack,
  CircularProgress,
  Divider
} from "@mui/material";

export default function StudentMarks({ courseId, user }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMarks() {
      try {
        const res = await fetch(
          `http://localhost:4000/api/courses/${courseId}/students/${user.id}/marks`
        );
        if (!res.ok) throw new Error("Failed to fetch marks");
        const data = await res.json();
        setAssignments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (courseId && user?.id) fetchMarks();
  }, [courseId, user]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Your Marks
      </Typography>

      {assignments.length === 0 ? (
        <Typography color="text.secondary">No marks available yet.</Typography>
      ) : (
        <Stack spacing={2}>
          {assignments.map((a) => (
            <Paper
              key={a.id}
              sx={{
                p: 2,
                cursor: "pointer",
                "&:hover": { bgcolor: "#f0f0f0" }
              }}
              onClick={() => navigate(`/course/${courseId}/assignment/${a.id}`)}
            >
              <Typography variant="subtitle1">{a.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                Due: {new Date(a.dueDate).toLocaleDateString()}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography>
                {a.mark !== null ? (
                  <>
                    Grade: <strong>{a.mark}</strong> / {a.maxMark}
                  </>
                ) : (
                  <em>Not graded yet</em>
                )}
              </Typography>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}
