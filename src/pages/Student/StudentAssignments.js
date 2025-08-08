import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Stack,
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
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/assignments?course_id=${courseId}`
        );
        const sortedAssignments = res.data.sort(
          (a, b) => new Date(b.due_date) - new Date(a.due_date)
        );
        setAssignments(sortedAssignments);
      } catch (err) {
        console.error("Failed to fetch assignments", err);
      }
    }

    async function fetchSubmissions() {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/submissions/student/${userId}`
        );
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
        `${process.env.REACT_APP_API_URL}/assignment-files?assignment_id=${assignmentId}`
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

  function getStatusChipColor(status) {
    switch (status) {
      case "Submitted on time":
        return "success";
      case "Submitted late":
        return "warning";
      case "Missing":
        return "error";
      default:
        return "default";
    }
  }

  if (loading)
    return (
      <Box mt={4} display="flex" justifyContent="center">
        <CircularProgress sx={{ color: "success.main" }} />
      </Box>
    );

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom color="black">
        Assignments
      </Typography>
      <Stack spacing={3}>
        {assignments.length === 0 && (
          <Typography color="text.secondary">No assignments found for this course.</Typography>
        )}
        {assignments.map((assignment) => {
          const status = getStatus(assignment);
          return (
            <Box
              key={assignment.id}
              component={RouterLink}
              to={`/student/assignments/${assignment.id}`}
              sx={{
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: "16px",
                  transition: "0.3s",
                  cursor: "pointer",
                  "&:hover": {
                    boxShadow: "0 4px 20px rgba(46, 125, 50, 0.3)",
                    backgroundColor: "transparent",
                  },
                }}
              >
                {/* Top Row: Due + Status */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography variant="body2" fontWeight={600} color="success.dark">
                    {assignment.due_date
                      ? `Due: ${new Date(assignment.due_date).toLocaleString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}`
                      : "No due date"}
                  </Typography>
                  <Chip
                    label={status}
                    color={getStatusChipColor(status)}
                    variant="outlined"
                    size="small"
                  />
                </Box>

                {/* Title */}
                <Typography
                  className="title"
                  variant="h6"
                  fontWeight={600}
                  sx={{ transition: "color 0.3s" }}
                >
                  {assignment.title}
                </Typography>
              </Paper>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
