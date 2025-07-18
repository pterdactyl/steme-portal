import React, { useEffect, useState } from "react";
import {
  Box, Typography, IconButton, Button, TextField, Stack,
  CircularProgress, Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";

export default function StudentSubmissionPage() {
  const { assignmentId, studentId } = useParams();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [student, setStudent] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [comment, setComment] = useState("");
  const [grade, setGrade] = useState("");
  const [neighbors, setNeighbors] = useState({ prev: null, next: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch students and their submissions
    const fetchData = async () => {
      try {
        // Fetch students and their submissions for the assignment
        const studentRes = await fetch(`/api/assignments/${assignmentId}/students`);
        const studentData = await studentRes.json();
        setStudents(studentData.students);

        const selectedId = studentId || studentData.students[0]?.id;
        const currentStudent = studentData.students.find(s => s.id === selectedId);
        setStudent(currentStudent);

        // Fetch the submission of the selected student for the given assignment
        const submissionRes = await fetch(`/api/submissions/${assignmentId}/${selectedId}`);
        const submissionData = await submissionRes.json();
        setSubmission(submissionData);

        // Set the comment and grade for the submission
        setComment(submissionData.teacher_comment || "");
        setGrade(submissionData.grade?.toString() || "");

        // Set neighbors (previous and next students)
        const index = studentData.students.findIndex(s => s.id === selectedId);
        const prev = studentData.students[index - 1]?.id || null;
        const next = studentData.students[index + 1]?.id || null;
        setNeighbors({ prev, next });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [assignmentId, studentId]);

  const save = async () => {
    try {
      const payload = {
        teacher_comment: comment,
        grade: grade === "" ? null : Number(grade),
      };
      await fetch(`/api/submissions/${assignmentId}/${student.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      alert("Submission saved!");
    } catch (err) {
      console.error("Error saving submission:", err);
    }
  };

  const go = (targetId) => {
    navigate(`/dashboard/assignment/${assignmentId}/submission/${targetId}`);
  };

  if (loading) return <CircularProgress sx={{ m: 4 }} />;

  return (
    <Box p={4} maxWidth={800} margin="auto">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} spacing={2}>
        <IconButton disabled={!neighbors.prev} onClick={() => go(neighbors.prev)}>
          <ArrowBackIos />
        </IconButton>

        <FormControl fullWidth>
          <InputLabel>Student</InputLabel>
          <Select
            value={student?.id || ""}
            label="Student"
            onChange={(e) => go(e.target.value)}
          >
            {students.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <IconButton disabled={!neighbors.next} onClick={() => go(neighbors.next)}>
          <ArrowForwardIos />
        </IconButton>
      </Stack>

      {/* 📁 File Links */}
      {submission?.files?.length ? (
        <Stack spacing={1} mb={3}>
          {submission.files.map((f) => (
            <Button key={f.id} variant="outlined" onClick={() => window.open(f.url, "_blank")}>
              {f.filename}
            </Button>
          ))}
        </Stack>
      ) : (
        <Typography mb={3}>No files submitted.</Typography>
      )}

      {/* 📝 Private Comment */}
      <TextField
        label="Private comment"
        multiline
        rows={3}
        fullWidth
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        sx={{ mb: 3 }}
      />

      {/* 🧮 Grade */}
      <TextField
        label="Grade (0–100)"
        type="number"
        inputProps={{ min: 0, max: 100 }}
        value={grade}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "" || (Number(v) >= 0 && Number(v) <= 100)) setGrade(v);
        }}
        sx={{ width: 140, mb: 3 }}
      />

      <Button variant="contained" onClick={save}>Save</Button>
    </Box>
  );
}