import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  CircularProgress,
  Avatar,
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
          (a, b) => new Date(b.created_at || b.timestamp) - new Date(a.created_at || a.timestamp)
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
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" mb={2} fontWeight={600} color="black">
        Announcements
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
            <Paper
              key={a.announcement_id || a.id || a._id}
              sx={{
                p: 2.5,
                borderRadius: "18px",
                backgroundColor: "#f5f7fa",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                  backgroundColor: "#f0f4f8",
                },
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1.2}>
                  <Avatar
                    sx={{
                      width: 30,
                      height: 30,
                      bgcolor: "primary.main",
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    {a.author ? a.author.charAt(0).toUpperCase() : "U"}
                  </Avatar>
                  <Typography variant="subtitle2" color="text.secondary">
                    {a.author || "Unknown"} •{" "}
                    {new Date(a.created_at || a.timestamp).toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Box mt={1.5}>
                <Typography variant="body1" color="text.primary">
                  <div dangerouslySetInnerHTML={{ __html: a.message }} />
                </Typography>
              </Box>
            </Paper>
          ))
        )}
      </Stack>
    </Box>
  );
}
