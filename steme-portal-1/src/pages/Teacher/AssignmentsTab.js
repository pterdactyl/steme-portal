import { useEventCallback } from "@mui/material";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { TextField, Typography, Button, IconButton, } from '@mui/material';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";


export default function AssignmentsTab({ user }) {
  const formRef = useRef(null);
  const { courseId } = useParams(); // e.g. "ENG1D"
  const [assignments, setAssignments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editAssignmentId, setEditAssignmentId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [assignmentFiles, setAssignmentFiles] = useState({});
  const [editingFiles, setEditingFiles] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [students, setStudents] = useState([]);
  const [submissions, setSubmissions ] = useState({});



  function formatDateForInput(datetime) {
    const date = new Date(datetime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/courses/${courseId}`);
        if (!res.ok) throw new Error("Failed to fetch students");
        const data = await res.json();
        setStudents(data.students);
        console.log(data);
  
      } catch (err) {
        console.error("Error fetching students", err);
      }
    }
  
    if (courseId) fetchStudents();
  }, [courseId]);

  async function fetchSubmissions() {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/courses/submissions/${courseId}`);
      const data = await res.json();
  
      const grouped = {};
      for (const sub of data) {
        if (!grouped[sub.assignment_id]) grouped[sub.assignment_id] = new Set();
        grouped[sub.assignment_id].add(sub.student_id); // Avoid duplicates
      }
  
      // Convert Sets to counts
      const counts = {};
      for (const [assignmentId, studentSet] of Object.entries(grouped)) {
        counts[assignmentId] = studentSet.size;
      }
  
      setSubmissions(counts);
      console.log("counts:", counts);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  }

  useEffect(() => {
    if (!courseId) return;

    async function fetchAssignments() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/assignments?course_id=${courseId}`);
        if (!res.ok) throw new Error("Failed to fetch assignments");
        const data = await res.json();
        setAssignments(data);
      } catch (err) {
        console.error(err);
        setError("Could not load assignments");
      }
      setLoading(false);
    }
    fetchAssignments();
    fetchSubmissions();
  }, [courseId]);

  useEffect(() => {
    async function fetchFiles() {
      if (assignments.length === 0) return;
      try {
        const newFilesMap = {};
        for (const a of assignments) {
          const res = await fetch(`${process.env.REACT_APP_API_URL}/assignments/assignment_files?assignment_id=${a.id}`);
          if (res.ok) {
            const files = await res.json();
            newFilesMap[a.id] = files;
          }
        }
        console.log("Assignment files:", newFilesMap);
        setAssignmentFiles(newFilesMap);
      } catch (err) {
        console.error("Error fetching assignment files", err);
      }
    }
    fetchFiles();
  }, [assignments]);

  useEffect(() => {
    if (showForm && formRef.current) {
      const yOffset = -250;
      const y = formRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [showForm]);

  const handleEditAssignment = (assignment) => {
    setTitle(assignment.title);
    setDescription(assignment.description);
    setDeadline(formatDateForInput(assignment.due_date));
    setEditAssignmentId(assignment.id);
    setEditingFiles(assignmentFiles[assignment.id] || []);
    setShowForm(true);
  };

  const handleDeleteAssignment = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this assignment?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/assignments/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorMsg = await res.text();
        throw new Error(errorMsg || "Failed to delete assignment");
      }
      await res.json();
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
      setError("Error deleting assignment");
    }
  };
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) return setError("Title is required");
    if (!courseId) return setError("Invalid course ID");

    const formData = new FormData();
    formData.append("course_id", courseId);
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("due_date", deadline || "");
    formData.append("uploaded_by", user.email);
    selectedFiles.forEach((file) => formData.append("files", file));

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/assignments`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text() || "Failed to create assignment");

      const created = await res.json();
      setAssignments((prev) => [
        ...prev,
        {
          id: created.id,
          course_id: courseId,
          title: title.trim(),
          description: description.trim(),
          due_date: deadline,
        },
      ]);
      setTitle("");
      setDescription("");
      setDeadline("");
      setSelectedFiles([]);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError("Error creating assignment");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) return setError("Title is required");

    try {
      const formData = new FormData();
      formData.append("course_id", courseId);
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("due_date", deadline || "");
      formData.append("uploaded_by", user.email);
      selectedFiles.forEach((file) => formData.append("files", file));
      filesToDelete.forEach((id) => formData.append("filesToDelete", id));

      const res = await fetch(`${process.env.REACT_APP_API_URL}/assignments/${editAssignmentId}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text() || "Failed to update assignment");
      const result = await res.json();
      setSnackbarMessage(result.message);
      setSnackbarOpen(true);

      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === editAssignmentId
            ? { ...assignment, title: title.trim(), description: description.trim(), due_date: deadline }
            : assignment
        )
      );

      setTitle("");
      setDescription("");
      setDeadline("");
      setSelectedFiles([]);
      setFilesToDelete([]);
      setEditAssignmentId(null);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError("Error updating assignment");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <Typography variant="h4" sx={{ fontWeight: 'normal', mb: 2 }}>
  Assignments
</Typography>


      <Button
  variant={showForm ? "outlined" : "contained"}
  onClick={() => {
    if (showForm) {
      setShowForm(false);
      setTitle("");
      setDescription("");
      setDeadline("");
      setEditAssignmentId(null);
      setEditingFiles([]);
      setSelectedFiles([]);
      setFilesToDelete([]);
    } else {
      setShowForm(true);
      setEditingFiles([]);
      setSelectedFiles([]);
      setFilesToDelete([]);
    }
  }}
  sx={{
    backgroundColor: showForm ? "white" : "#4caf50", // green when contained
    color: showForm ? "#4caf50" : "white", // text color
    border: showForm ? "1px solid #4caf50" : "none",
    "&:hover": {
      backgroundColor: showForm ? "#f4f4f4" : "#45a049",
    },
  }}
>
  {showForm ? "Cancel" : "+ New Assignment"}
</Button>

      {showForm && (
        <form
          ref={formRef}
          onSubmit={editAssignmentId ? handleEditSubmit : handleSubmit}
          style={{ marginTop: "1rem", marginBottom: "2rem" }}
        >
         <TextField
            label="Assignment Title"
            variant="outlined"
            fullWidth
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
             inputProps={{ maxLength: 80 }}  
            helperText={`${title.length}/80 characters`}
            sx={{
              mb: 2,
              input: {
                fontWeight: "normal", // input text
              },
              label: {
                fontWeight: "normal", // label text
              },
            }}
          />


          <div style={{ marginBottom: 16 }}>
            <ReactQuill
              label="Description"
              variant="outlined"
              fullWidth
              multiline
              minRows={3}
              value={description}
              onChange={(content) => setDescription(content)}
              sx={{ mb: 2 }}
            />
          </div>
          <TextField
            label="Deadline"
            type="datetime-local"
            variant="outlined"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            sx={{ mb: 2 }}
          />

          

          {editAssignmentId && editingFiles.length > 0 && (
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
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '1rem' }}>
            <Button
              component="label"
              size="small"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              sx={{
                    backgroundColor: "#4caf50", // green
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#45a049", // darker green on hover
                    },
                  }}
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
              <ul>
              {editingFiles.map((file, index) => (
                <li key={file.id} style={{ display: "flex", alignItems: "center" }}>
                  <button
                    onClick={async () => {
                      console.log('get');
                      const url = new URL(file.file_url);
                      const blobName = decodeURIComponent(url.pathname.split("/").pop());
                      try {
                        const res = await fetch(
                          `${process.env.REACT_APP_API_URL}/assignments/download-url?blobName=${blobName}`
                        );
                        if (!res.ok) throw new Error("Failed to get download URL");
                        const data = await res.json();
                        window.open(data.sasUrl, "_blank");
                      } catch (err) {
                        console.error("Error fetching download link", err);
                        alert("Could not download file.");
                      }
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#007bff",
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                  >
                    {file.file_name}
                  </button>
            
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

            

            <Button
              type="submit"
              variant="contained"
              size="small"
              sx={{
    backgroundColor: "#4caf50", // green
    color: "white",
    "&:hover": {
      backgroundColor: "#45a049", // darker green on hover
    },
  }}
            >
              Save
            </Button>
          </div>
        </form>
      )}

      <div style={{ marginTop: "20px" }}>
        {assignments.length === 0 ? (
          <p>No assignments yet.</p>
        ) : (
          [...assignments]
            .sort((a, b) => new Date(b.due_date) - new Date(a.due_date))
            .map((a) => (
              <div
                key={a.id}
                onMouseEnter={() => setHoveredId(a.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  border: "1px solid #ddd",
                  padding: "1rem",
                  borderRadius: "5px",
                  marginBottom: "1rem",
                  position: "relative",
                  boxShadow: hoveredId === a.id ? "0 4px 8px rgba(0,0,0,0.2)" : "none",
                  backgroundColor: hoveredId === a.id ? "#f9f9f9" : "white",
                  transition: "box-shadow 0.3s ease, background-color 0.3s ease",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/dashboard/course/${courseId}/assignment/${a.id}/students`)}
              >
                <Typography variant="h6" sx={{ fontWeight: 'normal' , fontSize: '1.1rem' }}>
                  {a.title}
                </Typography>
              
                {a.due_date && (
  <div
  style={{
    position: "absolute",
    top: "10px",
    right: "20px",
    fontWeight: "bold",
    fontSize: "0.9rem",
  }}
  >
    Due:{" "}
    {new Date(a.due_date).toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}
  </div>
)}

{/* Submission status badge - bottom right */}
<div
  style={{
    position: "absolute",
    bottom: "10px",
    right: "15px",
    backgroundColor: "#f0f0f0",
    padding: "4px 8px",
    borderRadius: "8px",
    fontSize: "0.85rem",
    color: "#333",
  }}
>
  {submissions[a.id] || 0} / {students.length} students submitted
</div>

              

                <div style={{ marginTop: "10px" }}>
                <Button
                  style={{ marginRight: "10px" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditAssignment(a);
                  }}
                  variant="text"
                  size="small"
                  sx={{
                  color: "#50C878	"
                 
                }}
                >
                  Edit
                </Button>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAssignment(a.id);
                    }}
                    variant="text"
                    size="small"
                    startIcon={<DeleteIcon />}
                    sx={{
                    color: "grey"
                      }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
        )}
      </div>
        <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
