import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  CircularProgress,
} from "@mui/material";

export default function StudentStream({ user, courseId }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [course, setCourse] = useState(null);  // <-- for course info

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
    async function fetchPosts() {
      if (!courseId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:4000/api/courses/${courseId}/posts`);
        if (!res.ok) throw new Error("Failed to load posts");
        const data = await res.json();

        const sorted = data.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setPosts(sorted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [courseId]);

  const handlePost = async () => {
    if (!newPost.trim()) return;

    const newEntry = {
      author: user?.fullName || "You",
      content: newPost,
    };

    try {
      const res = await fetch(`http://localhost:4000/api/courses/${courseId}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEntry),
      });

      if (!res.ok) throw new Error("Failed to post message");

      const savedPost = await res.json();
      setPosts((prev) => [savedPost, ...prev]);
      setNewPost("");
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

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
  {course ? `${course.course_code}` : "Stream"}
</Typography>

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" mb={1}>
          Post something to the stream
        </Typography>
        <Stack spacing={2}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Share something with the class..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={handlePost}
            disabled={!newPost.trim()}
          >
            Post
          </Button>
        </Stack>
      </Paper>

      <Stack spacing={2}>
        {posts.length === 0 ? (
          <Typography color="text.secondary">No posts yet.</Typography>
        ) : (
          posts.map((post) => (
            <Paper key={post.id || post._id} sx={{ p: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                {post.author} • {new Date(post.timestamp).toLocaleString()}
              </Typography>
              <Typography>{post.content}</Typography>
            </Paper>
          ))
        )}
      </Stack>
    </Box>
  );
}
