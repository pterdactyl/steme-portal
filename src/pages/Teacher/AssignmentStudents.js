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
  Tabs,
  Tab,
  IconButton, Select, MenuItem, InputLabel, FormControl
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useParams } from "react-router-dom";
import { AuthContext } from "../../Auth/AuthContext";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

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

function formatDateForInput(datetime) {
  if (!datetime) return "";
  const date = new Date(datetime);
  if (isNaN(date)) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function AssignmentStudents() {
  const { courseId, assignmentId } = useParams();
  const { userId } = useContext(AuthContext);

  const [tabIndex, setTabIndex] = useState(0);
  const [assignmentInfo, setAssignmentInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [comment, setComment] = useState("");
  const [grade, setGrade] = useState("");
  const [loading, setLoading] = useState(true);

  const [editingFiles, setEditingFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(""); 
  const [error, setError] = useState(null);

  const [submissions, setSubmissions] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [showOnlySubmitted, setShowOnlySubmitted] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");


  useEffect(() => {
    const fetchAssignment = async () => {
      const res = await fetch(`http://localhost:4000/api/assignments/${assignmentId}`);
      const data = await res.json();
      setAssignmentInfo(data);

      console.log(assignmentId);
      // Fetch all submissions for this assignment
      const res2 = await fetch(`http://localhost:4000/api/submissions/assignment/${assignmentId}`);
      const submissionData = await res2.json();
      setSubmissions(submissionData);
      console.log(submissionData);

      const fileRes = await fetch(`http://localhost:4000/api/assignments/assignment_files?assignment_id=${assignmentId}`);
      const fileData = await fileRes.json();
      setEditingFiles(fileData);
    };

    const fetchStudents = async () => {
      const res = await fetch(`http://localhost:4000/api/courses/${courseId}`);
      const data = await res.json();
      setStudents(data.students);
      if (data.students.length > 0) setSelectedStudentId(data.students[0].id);
    };

    fetchAssignment();
    fetchStudents().finally(() => setLoading(false));
  }, [assignmentId, courseId]);

  // Edit student stauses when assignmentInfo is fetched

  useEffect(() => {
    if (!assignmentInfo || submissions.length === 0) return;
  
    const map = {};
    const dueDate = new Date(assignmentInfo.due_date);
  
    submissions.forEach(sub => {
      const submittedAt = new Date(sub.submitted_at);
      const isLate = submittedAt > dueDate;
      map[sub.student_id] = {
        submitted_at: sub.submitted_at,
        is_late: isLate,
      };
    });
  
    setStatusMap(map);
  }, [assignmentInfo, submissions]);

  useEffect(() => {
    if (assignmentInfo) {
      setTitle(assignmentInfo.title);
      setDescription(assignmentInfo.description);
      setDueDate(formatDateForInput(assignmentInfo.due_date));
    }
  }, [assignmentInfo]);

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!selectedStudentId) return;
      const res = await fetch(
        `http://localhost:4000/api/submissions/${assignmentId}/${selectedStudentId}`
      );
      const data = await res.json();
      setSubmission(data);
      setComment(data.comments?.message || "");
      setGrade(data.grade?.toString() || "");
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

  const handleSaveAssignmentInfo = async () => {
    setError(null);
  
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("course_id", assignmentInfo.course_id);
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("due_date", dueDate || "");
      formData.append("uploaded_by", userId || "");
  
      selectedFiles.forEach((file) => formData.append("files", file));
      filesToDelete.forEach((id) => formData.append("filesToDelete", id));
  
      const res = await fetch(`http://localhost:4000/api/assignments/${assignmentId}`, {
        method: "PUT",
        body: formData,
      });
      console.log(res);
      if (!res.ok) throw new Error(await res.text());
  
      const updated = await res.json();
      alert("Assignment updated!");
     
    } catch (err) {
      console.error(err);
      setError("Error updating assignment");
    }
  };

  if (loading) return <CircularProgress sx={{ m: 4 }} />;



  return (
    <Box sx={{ p: 2 }}>
      {/* Assignment title at top */}
    <Typography variant="h5" fontWeight="bold" mb={2}>
      {assignmentInfo ? assignmentInfo.title : "Loading assignment..."}
    </Typography>
      <Tabs value={tabIndex} onChange={(_, newVal) => setTabIndex(newVal)} sx={{ mb: 2 }}>
        <Tab label="Assignment Info" />
        <Tab label="Student Submissions" />
      </Tabs>

      {tabIndex === 0 && assignmentInfo && (
  <Box component="form" onSubmit={(e) => {
    e.preventDefault();
    handleSaveAssignmentInfo();
  }}>
    {error && (
      <Typography color="error" sx={{ mb: 2 }}>
        {error}
      </Typography>
    )}

    <TextField
      label={
        <span>
          Assignment Title <span style={{ color: 'red' }}>*</span>
        </span>
      }
      variant="outlined"
      fullWidth
      required
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      sx={{ mb: 2 }}
    />

    <Stack spacing={2} sx={{ mb: 2 }}>
      <ReactQuill
        value={description}
        onChange={(val) => setDescription(val)}
        theme="snow"
        style={{ minHeight: "200px" }}
      />

      <TextField
        label="Deadline"
        type="datetime-local"
        variant="outlined"
        fullWidth
        InputLabelProps={{ shrink: true }}
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />
    </Stack>

    {/* Attached Files (existing) */}
    {editingFiles.length > 0 && (
      <ul style={{ marginBottom: "0.5rem" }}>
        {editingFiles.map((file, index) => (
          <li key={file.id}>
            {file.file_name}
            <IconButton
              aria-label="delete"
              style={{ marginLeft: "10px" }}
              onClick={() => {
                const fileToDelete = editingFiles[index];
                setFilesToDelete((prev) => [...prev, fileToDelete.id]);
                setEditingFiles((prev) => prev.filter((_, i) => i !== index));
              }}
            >
              <DeleteIcon />
            </IconButton>
          </li>
        ))}
      </ul>
    )}

    {/* File Upload (new) */}
    <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
      <Button
        component="label"
        size="small"
        variant="contained"
        startIcon={<CloudUploadIcon />}
      >
        Upload
        <input
          type="file"
          hidden
          onChange={(e) => setSelectedFiles([...e.target.files])}
          multiple
        />
      </Button>

      {selectedFiles.length > 0 && (
        <ul style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}>
          {selectedFiles.map((file, i) => (
            <li key={i} style={{ display: "flex", alignItems: "center" }}>
              {file.name}
              <IconButton
                aria-label="delete"
                onClick={() =>
                  setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i))
                }
                style={{ marginLeft: "10px" }}
              >
                <DeleteIcon />
              </IconButton>
            </li>
          ))}
        </ul>
      )}

      <Button type="submit" variant="contained" size="small">
        Save
      </Button>
    </Box>
  </Box>
)}

      {tabIndex === 1 && (
        <Box display="flex" height="100%">
          <Box width="25%" p={2} borderRight="1px solid #ccc">

          
          <FormControl fullWidth sx={{ mb: 2 }}>
  <InputLabel id="filter-status-label">Filter by</InputLabel>
  <Select
    labelId="filter-status-label"
    value={filterStatus}
    label="Filter by"
    onChange={(e) => setFilterStatus(e.target.value)}
    size="small"
  >
    <MenuItem value="name">Name</MenuItem>  
    <MenuItem value="submitted">Submitted</MenuItem>
    <MenuItem value="submittedLate">Submitted Late</MenuItem>
    <MenuItem value="notSubmitted">Not Submitted</MenuItem>
    

  </Select>
</FormControl>
            <Typography variant="h6">Students</Typography>
            <Divider sx={{ my: 1 }} />
            {[...students]
  .filter((s) => {
    const status = statusMap[s.id];
    if (filterStatus === "submitted") return status && !status.is_late;
    if (filterStatus === "submittedLate") return status && status.is_late;
    if (filterStatus === "notSubmitted") return !status;
    return true; // "name" or "all"
  })
  .sort((a, b) => {
    if (filterStatus === "name") {
      return a.name.localeCompare(b.name);
    }
    return 0; // don't sort for other filters
  })
  .map((s) => {
    const status = statusMap[s.id];
    let statusLabel = "Not Submitted";
    let statusColor = "gray";

    if (status) {
      if (status.is_late) {
        statusLabel = "Submitted Late";
        statusColor = "orange";
      } else {
        statusLabel = "Submitted";
        statusColor = "green";
      }
    }

    return (
      <Button
        key={s.id}
        fullWidth
        variant={selectedStudentId === s.id ? "contained" : "text"}
        onClick={() => setSelectedStudentId(s.id)}
        sx={{
          justifyContent: "space-between",
          mb: 1,
          textTransform: "none",
          alignItems: "center",
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="flex-start">
          <Typography>{s.name}</Typography>
          <Typography variant="caption" sx={{ color: statusColor }}>
            {statusLabel}
          </Typography>
        </Box>
      </Button>
    );
  })}
          </Box>

          <Box width="75%" p={4}>
            {submission ? (
              <>
                <Typography variant="h6" gutterBottom>Submitted Work</Typography>
                <Stack spacing={2} mb={3}>
                  {submission.files?.length ? (
                    submission.files.map((f) => (
                      <Button
                        key={f.id}
                        variant="outlined"
                        onClick={async () => {
                          const blobName = decodeURIComponent(new URL(f.file_url).pathname.split("/").pop());
                          const res = await fetch(
                            `http://localhost:4000/api/submissions/download-url?blobName=${blobName}`
                          );
                          const data = await res.json();
                          window.open(data.sasUrl, "_blank");
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
                  onChange={(e) => setGrade(e.target.value)}
                  sx={{ width: 140, mb: 3 }}
                />
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button variant="contained" onClick={save}>Save</Button>
                </Box>
              </>
            ) : (
              <Typography>No submission found.</Typography>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}