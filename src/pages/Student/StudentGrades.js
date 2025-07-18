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
} from "@mui/material";

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

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box mt={3}>
      <Typography variant="h6" gutterBottom>
        Your Grades
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Assignment</TableCell>
              <TableCell>Grade</TableCell>
              <TableCell>Recorded At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {grades.map((g) => (
              <TableRow key={g.assignment_id}>
                <TableCell>{g.assignment_title}</TableCell>
                <TableCell>{g.grade}</TableCell>
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
