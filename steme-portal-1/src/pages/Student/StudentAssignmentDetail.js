import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Stack,
  Paper,
  Link,
  Divider,
} from "@mui/material";

import AssignmentSubmission from "./AssignmentSubmission";
import AssignmentCommentThread from "./AssignmentCommentThread";
import { useAuth } from "../../Auth/AuthContext";

export default function StudentAssignmentDetail() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuth();

  const [searchParams] = useSearchParams();
  const initialTab = parseInt(searchParams.get("tab")) || 0;
  const [tab, setTab] = useState(initialTab);

  const [assignment, setAssignment] = useState(null);
  const [files, setFiles] = useState([]);
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [assignmentRes, filesRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/assignments/${assignmentId}`),
          axios.get(`${process.env.REACT_APP_API_URL}/assignment-files?assignment_id=${assignmentId}`),
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
  }, [assignmentId, userId]);

  const refreshFiles = async () => {
    try {
      const [filesRes] = await Promise.all([
        axios.get(`/api/assignment-files?assignment_id=${assignmentId}`),
      ]);
      setFiles(filesRes.data);
    } catch (err) {
      console.error("Failed to refresh files:", err);
    }
  };

  const handleDownload = async (fileUrl) => {
    const url = new URL(fileUrl);
    const blobName = decodeURIComponent(url.pathname.split("/").pop());

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/assignments/download-url?blobName=${blobName}`
      );
      if (!res.ok) throw new Error("Failed to get download URL");
      const data = await res.json();
      window.open(data.sasUrl, "_blank");
    } catch (err) {
      console.error("Error fetching secure download link:", err);
      alert("Could not get download link");
    }
  };

  if (loading) return <Box p={3}><CircularProgress /></Box>;
  if (!assignment) return <Typography>Assignment not found.</Typography>;

  return (
    <Box p={3} maxWidth="md" mx="auto">
      <Link
  component={RouterLink}
  to={`/course/${assignment.course_id}?tab=1`}
  underline="hover"
  sx={{
    display: "inline-block",
    mb: 2,
    color: "#388e3c", // green text
    fontWeight: 500,
    "&:hover": {
      color: "#2e7d32", // darker green on hover
    },
  }}
>
  ← Back to Assignments
</Link>

      <Paper elevation={3} sx={{ p: 4, borderRadius: "20px" }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {assignment.title}
        </Typography>

        <Typography
  variant="body1"
  sx={{ mb: 2 }}
  dangerouslySetInnerHTML={{ __html: assignment.description }}
/>

        <Stack direction="row" spacing={4} sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: "gray" }}>
            <strong>Due:</strong>{" "}
            {new Date(assignment.due_date).toLocaleDateString()}
          </Typography>
          <Typography variant="body2" sx={{ color: "gray" }}>
            <strong>Created:</strong>{" "}
            {new Date(assignment.created_at).toLocaleDateString()}
          </Typography>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="h6" gutterBottom>
            Assignment Files
          </Typography>

          {files.length > 0 ? (
            <Stack spacing={1}>
              {files.map((file) => (
                <Button
                  key={file.id}
                  onClick={() => handleDownload(file.file_url)}
                  variant="outlined"
                  size="small"
                  sx={{
                    textTransform: "none",
                    justifyContent: "flex-start",
                    width: "fit-content",
                  }}
                >
                  {file.file_name}
                </Button>
              ))}
            </Stack>
          ) : (
            <Typography color="text.secondary">No files uploaded yet.</Typography>
          )}
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box>
          <Typography variant="h6" gutterBottom>
            Your Submission
          </Typography>
          <AssignmentSubmission
            assignmentId={assignmentId}
            courseId={assignment.course_id}
            userId={userId}
            onSubmitted={refreshFiles}
          />
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box>
          <Typography variant="h6" gutterBottom>
            
          </Typography>
          <AssignmentCommentThread
            assignmentId={assignmentId}
            userId={userId}
          />
        </Box>
      </Paper>
    </Box>
  );
}
