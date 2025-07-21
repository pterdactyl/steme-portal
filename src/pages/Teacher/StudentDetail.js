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
  Button,
} from "@mui/material";

export default function StudentDetail() {
  const { studentId } = useParams();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudentData() {
      try {
        const res = await fetch(`http://localhost:4000/api/students/${studentId}/assignments`);
        const data = await res.json();
        setCourses(data);
        if (data.length > 0) {
          setSelectedCourseId(data[0].courseId);
        }
      } catch (err) {
        console.error("Error fetching student details:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStudentData();
  }, [studentId]);

  if (loading) return <Box p={4}><CircularProgress /></Box>;
  if (courses.length === 0) return <Box p={4}><Typography>No enrolled courses found.</Typography></Box>;

  const selectedCourse = courses.find((c) => c.courseId === selectedCourseId);

  return (
    <Box p={{ xs: 2, sm: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Student Assignment Overview
      </Typography>

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
        <Box>
          <Typography variant="h6" fontWeight="medium">
            {selectedCourse.courseTitle}
          </Typography>
          <Divider sx={{ my: 2 }} />

          {selectedCourse.assignments.length === 0 ? (
            <Typography>No assignments in this course.</Typography>
          ) : (
            <Stack spacing={2}>
              {selectedCourse.assignments.map((assignment) => (
                <Paper key={`${selectedCourseId}-${assignment.assignmentId}`} sx={{ p: 2, borderRadius: 2 }}>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {assignment.title}
                    </Typography>
                    <Typography
  variant="body2"
  component="div"
  dangerouslySetInnerHTML={{ __html: assignment.description }}
/>
                    <Typography variant="body2">
                      <strong>Due:</strong> {new Date(assignment.dueDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Status:</strong> {assignment.status}
                    </Typography>
                    {assignment.submittedAt && (
                      <Typography variant="body2">
                        <strong>Submitted:</strong> {new Date(assignment.submittedAt).toLocaleString()}
                      </Typography>
                    )}
                    {assignment.fileUrl && (
                      <Button
                        variant="text"
                        size="small"
                        sx={{ alignSelf: "start", mt: 1 }}
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
                      </Button>
                    )}
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Box>
      )}
    </Box>
  );
}
