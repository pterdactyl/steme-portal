import React, { useState, useEffect } from "react";
import { Button, Input, Box, Typography, Link } from "@mui/material";

export default function AssignmentSubmission({ courseId, assignmentId, userId, onSubmitted }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedFiles, setSubmittedFiles] = useState([]);

  useEffect(() => {
    if (courseId && assignmentId && userId) {
      fetchSubmissionStatus();
    }
  }, [courseId, assignmentId, userId]);

  const fetchSubmissionStatus = async () => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/submissions/submitted-status?course_id=${courseId}&assignment_id=${assignmentId}&user_id=${userId}`
      );
      const data = await res.json();
      setSubmitted(data.submitted);

      if (data.submitted) {
        fetchSubmittedFiles();
      }
    } catch (err) {
      console.error("Failed to fetch submission status", err);
    }
  };

  const fetchSubmittedFiles = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/submissions/file-url/${assignmentId}/${userId}`);
      const data = await res.json();
      console.log(data);
      setSubmittedFiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch submitted files", err);
    }
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setError("");
    setMessage("");
  };

  const handleRemoveFile = (indexToRemove) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async () => {
    setMessage("");
    if (files.length === 0) {
      setError("Please select at least one file to submit.");
      return;
    }
    if (!userId || !courseId || !assignmentId) {
      setError("Missing course ID, assignment ID, or user ID.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("course_id", courseId.toString());
      formData.append("assignment_id", assignmentId.toString());
      formData.append("user_id", userId.toString());

      const response = await fetch("http://localhost:4000/api/submissions/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed.");
      }

      setFiles([]);
      setSubmitted(true);
      fetchSubmittedFiles();
      if (onSubmitted) onSubmitted();
      setMessage("Files uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleUnsubmit = async () => {
    setMessage("");
    try {
      const res = await fetch("http://localhost:4000/api/submissions/unsubmit", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_id: courseId, assignment_id: assignmentId, user_id: userId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to withdraw submission");

      setSubmitted(false);
      setFiles([]);
      setSubmittedFiles([]);
      if (onSubmitted) onSubmitted();
      setMessage("Submission withdrawn. You can now upload new files.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to withdraw submission");
    }
  };

  return (
    <Box mt={2}>
      {submitted ? (
        <>
          {submittedFiles.length > 0 ? (
            <ul style={{ paddingLeft: "1.25rem" }}>
              {submittedFiles.map((file, index) => (
                <li key={index}>
                  <Link href={file.url} target="_blank" rel="noopener">
                    {file.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Typography>No submission uploaded yet.</Typography>
          )}

          <Button
            variant="outlined"
            color="error"
            onClick={handleUnsubmit}
            disabled={uploading}
            sx={{ mt: 2 }}
          >
            Withdraw Submission / Edit
          </Button>

          {message && (
            <Typography color="success.main" variant="body2" mt={1}>
              {message}
            </Typography>
          )}

          {error && (
            <Typography color="error" variant="body2" mt={1}>
              {error}
            </Typography>
          )}
        </>
      ) : (
        <>
          <Input type="file" inputProps={{ multiple: true }} onChange={handleFileChange} />
         <Button
  variant="contained"
  color="success"
  size="small"
  onClick={handleSubmit}
  disabled={uploading}
  sx={{ ml: 1, mt: 1 }}
>
  {uploading ? "Uploading..." : "Submit"}
</Button>

          {files.length > 0 && (
            <Box mt={2}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Selected file{files.length > 1 ? "s" : ""}:
              </Typography>
              <ul style={{ paddingLeft: "1.25rem", marginTop: "0.5rem" }}>
                {files.map((file, index) => (
                  <li key={index} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>
                      {file.name} ({Math.round(file.size / 1024)} KB)
                    </span>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleRemoveFile(index)}
                      sx={{ minWidth: "auto", padding: "2px 6px" }}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </Box>
          )}

          {message && (
            <Typography color="success.main" variant="body2" mt={1}>
              {message}
            </Typography>
          )}

          {error && (
            <Typography color="error" variant="body2" mt={1}>
              {error}
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}