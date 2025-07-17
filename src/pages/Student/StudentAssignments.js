// src/pages/Student/StudentAssignments.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Stack,
  Link,
} from "@mui/material";
import AssignmentSubmission from "./AssignmentSubmission";
import { useAuth } from "../../Auth/AuthContext";

export default function StudentAssignment({ courseId }) {
  const { userId } = useAuth();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filesByAssignment, setFilesByAssignment] = useState({}); // files keyed by assignment_id
  const [loadingFiles, setLoadingFiles] = useState({}); // track loading per assignment

  useEffect(() => {
    async function fetchAssignments() {
      try {
        const res = await axios.get(`/api/assignments?course_id=${courseId}`);
        setAssignments(res.data);
      } catch (err) {
        console.error("Failed to fetch assignments", err);
      } finally {
        setLoading(false);
      }
    }
    if (courseId) fetchAssignments();
  }, [courseId]);

  async function fetchFiles(assignmentId) {
    setLoadingFiles((prev) => ({ ...prev, [assignmentId]: true }));
    try {
      const res = await axios.get(`/api/assignment-files?assignment_id=${assignmentId}`);
      setFilesByAssignment((prev) => ({ ...prev, [assignmentId]: res.data }));
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
        {assignments.map((assignment) => (
          <Paper key={assignment.id} sx={{ p: 2 }}>
            <Typography variant="h6">{assignment.title}</Typography>
            <Typography>{assignment.description}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Due: {new Date(assignment.due_date).toLocaleDateString()}
            </Typography>
            <Typography variant="caption" sx={{ color: "gray" }}>
              Created: {new Date(assignment.created_at).toLocaleDateString()}
            </Typography>

            <Box mt={2}>
              <Typography variant="subtitle1">Files:</Typography>
              {loadingFiles[assignment.id] ? (
                <Typography>Loading files...</Typography>
              ) : filesByAssignment[assignment.id] && filesByAssignment[assignment.id].length > 0 ? (
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

            {/* Submission Button */}
            <AssignmentSubmission
              courseId={courseId}
              assignmentId={assignment.id}
              userId={userId}
              onSubmitted={() => {
                fetchFiles(assignment.id);
              }}
            />
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
