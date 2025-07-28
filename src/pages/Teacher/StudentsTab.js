import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Stack,
  Avatar,
} from "@mui/material";

export default function StudentsTab() {
  const { courseId } = useParams();
  const [students, setStudents] = useState([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCourseDetails() {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/courses/${courseId}`);
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
      <Typography variant="h5" gutterBottom>
        Students in {courseTitle}
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : students.length === 0 ? (
        <Typography color="text.secondary">No students enrolled in this course.</Typography>
      ) : (
        <Stack spacing={2}>
          {students.map((student) => {
            const firstInitial = student.name?.charAt(0).toUpperCase() || "U";
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
              firstInitial
            )}&background=random`;

            return (
              <Paper
                key={student.id}
                onClick={() =>
                  navigate(`/students/${student.id}`, { state: { studentName: student.name } })
                }
                elevation={2}
                sx={{
                  p: 2,
                  borderRadius: "16px",
                  transition: "all 0.6s ease-in-out",
                  cursor: "pointer",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    bgcolor: "#e8f5e9",
                  },
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    alt={firstInitial}
                    src={avatarUrl}
                    sx={{ width: 44, height: 44, fontWeight: 500 }}
                  />
                  <Box>
                    <Typography variant="subtitle1" fontWeight={500}>
                      {student.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {student.email}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
