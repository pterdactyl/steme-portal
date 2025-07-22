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
          border: "1px solid #a5d6a7", // green border
        }}
      >
        <Table>
          <TableHead>
  <TableRow sx={{ backgroundColor: "#a5d6a7" }}> {/* Green header */}
    <TableCell sx={{ fontWeight: "bold", color: "black" }}>Assignment</TableCell>
    <TableCell sx={{ fontWeight: "bold", color: "black" }}>Grade</TableCell>
    <TableCell sx={{ fontWeight: "bold", color: "black" }}>Recorded At</TableCell>
  </TableRow>
</TableHead>
<TableBody>
  {grades.map((g) => (
    <TableRow
      key={g.assignment_id}
      sx={{
        backgroundColor: "white", // make all rows white
      }}
    >
      <TableCell>
        <Link
          component={RouterLink}
          to={`/student/assignments/${g.assignment_id}`}
          underline="hover"
          sx={{ fontWeight: 500, color: "#1976d2" }} // blue text
        >
          {g.assignment_title}
        </Link>
      </TableCell>
      <TableCell sx={{ fontWeight: 500, color: "black" }}>{g.grade}</TableCell>
      <TableCell sx={{ color: "black" }}>{new Date(g.recorded_at).toLocaleString()}</TableCell>
    </TableRow>
  ))}
  {grades.length === 0 && (
    <TableRow>
      <TableCell colSpan={3} align="center" sx={{ color: "black" }}>
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
