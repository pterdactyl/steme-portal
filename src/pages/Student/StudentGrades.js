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
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId || !courseId) return;

    const fetchGrades = async () => {
      try {
        const res = await fetch(`/api/grades/student/${userId}?courseId=${courseId}`);
        if (!res.ok) throw new Error("Failed to fetch grades.");
        const data = await res.json();
        setGrades(data);
      } catch (err) {
        console.error(err);
        setError("Could not load grades.");
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [userId, courseId]);

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Typography color="error" mt={2}>{error}</Typography>;

  return (
    <Box mt={4}>
      <Typography variant="h5" gutterBottom fontWeight={600} color="black">
        Your Grades
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
              <TableCell sx={{ fontWeight: "bold" }}>Assignment</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Grade</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Recorded At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {grades.map((g, index) => (
              <TableRow key={g.assignment_id} sx={{ backgroundColor: index % 2 === 0 ? "#fafafa" : "white" }}>
                <TableCell>
                  <Link
                    component={RouterLink}
                    to={`/student/assignments/${g.assignment_id}`}
                    underline="hover"
                    color="primary"
                    sx={{ fontWeight: 500 }}
                  >
                    {g.assignment_title}
                  </Link>
                </TableCell>
                <TableCell sx={{ fontWeight: 500, color: "black" }}>{g.grade}</TableCell>
                <TableCell>{new Date(g.recorded_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {grades.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No grades recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
