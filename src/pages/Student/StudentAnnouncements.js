import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  CircularProgress,
} from "@mui/material";

export default function StudentAnnouncements({ courseId }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    async function fetchCourse() {
      if (!courseId) return;
      try {
        const res = await fetch(`http://localhost:4000/api/courses/${courseId}`);
        if (!res.ok) throw new Error("Failed to load course info");
        const data = await res.json();
        setCourse(data);
      } catch (err) {
        console.error("Error fetching course info:", err);
      }
    }

    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    async function fetchAnnouncements() {
      if (!courseId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:4000/api/courses/${courseId}/announcements`);
        if (!res.ok) throw new Error("Failed to load announcements");
        const data = await res.json();

        const sorted = data.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setAnnouncements(sorted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAnnouncements();
  }, [courseId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        {course ? `${course.course_code} Announcements` : "Announcements"}
      </Typography>

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      <Stack spacing={2}>
        {announcements.length === 0 ? (
          <Typography color="text.secondary">No announcements yet.</Typography>
        ) : (
          announcements.map((a) => (
            <Paper key={a.id || a._id} sx={{ p: 2 }}>
              <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              >{a.author} • {new Date(a.created_at || a.timestamp).toLocaleString()}
              </Typography>

              <Typography>{a.message}</Typography>
            </Paper>
          ))
        )}
      </Stack>
    </Box>
  );
}
