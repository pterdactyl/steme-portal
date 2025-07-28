import React, { useEffect, useState } from "react";
import { useAuth } from "../../Auth/AuthContext";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Box,
  Link,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function StudentGrades({ courseId }) {
  const { userId } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId || !courseId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [assignmentsRes, gradesRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/assignments?course_id=${courseId}`),
          fetch(`${process.env.REACT_APP_API_URL}/grades/student/${userId}?courseId=${courseId}`)
        ]);

        if (!assignmentsRes.ok) throw new Error("Failed to fetch assignments.");
        if (!gradesRes.ok) throw new Error("Failed to fetch grades.");

        const assignmentsData = await assignmentsRes.json();
        const gradesData = await gradesRes.json();

        setAssignments(assignmentsData);
        setGrades(gradesData);
      } catch (err) {
        console.error(err);
        setError("Could not load grades.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, courseId]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress color="success" />
      </Box>
    );

  if (error)
    return (
      <Typography color="error" mt={2}>
        {error}
      </Typography>
    );

  // Create a map of grades by assignment ID
  const gradesMap = {};
  grades.forEach((g) => {
    gradesMap[g.assignment_id] = g;
  });

  return (
    <Box mt={4}>
      <Typography variant="h5" gutterBottom color="black">
        Your Grades
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: 3,
          border: "1px solid #a5d6a7",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#a5d6a7" }}>
              <TableCell sx={{ fontWeight: "bold", color: "black" }}>
                Assignment
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "black" }}>
                Grade
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "black" }}>
                Recorded At
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.map((assignment) => {
              const gradeInfo = gradesMap[assignment.id];
              return (
                <TableRow key={assignment.id} sx={{ backgroundColor: "white" }}>
                  <TableCell>
                    <Link
                      component={RouterLink}
                      to={`/student/assignments/${assignment.id}`}
                      underline="hover"
                      sx={{ fontWeight: 500, color: "#1976d2" }}
                    >
                      {assignment.title}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500, color: "black" }}>
                    {gradeInfo ? gradeInfo.grade : "—"}
                  </TableCell>
                  <TableCell sx={{ color: "black" }}>
                    {gradeInfo
                      ? new Date(gradeInfo.recorded_at).toLocaleString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })
                      : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
            {assignments.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ color: "black" }}>
                  No assignments available yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
