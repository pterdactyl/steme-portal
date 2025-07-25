import React, { useState } from "react";
import { supabase } from "../../supabase"; // adjust path as needed

export default function FileUpload({ userId }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle file selection
  function handleFileChange(event) {
    setFile(event.target.files[0]);
  }

  // Upload the file to Supabase Storage
  async function uploadFile() {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }
    setUploading(true);
    setMessage("");

    try {
      // Create a unique file path - using userId and filename
      const filePath = `uploads`;

      // Upload to 'submissions' bucket
      const { data, error } = await supabase.storage
        .from("submissions")
        .upload(filePath, file, { upsert: true });

      if (error) {
        throw error;
      }

      setMessage("File uploaded successfully!");
      console.log("File path:", data.path);
    } catch (error) {
      console.error("Upload error:", error.message);
      setMessage(`Error uploading file: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={uploadFile} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}