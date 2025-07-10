import React, { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../Auth/firebase";

function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [fileURL, setFileURL] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
    setFileURL("");
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a file.");
      return; 
    }

    setUploading(true);
    const filePath = `assignments/${Date.now()}_${file.name}`;

    try {
      const fileRef = ref(storage, filePath);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      setMessage(" Upload successful!");
      setFileURL(url);
      setFile(null);
    } 
    catch (err) {
     console.error("Upload failed:", err.code, err.message);
     setMessage(" Upload failed. Try again.");
    }  
     finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "500px", margin: "0 auto" }}>
      <h2>📤 Upload Assignment</h2>

      <form onSubmit={handleUpload}>
        <input type="file" onChange={handleFileChange} />
        <br /><br />
        <button
          type="submit"
          disabled={uploading}
          style={{
            padding: "10px 20px",
            backgroundColor: uploading ? "#aaa" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: uploading ? "not-allowed" : "pointer"
          }}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {message && <p style={{ marginTop: "20px" }}>{message}</p>}

      {fileURL && (
        <p>
          🔗 <a href={fileURL} target="_blank" rel="noopener noreferrer">View Uploaded File</a>
        </p>
      )}
    </div>
  );
}

export default UploadPage;
