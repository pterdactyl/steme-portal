// src/pages/StudentStream.js
import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, TextField, Button, Stack } from "@mui/material";

export default function StudentStream({ user, courseId }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch posts from backend when courseId changes
  useEffect(() => {
    async function fetchPosts() {
      if (!courseId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:4000/api/courses/${courseId}/posts`);
        if (!res.ok) throw new Error("Failed to load posts");
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [courseId]);

  const handlePost = () => {
    if (!newPost.trim()) return;

    const newEntry = {
      id: Date.now(),
      author: user?.fullName || "You",
      content: newPost,
      timestamp: new Date().toLocaleDateString(),
    };

    setPosts((prevPosts) => [newEntry, ...prevPosts]);
    setNewPost("");

    // TODO: Send newEntry to backend to save post persistently
  };

  if (loading) {
    return <Typography>Loading posts...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Stream
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
          <Button variant="contained" onClick={handlePost} disabled={!newPost.trim()}>
            Post
          </Button>
        </Stack>
      </Paper>

      <Stack spacing={2}>
        {posts.length === 0 ? (
          <Typography color="text.secondary">No posts yet.</Typography>
        ) : (
          posts.map((post) => (
            <Paper key={post.id} sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {post.author} • {post.timestamp}
              </Typography>
              <Typography>{post.content}</Typography>
            </Paper>
          ))
        )}
      </Stack>
    </Box>
  );
}
