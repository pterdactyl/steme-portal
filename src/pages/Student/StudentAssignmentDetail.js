// src/pages/Student/StudentAssignmentDetail.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Stack,
} from "@mui/material";
import AssignmentSubmission from "./AssignmentSubmission";
import axios from "axios";
import { useAuth } from "../../Auth/AuthContext";
import AssignmentCommentThread from "./AssignmentCommentThread";

export default function StudentAssignmentDetail() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuth();

  const [assignment, setAssignment] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [assignmentRes, filesRes] = await Promise.all([
          axios.get(`http://localhost:4000/api/assignments/${assignmentId}`),
          axios.get(`http://localhost:4000/api/assignment-files?assignment_id=${assignmentId}`)
        ]);
        setAssignment(assignmentRes.data);
        setFiles(filesRes.data);
      } catch (err) {
        console.error("Error loading assignment detail:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [assignmentId]);

  const refreshFiles = async () => {
    try {
      const res = await axios.get(`/api/assignment-files?assignment_id=${assignmentId}`);
      setFiles(res.data);
    } catch (err) {
      console.error("Failed to refresh files:", err);
    }
  };

  if (loading) return <CircularProgress />;
  if (!assignment) return <Typography>Assignment not found.</Typography>;

  return (
    <Box p={3}>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        ← Back to Assignments
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>{assignment.title}</Typography>
        <Typography>{assignment.description}</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Due: {new Date(assignment.due_date).toLocaleDateString()}
        </Typography>
        <Typography variant="caption" sx={{ color: "gray" }}>
          Created: {new Date(assignment.created_at).toLocaleDateString()}
        </Typography>

        <Box mt={3}>
          <Typography variant="h6">Files:</Typography>
          {files.length > 0 ? (
            <Stack spacing={1}>
              {files.map((file) => (
                <a
                  key={file.id}
                  href={file.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {file.file_name}
                </a>
              ))}
            </Stack>
          ) : (
            <Typography>No files uploaded yet.</Typography>
          )}
        </Box>

        <Box mt={4}>
          <AssignmentSubmission
            assignmentId={assignmentId}
            courseId={assignment.course_id}
            userId={userId}
            onSubmitted={refreshFiles}
          />
        </Box>
        <AssignmentCommentThread assignmentId={assignmentId} userId={userId} />
      </Paper>
    </Box>
  );
}
