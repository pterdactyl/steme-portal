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
        const res = await fetch(`${process.env.REACT_APP_API_URL}/courses/${courseId}`);
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
        const res = await fetch(`${process.env.REACT_APP_API_URL}/courses/${courseId}/announcements`);
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
        <CircularProgress sx={{ color: "#2e7d32" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" mb={2} color="black">
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
                backgroundColor: "transparent", // very light green background
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 4px 16px rgba(46, 125, 50, 0.3)", // green shadow
                  backgroundColor: "transparent", // light green hover
                },
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1.2}>
                  <Avatar
  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
    a.author ? a.author.split(" ")[0].charAt(0).toUpperCase() : "U"
  )}&background=random`}
  alt={a.author || "User"}
  sx={{
    width: 30,
    height: 30,
    fontSize: 14,
    fontWeight: 500,
  }}
>
  {a.author ? a.author.split(" ")[0].charAt(0).toUpperCase() : "U"}
</Avatar>

                  <Typography variant="subtitle2" color="black">
                    {a.author || "Unknown"} •{" "}
                    {new Date(a.created_at || a.timestamp).toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Box mt={1.5}>
                <Typography variant="body1" color="black">
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
