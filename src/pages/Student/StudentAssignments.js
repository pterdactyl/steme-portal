import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Stack,
  Link,
  Chip,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../Auth/AuthContext";

export default function StudentAssignments({ courseId }) {
  const { userId } = useAuth();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filesByAssignment, setFilesByAssignment] = useState({});
  const [loadingFiles, setLoadingFiles] = useState({});
  const [submissionsByAssignment, setSubmissionsByAssignment] = useState({});

  useEffect(() => {
    async function fetchAssignments() {
      try {
        const res = await axios.get(`/api/assignments?course_id=${courseId}`);
        setAssignments(res.data);
      } catch (err) {
        console.error("Failed to fetch assignments", err);
      }
    }

    async function fetchSubmissions() {
      try {
        const res = await axios.get(`/api/submissions/student/${userId}`);
        // Map assignment_id => submitted_at
        const map = {};
        res.data.forEach((sub) => {
          map[sub.assignment_id] = new Date(sub.submitted_at);
        });
        setSubmissionsByAssignment(map);
      } catch (err) {
        console.error("Failed to fetch submissions", err);
      }
    }

    if (courseId && userId) {
      setLoading(true);
      Promise.all([fetchAssignments(), fetchSubmissions()]).finally(() =>
        setLoading(false)
      );
    }
  }, [courseId, userId]);

  async function fetchFiles(assignmentId) {
    setLoadingFiles((prev) => ({ ...prev, [assignmentId]: true }));
    try {
      const res = await axios.get(
        `/api/assignment-files?assignment_id=${assignmentId}`
      );
      setFilesByAssignment((prev) => ({
        ...prev,
        [assignmentId]: res.data,
      }));
    } catch (err) {
      console.error(`Failed to fetch files for assignment ${assignmentId}`, err);
    } finally {
      setLoadingFiles((prev) => ({ ...prev, [assignmentId]: false }));
    }
  }

  useEffect(() => {
    assignments.forEach((assignment) => {
      fetchFiles(assignment.id);
    });
  }, [assignments]);

  const now = new Date();

  function getStatus(assignment) {
    const dueDate = new Date(assignment.due_date);
    const submittedAt = submissionsByAssignment[assignment.id];

    if (submittedAt) {
      if (submittedAt <= dueDate) return "Submitted on time";
      else return "Submitted late";
    } else {
      if (dueDate < now) return "Missing";
      else return "No submission yet";
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case "Submitted on time":
        return "success";
      case "Submitted late":
        return "warning";
      case "Missing":
        return "error";
      case "No submission yet":
      default:
        return "default";
    }
  }

  if (loading) return <CircularProgress />;

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        Assignments
      </Typography>
      <Stack spacing={2}>
        {assignments.length === 0 && (
          <Typography>No assignments found for this course.</Typography>
        )}
        {assignments.map((assignment) => {
          const status = getStatus(assignment);
          return (
            <Paper key={assignment.id} sx={{ p: 2 }}>
              <Box
                component={RouterLink}
                to={`/student/assignments/${assignment.id}`}
                sx={{ textDecoration: "none", color: "inherit" }}
              >
                <Typography variant="h6" sx={{ cursor: "pointer" }}>
                  {assignment.title}
                </Typography>
                <Typography>{assignment.description}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Due: {new Date(assignment.due_date).toLocaleDateString()}
                </Typography>
                <Typography variant="caption" sx={{ color: "gray" }}>
                  Created: {new Date(assignment.created_at).toLocaleDateString()}
                </Typography>
              </Box>

              <Box mt={1}>
                <Chip label={status} color={getStatusColor(status)} size="small" />
              </Box>

              <Box mt={2}>
                <Typography variant="subtitle1">Files:</Typography>
                {loadingFiles[assignment.id] ? (
                  <Typography>Loading files...</Typography>
                ) : filesByAssignment[assignment.id] &&
                  filesByAssignment[assignment.id].length > 0 ? (
                  <Stack spacing={1}>
                    {filesByAssignment[assignment.id].map((file) => (
                      <Link
                        key={file.id}
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                      >
                        {file.file_name}
                      </Link>
                    ))}
                  </Stack>
                ) : (
                  <Typography>No files uploaded.</Typography>
                )}
              </Box>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
}
