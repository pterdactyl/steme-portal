import React, { useState, useEffect } from "react";
import { Button, Input, Box, Typography } from "@mui/material";

export default function AssignmentSubmission({ courseId, assignmentId, userId, onSubmitted }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchSubmissionStatus() {
      if (!courseId || !assignmentId || !userId) return;

      try {
        const res = await fetch(
          `http://localhost:4000/api/submissions/submitted-status?course_id=${courseId}&assignment_id=${assignmentId}&user_id=${userId}`
        );
        const data = await res.json();
        setSubmitted(data.submitted);
      } catch (err) {
        console.error("Failed to fetch submission status", err);
      }
    }
    fetchSubmissionStatus();
  }, [courseId, assignmentId, userId]);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setError("");
  };

  const handleRemoveFile = (indexToRemove) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async () => {
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
      files.forEach((file) => {
        formData.append("files", file);
      });
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
      if (onSubmitted) onSubmitted();
      alert("Files uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleUnsubmit = async () => {
    if (!window.confirm("Are you sure you want to withdraw your submission to edit?")) return;

    try {
      const res = await fetch("/api/submissions/unsubmit", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_id: courseId, assignment_id: assignmentId, user_id: userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to withdraw submission");

      setSubmitted(false);
      setFiles([]);
      if (onSubmitted) onSubmitted();
      alert("Submission withdrawn. You can now upload new files.");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to withdraw submission");
    }
  };

  return (
    <Box mt={2}>
      <Typography variant="subtitle2">Submit your file(s):</Typography>

      {submitted ? (
        <>
          <Typography color="primary" mb={1}>
            You have already submitted files for this assignment.
          </Typography>
          <Button variant="outlined" color="error" onClick={handleUnsubmit} disabled={uploading}>
            Withdraw Submission / Edit
          </Button>
        </>
      ) : (
        <>
          <Input type="file" inputProps={{ multiple: true }} onChange={handleFileChange} />
          <Button
            variant="contained"
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
                  <li
                    key={index}
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                  >
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
        </>
      )}

      {error && (
        <Typography color="error" variant="caption" display="block" mt={1}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
