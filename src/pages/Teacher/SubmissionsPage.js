import React, { useEffect, useState, useContext } from "react";
import {
  Box, Typography, IconButton, Button, TextField, Stack,
  CircularProgress, Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../Auth/AuthContext";


export default function StudentSubmissionPage() {
  const { courseId, assignmentId, studentId } = useParams();
  const navigate = useNavigate();
  const { userId } = useContext(AuthContext);


  const [students, setStudents] = useState([]); // list of all students
  const [student, setStudent] = useState(null); // current student details
  const [submission, setSubmission] = useState(null);
  const [comment, setComment] = useState("");
  const [grade, setGrade] = useState("");
  const [neighbors, setNeighbors] = useState({ prev: null, next: null });
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    let ignore = false;
  
    async function fetchData() {
      setLoading(true);
  
      try {
        const studentListRes = await fetch(`http://localhost:4000/api/courses/${courseId}`);
        const studentsList = await studentListRes.json();
  
        if (ignore) return;
  
        setStudents(studentsList);
  
        let selectedId = studentId;
  
        if (!studentId && studentsList.length > 0) {
          selectedId = studentsList[0].id;
          // Redirect to URL with the selectedId
          navigate(`/dashboard/course/${courseId}/assignment/${assignmentId}/submissions/${selectedId}`, { replace: true });
          return;
        }
  
        const submissionRes = await fetch(`/api/submissions/${assignmentId}/${selectedId}`);
        if (!submissionRes.ok) throw new Error("Submission not found");
        const data = await submissionRes.json();
  
        setStudent(data.student);
        setSubmission(data.submission);
        setComment(data.submission.teacher_comment || "");
        setGrade(data.submission.grade ?? "");
  
        const index = studentsList.findIndex((s) => s.id === selectedId);
        const prev = studentsList[index - 1]?.id || null;
        const next = studentsList[index + 1]?.id || null;
        setNeighbors({ prev, next });
      } catch (err) {
        console.error("Error fetching submission/student data", err);
      }
  
      setLoading(false);
    }
  
    fetchData();
    return () => (ignore = true);
  }, [assignmentId, studentId]);

  const save = async () => {
    await fetch(`/api/submissions/${submission.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teacher_comment: comment,
        grade: grade === "" ? null : Number(grade),
        recorded_by: userId
      })
    });
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
            value={student.id}
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
      {submission.files?.length ? (
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