import React, { useState, useEffect, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { AuthContext } from "../../Auth/AuthContext"; // ✅ NEW
import {
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  CircularProgress,
  Box,
} from "@mui/material";

export default function AnnouncementsTab() {
  const outlet = useOutletContext();
  const { user: fallbackUser } = useContext(AuthContext); // ✅ NEW fallback

  const user = outlet?.user || fallbackUser;
  const { courseId, courseData } = outlet || {};

  const isTeacher = true;


  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId) return;

    setLoading(true);
    setError(null);

    fetch(`http://localhost:4000/api/courses/${courseId}/announcements`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load announcements");
        return res.json();
      })
      .then((data) => setAnnouncements(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handlePost = async () => {
    if (!newAnnouncement.trim()) return;

    setPosting(true);
    setError(null);

    try {
      const res = await fetch(`http://localhost:4000/api/courses/${courseId}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newAnnouncement,
          author: user?.fullName || "Teacher",
        }),
      });

      if (!res.ok) throw new Error("Failed to post announcement");

      const saved = await res.json();
      setAnnouncements((prev) => [saved, ...prev]);
      setNewAnnouncement("");
    } catch (err) {
      setError(err.message || "Failed to post announcement");
    } finally {
      setPosting(false);
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        {courseData?.title || "Course"} — Announcements
      </Typography>

      {isTeacher && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Post a New Announcement
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Write your announcement..."
              value={newAnnouncement}
              onChange={(e) => setNewAnnouncement(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={handlePost}
              disabled={!newAnnouncement.trim() || posting}
            >
              {posting ? "Posting..." : "Post Announcement"}
            </Button>
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
          </Stack>
        </Paper>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : announcements.length === 0 ? (
        <Typography>No announcements yet.</Typography>
      ) : (
        <Stack spacing={2}>
          {announcements.map((a) => (
            <Paper key={a.announcement_id} sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {a.author} • {new Date(a.created_at).toLocaleString()}
              </Typography>
              <Typography>{a.message}</Typography>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}
