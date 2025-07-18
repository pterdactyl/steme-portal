import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Stack,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

export default function StudentDetail() {
  const { studentId } = useParams();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(""); // for dropdown selection
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudentData() {
      try {
        const res = await fetch(`http://localhost:4000/api/students/${studentId}/assignments`);
        const data = await res.json();
        setCourses(data);
        if (data.length > 0) {
          setSelectedCourseId(data[0].courseId); // default to first course
        }
      } catch (err) {
        console.error("Error fetching student details:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStudentData();
  }, [studentId]);

  if (loading) return <CircularProgress />;
  if (courses.length === 0) return <Typography>No enrolled courses found.</Typography>;

  const selectedCourse = courses.find(c => c.courseId === selectedCourseId);

  return (
    <Box p={3}>
      <Typography variant="h5" mb={3}>Student Assignments Overview</Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Course</InputLabel>
        <Select
          value={selectedCourseId}
          label="Select Course"
          onChange={(e) => setSelectedCourseId(e.target.value)}
        >
          {courses.map((course) => (
            <MenuItem key={course.courseId} value={course.courseId}>
              {course.courseTitle}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedCourse && (
        <Box mb={4}>
          <Typography variant="h6">{selectedCourse.courseTitle}</Typography>
          <Divider sx={{ my: 1 }} />
          {selectedCourse.assignments.length === 0 ? (
            <Typography>No assignments in this course.</Typography>
          ) : (
            <Stack spacing={2} key={selectedCourseId}>
  {selectedCourse.assignments.map((assignment) => (
    <Paper key={`${selectedCourseId}-${assignment.assignmentId}`} sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="subtitle1">{assignment.title}</Typography>
      <Typography variant="body2">{assignment.description}</Typography>
      <Typography variant="body2">
        Due: {new Date(assignment.dueDate).toLocaleDateString()}
      </Typography>
      <Typography variant="body2">
        Status: <strong>{assignment.status}</strong>
      </Typography>
      {assignment.submittedAt && (
        <Typography variant="body2">
          Submitted: {new Date(assignment.submittedAt).toLocaleString()}
        </Typography>
      )}
      {assignment.fileUrl && (
  <Typography variant="body2">
    <button
      style={{
        background: "none",
        border: "none",
        color: "#1976d2",
        textDecoration: "underline",
        cursor: "pointer",
        padding: 0,
        fontSize: "inherit"
      }}
      onClick={async () => {
        try {
          const url = new URL(assignment.fileUrl);
          const pathParts = url.pathname.split("/");
          const blobName = decodeURIComponent(pathParts.slice(2).join("/"));

          const res = await fetch(
            `http://localhost:4000/api/assignments/download-url?blobName=${blobName}`
          );
          if (!res.ok) throw new Error("Failed to get download URL");
          const data = await res.json();
          window.open(data.sasUrl, "_blank");
        } catch (err) {
          console.error("Error fetching secure download link:", err);
          alert("Could not get download link");
        }
      }}
    >
      View Submission
    </button>
  </Typography>
)}


    </Paper>
  ))}
</Stack>

          )}
        </Box>
      )}
    </Box>
  );
}