import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Stack } from "@mui/material";
import { AuthContext } from "../../Auth/AuthContext";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useContext(AuthContext);

  useEffect(() => {
    async function getStudentCourses() {
      if (!userId) {
        setCourses([]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:4000/api/courses?studentId=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch courses");
        const data = await res.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching student courses:", error);
      } finally {
        setLoading(false);
      }
    }

    getStudentCourses();
  }, [userId]);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        My Courses
      </Typography>

      {courses.length === 0 ? (
        <Typography color="text.secondary">
          You are not enrolled in any courses yet. Please contact your teacher or administrator.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {courses.map((course) => (
            <Paper
              key={course.id}
              sx={{
                p: 2,
                bgcolor: "#b3e5fc",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: 2,
                "&:hover": {
                  bgcolor: "#82b1ff",
                },
              }}
              onClick={() => navigate(`/student/stream/${course.id}`)}  // <-- Corrected navigation path here
            >
              <Typography variant="h6">{course.title}</Typography>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}
