import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, TextField, Button, Typography, Stack, Paper, Avatar } from "@mui/material";

// Helper function to format time
function formatCommentTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;

  if (diffMs < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  }
}

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
              <Stack direction="row" spacing={2} alignItems="flex-start" key={c.id}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "primary.main",
                    fontSize: 14,
                    mt: 0.5,
                  }}
                >
                  {(c.sender_name || "U")[0].toUpperCase()}
                </Avatar>

                <Box>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Typography variant="body2" fontWeight="bold">
                      {c.sender_name || "Unknown"}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      {formatCommentTime(c.timestamp)}
                    </Typography>
                  </Stack>

                  <Box
                    sx={{
                      mt: 1.2,
                      px: 1.5,
                      py: 1,
                      bgcolor: "#f5f5f5",
                      maxWidth: 400,
                      borderRadius: "20px",
                      display: "inline-block",
                    }}
                  >
                    <Typography variant="body2">{c.message}</Typography>
                  </Box>
                </Box>
              </Stack>
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
        <Button
  variant="contained"
  onClick={handleSend}
  sx={{
    bgcolor: "#388e3c", // green background
    "&:hover": {
      bgcolor: "#2e7d32", // darker green on hover
    },
  }}
>
  Send
</Button>
      </Stack>
    </Box>
  );
};

export default AssignmentCommentThread;
