import React, { useState, useEffect, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { AuthContext } from "../../Auth/AuthContext";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Avatar } from "@mui/material";
import {
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  CircularProgress,
  Box,
  IconButton,
} from "@mui/material";
import { Edit, Delete, Save, Cancel } from "@mui/icons-material";

export default function AnnouncementsTab() {
  const outlet = useOutletContext();
  const { user: fallbackUser } = useContext(AuthContext);

  const user = outlet?.user || fallbackUser;
  const { courseId, courseData } = outlet || {};

  const isTeacher = true;

  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingMessage, setEditingMessage] = useState("");
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
          author: user?.name || "Teacher",
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

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this announcement?");
    if (!confirm) return;

    try {
      const res = await fetch(`http://localhost:4000/api/courses/${courseId}/announcements/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete announcement");

      setAnnouncements((prev) => prev.filter((a) => a.announcement_id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const startEditing = (id, message) => {
    setEditingId(id);
    setEditingMessage(message);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingMessage("");
  };

  const saveEditing = async (id) => {
    try {
      const res = await fetch(`http://localhost:4000/api/courses/${courseId}/announcements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: editingMessage }),
      });

      if (!res.ok) throw new Error("Failed to update announcement");

      setAnnouncements((prev) =>
        prev.map((a) =>
          a.announcement_id === id ? { ...a, message: editingMessage } : a
        )
      );
      cancelEditing();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
    Announcements
  </Typography>

      {isTeacher && (
        <Paper sx={{ p: 2, mb: 3, borderRadius: "18px", backgroundColor: "#f5f7fa" }}>
          <Typography variant="subtitle1" gutterBottom>
            Post a New Announcement
          </Typography>
          <Stack spacing={2}>
            <ReactQuill
              placeholder="Write your announcement..."
              value={newAnnouncement}
              onChange={(content) => setNewAnnouncement(content)}
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
            <Paper
              key={a.announcement_id}
              sx={{
                p: 2,
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
  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
    a.author ? a.author.charAt(0).toUpperCase() : "U"
  )}&background=random`}
  alt={a.author || "User"}
  sx={{
    width: 30,
    height: 30,
    fontSize: 14,
  }}
>
  {!a.author && "U"}
</Avatar>

                  <Typography variant="subtitle2" color="text.secondary">
                    {a.author} • {new Date(a.created_at).toLocaleString()}
                  </Typography>
                </Box>

                {isTeacher && (
                  <Stack direction="row" spacing={1}>
                    {editingId === a.announcement_id ? (
                      <>
                        <IconButton onClick={() => saveEditing(a.announcement_id)}>
                          <Save />
                        </IconButton>
                        <IconButton onClick={cancelEditing}>
                          <Cancel />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton onClick={() => startEditing(a.announcement_id, a.message)}>
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(a.announcement_id)}>
                          <Delete />
                        </IconButton>
                      </>
                    )}
                  </Stack>
                )}
              </Box>

              {editingId === a.announcement_id ? (
                <ReactQuill
                  value={editingMessage}
                  onChange={(content) => setEditingMessage(content)}
                />
              ) : (
                <div dangerouslySetInnerHTML={{ __html: a.message }} />
              )}
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}
