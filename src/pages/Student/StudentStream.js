// src/pages/StudentStream.js
import React, { useState } from "react";
import { Box, Typography, Paper, TextField, Button, Stack } from "@mui/material";

export default function StudentStream({ user }) {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Ms. Smith",
      content: "Welcome to the course! Please check the syllabus.",
      timestamp: "July 7, 2025",
    },
    {
      id: 2,
      author: "Mr. Lee",
      content: "Assignment 1 has been posted. Due next Monday.",
      timestamp: "July 6, 2025",
    },
  ]);

  const [newPost, setNewPost] = useState("");

  const handlePost = () => {
    if (!newPost.trim()) return;

    const newEntry = {
      id: posts.length + 1,
      author: user?.fullName || "You",
      content: newPost,
      timestamp: new Date().toLocaleDateString(),
    };

    setPosts([newEntry, ...posts]);
    setNewPost("");
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Stream
      </Typography>

      {/* Create a new post */}
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
          <Button variant="contained" onClick={handlePost}>
            Post
          </Button>
        </Stack>
      </Paper>

      {/* Existing posts */}
      <Stack spacing={2}>
        {posts.map((post) => (
          <Paper key={post.id} sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {post.author} • {post.timestamp}
            </Typography>
            <Typography>{post.content}</Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}