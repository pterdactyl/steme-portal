import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Divider,
  TextField,
  CircularProgress,
  Avatar,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../Auth/AuthContext";

function formatCommentTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;

  // if less than 24 hours
  if (diffMs < 24 * 60 * 60 * 1000) {
    // e.g. "14:35"
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    // e.g. "21 Jul"
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  }
}

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
        console.log(data);
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
        const res = await fetch(
          `http://localhost:4000/api/submissions/${assignmentId}/${selectedStudentId}`
        );
        
        const data = await res.json();
        console.log(data);
        setSubmission(data);
        console.log(data.comments);
        setComment(data.comments.message|| "");
        setGrade(data.grade?.toString() || "");
      } catch (err) {
        console.error("Error fetching submission:", err);
      }
    };

    fetchSubmission();
  }, [assignmentId, selectedStudentId]);

  const save = async () => {
    try {
      const payload = {
        privateComment: comment,
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
      setComment(""); // Clear the comment input
      alert("Submission saved!");
      // Refetch the submission to update comment history
      const res = await fetch(
        `http://localhost:4000/api/submissions/${assignmentId}/${selectedStudentId}`
      );
      const data = await res.json();
      setSubmission(data);
      setGrade(data.grade?.toString() || "");
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
                    onClick={async () => {
                      try {
                        const url = new URL(f.file_url);
                        console.log(f.file_url);
                        console.log(url);
                        const blobName = decodeURIComponent(url.pathname.split("/").pop());
                        console.log(blobName);
                        const res = await fetch(
                          `http://localhost:4000/api/submissions/download-url?blobName=${blobName}`
                        );
                        if (!res.ok) throw new Error("Failed to get download URL");
                        const data = await res.json();
                        window.open(data.sasUrl, "_blank");
                      } catch (err) {
                        console.error("Error getting secure URL", err);
                        alert("Could not download file");
                      }
                    }}
                  >
                    {f.file_name}
                  </Button>
                ))
              ) : (
                <Typography>No files submitted.</Typography>
              )}
            </Stack>
            
            {submission?.comments?.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>Previous Comments</Typography>
              <Stack spacing={2}>
                {submission.comments.map((c) => (
                  <Stack direction="row" spacing={2} alignItems="flex-start" key={c.id}>
                    {/* Avatar on the left */}
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: "primary.main",
                        fontSize: 14,
                        mt: 0.5, // slight nudge down if needed
                      }}
                    >
                      {(c.sender_name || "U")[0].toUpperCase()}
                    </Avatar>

                    {/* Name + Date + Message block */}
                    <Box>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="body2" fontWeight="bold">
                          {c.sender_name || "Unknown"}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ whiteSpace: "nowrap" }}
                        >
                          {formatCommentTime(c.timestamp)}
                        </Typography>
                      </Stack>

                      <Box
                        sx={{
                          mt: 1.2,
                          px: 1.5,
                          py: 1,
                          bgcolor: "#f5f5f5",
                          maxWidth: 400,
                          borderRadius: "20px",
                          display: "inline-block",
                        }}
                      >
                        <Typography variant="body2">{c.message}</Typography>
                      </Box>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}
            
    

            <TextField
              label="Add private comment..."
              multiline
              minRows={1}
              maxRows={6}
              fullWidth
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              sx={{
                mb: 3,
                borderRadius: "9999px",
                "& .MuiInputLabel-root": {
                  fontSize: 12,           // smaller label font size
                  transformOrigin: "top left",  // keep label aligned nicely
                },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "9999px",
                  padding: 0.5,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderRadius: "9999px",
                },
                "& .MuiInputBase-input": {
                  padding: "8.5px 16px",
                  fontSize: 14,
                  lineHeight: 1.4,
                  overflow: "auto",
                },
              }}
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

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" onClick={save}>
            Save
          </Button>
        </Box>
          </>
        ) : (
          <Typography>No submission found.</Typography>
        )}
      </Box>
    </Box>
  );
}