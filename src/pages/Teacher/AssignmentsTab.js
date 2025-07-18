import { useEventCallback } from "@mui/material";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";


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
  const navigate = useNavigate();

  useEffect(() => {
    if (!courseId) return;

    async function fetchAssignments() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:4000/api/assignments?course_id=${courseId}`);
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
  }, [courseId]);

  useEffect(() => {
    async function fetchFiles() {
      if (assignments.length === 0) return;
      try {
        const newFilesMap = {};
        for (const a of assignments) {
          const res = await fetch(`http://localhost:4000/api/assignments/assignment_files?assignment_id=${a.id}`);
          if (res.ok) {
            const files = await res.json();
            newFilesMap[a.id] = files;
          }
        }
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
    setDeadline(assignment.due_date);
    setEditAssignmentId(assignment.id);
    setEditingFiles(assignmentFiles[assignment.id] || []);
    setShowForm(true);

  };

  const handleDeleteAssignment = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this assignment?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:4000/api/assignments/${id}`, {
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
      const res = await fetch("http://localhost:4000/api/assignments", {
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

      const res = await fetch(`http://localhost:4000/api/assignments/${editAssignmentId}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text() || "Failed to update assignment");
      const result = await res.json();
      alert(result.message);

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
      <h1>Assignments for Course</h1>

      <button
        onClick={() => {
          if (showForm) {
            setShowForm(false);
            setTitle("");
            setDescription("");
            setDeadline("");
            setEditAssignmentId(null);
          } else {
            setShowForm(true);
          }
        }}
      >
        {showForm ? "Cancel" : "+ New Assignment"}
      </button>

      {showForm && (
        <form
          ref={formRef}
          onSubmit={editAssignmentId ? handleEditSubmit : handleSubmit}
          style={{ marginTop: "1rem", marginBottom: "2rem" }}
        >
          <input
            type="text"
            placeholder="Assignment title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: "100%", marginBottom: "0.5rem" }}
          />
          <textarea
           value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            e.target.style.height = "auto"; 
            e.target.style.height = `${e.target.scrollHeight}px`; 
          }}
          style={{
            width: "100%",
            resize: "none",       
            overflow: "hidden",  
            minHeight: "3rem",   
          }}
          />
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            style={{ width: "100%", marginBottom: "0.5rem" }}
          />

          {editAssignmentId && editingFiles.length > 0 && (
            <ul style={{ marginBottom: "0.5rem" }}>
              {editingFiles.map((file, index) => (
                <li key={file.id}>
                  {file.file_name}
                  <button
                    type="button"
                    style={{ marginLeft: "10px" }}
                    onClick={() => {
                      const fileToDelete = editingFiles[index];
                      setFilesToDelete((prev) => [...prev, fileToDelete.id]);
                      setEditingFiles((prev) => prev.filter((_, i) => i !== index));
                    }}
                  >
                    x Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <input
            type="file"
            multiple
            onChange={(e) => setSelectedFiles([...e.target.files])}
            style={{ marginBottom: "0.5rem" }}
          />

          <button type="submit">Save Assignment</button>
        </form>
      )}

      <div style={{ marginTop: "20px" }}>
        {assignments.length === 0 ? (
          <p>No assignments yet.</p>
        ) : (
          [...assignments]
            .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
            .map((a) => (
              <div key={a.id} 
              style={{ border: "1px solid #ddd", padding: "1rem", marginBottom: "1rem" }}
              onClick={() => navigate(`/dashboard/course/${courseId}/assignment/${a.id}/students`)}>
                <h3>{a.title}</h3>
                <p style={{ whiteSpace: "pre-wrap" }}>{a.description}</p>
                {a.due_date && (
                  <p>
                    Due:{" "}
                    {new Date(a.due_date).toLocaleString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}

                {assignmentFiles[a.id] && assignmentFiles[a.id].length > 0 && (
                  <div style={{ marginTop: "0.5rem" }}>
                    {assignmentFiles[a.id].map((file) => (
                      <div key={file.id} style={{ marginBottom: "0.25rem" }}>
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            color: "#007bff",
                            textDecoration: "underline",
                            cursor: "pointer",
                            padding: 0,
                            fontSize: "1rem",
                          }}
                          onClick={async () => {
                          const url = new URL(file.file_url);
                          const blobName = decodeURIComponent(url.pathname.split("/").pop());
                            try {
                              const res = await fetch(
                                `http://localhost:4000/api/assignments/download-url?blobName=${blobName}`
                              );
                              if (!res.ok) throw new Error("Failed to get download URL");
                              const data = await res.json();
                              window.open(data.sasUrl, "_blank");
                            } catch (err) {
                              console.error("Error fetching secure download link:", err);
                              alert("Could not get download link");
                            }
                          }}
                        >
                          {file.file_name}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: "10px" }}>
                  <button style={{ marginRight: "10px" }} onClick={() => handleEditAssignment(a)}>
                    Edit
                  </button>
                  <button onClick={() => handleDeleteAssignment(a.id)}>Delete</button>
                </div>
              </div>
            ))
        )}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
