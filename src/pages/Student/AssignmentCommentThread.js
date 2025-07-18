import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, TextField, Button, Typography, Stack, Paper } from "@mui/material";

const AssignmentCommentThread = ({ assignmentId, userId }) => {
  const [comments, setComments] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/comments/${assignmentId}`);
        setComments(res.data);
      } catch (err) {
        console.error("Failed to load comments:", err);
      }
    };

    fetchComments();
  }, [assignmentId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      await axios.post('http://localhost:4000/api/comments', {
        assignment_id: assignmentId,
        sender_id: userId,
        message: newMessage.trim(),
      });
      setNewMessage("");
      // Refresh comments
      const res = await axios.get(`http://localhost:4000/api/comments/${assignmentId}`);
      setComments(res.data);
    } catch (err) {
      console.error("Failed to send comment:", err);
    }
  };

  return (
    <Box mt={5}>
      <Typography variant="h6" gutterBottom>
        Private Comments
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflowY: "auto", mb: 2 }}>
        {comments.length === 0 ? (
          <Typography>No comments yet.</Typography>
        ) : (
          <Stack spacing={2}>
            {comments.map((c) => (
              <Box key={c.id}>
                <Typography fontWeight="bold">{c.sender_name}</Typography>
                <Typography>{c.message}</Typography>
                <Typography variant="caption" color="gray">
                  {new Date(c.timestamp).toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      <Stack direction="row" spacing={2}>
        <TextField
          fullWidth
          label="Write a comment"
          variant="outlined"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button variant="contained" onClick={handleSend}>
          Send
        </Button>
      </Stack>
    </Box>
  );
};

export default AssignmentCommentThread;
