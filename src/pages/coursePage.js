import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../Auth/firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  setDoc,
} from "firebase/firestore";

import { supabase } from "../supabase";

// Helper to format Firestore timestamp or Date to "YYYY-MM-DDTHH:mm"
function formatDateForInput(date) {
  if (!date) return "";
  const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
  const pad = (n) => (n < 10 ? "0" + n : n);

  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function CoursePage({ user }) {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const [assignments, setAssignments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    async function fetchCourse() {
      setLoading(true);
      const courseRef = doc(db, "courses", courseId);
      const courseSnap = await getDoc(courseRef);
      setCourse(courseSnap.exists() ? courseSnap.data() : null);
      setLoading(false);
    }
    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "courses", courseId, "assignments"),
      (snapshot) => {
        setAssignments(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      }
    );
    return () => unsub();
  }, [courseId]);

  const uploadFileToSupabase = async () => {
    if (!file) return "";

    const path = `${courseId}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("submissions")
      .upload(path, file);

    if (error) {
      console.error("Upload failed:", error.message);
      return "";
    }

    const { data: urlData } = supabase.storage
      .from("submissions")
      .getPublicUrl(path);

    return urlData?.publicUrl || "";
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    let uploadedUrl = fileUrl;
    if (file) {
      uploadedUrl = await uploadFileToSupabase();
    }

    const data = {
      title,
      description,
      fileUrl: uploadedUrl,
      deadline: deadline ? new Date(deadline) : null,
      createdAt: serverTimestamp(),
    };

    if (editingAssignment) {
      await setDoc(
        doc(db, "courses", courseId, "assignments", editingAssignment.id),
        data
      );
    } else {
      await addDoc(collection(db, "courses", courseId, "assignments"), data);
    }

    setTitle("");
    setDescription("");
    setDeadline("");
    setFile(null);
    setFileUrl("");
    setEditingAssignment(null);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    await deleteDoc(doc(db, "courses", courseId, "assignments", id));
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setTitle(assignment.title);
    setDescription(assignment.description);
    setFileUrl(assignment.fileUrl || "");
    setDeadline(formatDateForInput(assignment.deadline));
    setShowForm(true);
  };

  if (loading) return <p>Loading...</p>;
  if (!course) return <p>Course not found</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>{course.title || courseId}</h1>

      {user?.role === "teacher" && (
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Assignment"}
        </button>
      )}

      {showForm && (
        <div
          style={{
            marginTop: "1rem",
            marginBottom: "2rem",
            padding: "1rem",
            border: "1px solid #ccc",
          }}
        >
          <h3>{editingAssignment ? "Edit Assignment" : "Create New Assignment"}</h3>
          <input
            type="text"
            placeholder="Assignment title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", marginBottom: "0.5rem" }}
          />
          <textarea
            placeholder="Assignment description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            style={{ width: "100%", marginBottom: "0.5rem" }}
          />

          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min="2020-01-01T00:00"
            max="2100-12-31T23:59"
            style={{ width: "100%", marginBottom: "0.5rem" }}
          />

          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ marginBottom: "0.5rem" }}
          />
          {fileUrl && (
            <p style={{ marginTop: "0.5rem" }}>
              Attached:{" "}
              <a href={fileUrl} target="_blank" rel="noreferrer">
                View File
              </a>
            </p>
          )}
          <button style={{ marginTop: "1rem" }} onClick={handleSubmit}>
            {editingAssignment ? "Update Assignment" : "Save Assignment"}
          </button>
        </div>
      )}

      <h2>Existing Assignments</h2>
      {assignments.length === 0 ? (
        <p>No assignments yet.</p>
      ) : (
        assignments.map((a) => (
          <div
            key={a.id}
            style={{
              border: "1px solid #ddd",
              padding: "1rem",
              marginBottom: "1rem",
              borderRadius: "4px",
            }}
          >
            <h3>{a.title}</h3>
            <p>{a.description}</p>

            {a.deadline && (
              <p>
                 Deadline:{" "}
                 {new Date(a.deadline?.seconds ? a.deadline.seconds * 1000 : a.deadline).toLocaleString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,  // true for AM/PM, false for 24 hour format
               })}
              </p>
            )}

            {a.fileUrl && (
              <a href={a.fileUrl} target="_blank" rel="noreferrer">
                View Attachment
              </a>
            )}
            {user?.role === "teacher" && (
              <div style={{ marginTop: "0.5rem" }}>
                <button onClick={() => handleEdit(a)}> 🖉 Edit</button>
                <button
                  onClick={() => handleDelete(a.id)} 
                  style={{ marginLeft: "0.5rem", color: "red" }}
                >
                   Delete
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
