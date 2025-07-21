import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Divider,
  TextField,
  CircularProgress,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../Auth/AuthContext";

export default function AssignmentReviewPage() {
  const { courseId, assignmentId } = useParams();
  const { userId } = useContext(AuthContext);

  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [comment, setComment] = useState("");
  const [grade, setGrade] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/courses/${courseId}`);
        const data = await res.json();
        setStudents(data.students);
        if (data.students.length > 0) {
          setSelectedStudentId(data.students[0].id);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching students:", err);
        setLoading(false);
      }
    };

    fetchStudents();
  }, [courseId]);

  useEffect(() => {
  const fetchSubmission = async () => {
    if (!selectedStudentId) return;

    try {
     // Fetch main submission info (grade + comments)
const res = await fetch(
  `http://localhost:4000/api/submissions/${assignmentId}/${selectedStudentId}`
);
const submissionData = await res.json();

// Fetch files with SAS URLs
const filesRes = await fetch(
  `http://localhost:4000/api/submissions/file-url/${assignmentId}/${selectedStudentId}`
);
const filesData = await filesRes.json();

const fullSubmission = {
  ...submissionData,
  files: filesData.map((f, i) => ({
    id: i,
    file_url: f.url,
    file_name: f.name,
  })),
};

setSubmission(fullSubmission);

      setComment(submissionData.teacher_comment || "");
      setGrade(submissionData.grade?.toString() || "");
    } catch (err) {
      console.error("Error fetching submission:", err);
    }
  };

  fetchSubmission();
}, [assignmentId, selectedStudentId]);


  const save = async () => {
    try {
      const payload = {
        teacher_comment: comment,
        grade: grade === "" ? null : Number(grade),
      };
      await fetch(
        `http://localhost:4000/api/submissions/teacher/${assignmentId}/${selectedStudentId}/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      alert("Submission saved!");
    } catch (err) {
      console.error("Error saving submission:", err);
    }
  };

  if (loading) return <CircularProgress sx={{ m: 4 }} />;

  return (
    <Box display="flex" height="100%">
      {/* Left panel - Student list */}
      <Box width="25%" p={2} borderRight="1px solid #ccc">
        <Typography variant="h6">Students</Typography>
        <Divider sx={{ my: 1 }} />
        {students.map((s) => (
          <Button
            key={s.id}
            fullWidth
            variant={selectedStudentId === s.id ? "contained" : "text"}
            onClick={() => setSelectedStudentId(s.id)}
            sx={{ justifyContent: "flex-start", mb: 1 }}
          >
            {s.name}
          </Button>
        ))}
      </Box>

      {/* Right panel - Submission details */}
      <Box width="75%" p={4}>
        {submission ? (
          <>
            <Typography variant="h6" gutterBottom>
              Submitted Work
            </Typography>
            <Stack spacing={2} mb={3}>
  {submission.files?.length ? (
    submission.files.map((f) => (
      <Button
        key={f.id}
        variant="outlined"
        onClick={() => window.open(f.file_url, "_blank")}
      >
        {f.file_name}
      </Button>
    ))
  ) : (
    <Typography>No files submitted.</Typography>
  )}
</Stack>

            <TextField
              label="Private comment"
              multiline
              rows={3}
              fullWidth
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              sx={{ mb: 3 }}
            />

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

            <Button variant="contained" onClick={save}>
              Save
            </Button>
          </>
        ) : (
          <Typography>No submission found.</Typography>
        )}
      </Box>
    </Box>
  );
}