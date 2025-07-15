import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Stack,
  Divider,
} from "@mui/material";

export default function StudentsTab() {
  const { courseId } = useParams();
  const [students, setStudents] = useState([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourseDetails() {
      try {
        const res = await fetch(`http://localhost:4000/api/courses/${courseId}`);
        if (!res.ok) throw new Error("Failed to fetch course");
        const data = await res.json();

        setStudents(data.students || []);
        setCourseTitle(data.title || "Course");
      } catch (err) {
        console.error("Error loading students:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCourseDetails();
  }, [courseId]);

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        Students in {courseTitle}
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : students.length === 0 ? (
        <Typography>No students enrolled in this course.</Typography>
      ) : (
        <Stack spacing={2}>
          {students.map((student) => (
            <Paper
              key={student.id}
              sx={{
                p: 2,
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Typography variant="subtitle1">{student.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {student.email}
              </Typography>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}