import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { db } from "../Auth/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AnnouncementsTab() {
  const { courseId, announcements, courseData } = useOutletContext();

  const [newAnnouncement, setNewAnnouncement] = useState("");

  const handlePost = async () => {
    if (!newAnnouncement.trim()) return;

    await addDoc(collection(db, "courses", courseId, "announcements"), {
      message: newAnnouncement,
      createdAt: serverTimestamp(),
    });

    setNewAnnouncement("");
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>{courseData?.title || "Announcements"}</h2>

      <textarea
        value={newAnnouncement}
        onChange={(e) => setNewAnnouncement(e.target.value)}
        placeholder="Write a new announcement..."
        rows={4}
        style={{ width: "100%", marginTop: "1rem", marginBottom: "0.5rem" }}
      />
      <button onClick={handlePost}>Post Announcement</button>

      <h3 style={{ marginTop: "2rem" }}>Existing Announcements</h3>
      {(!announcements || announcements.length === 0) ? (
        <p>No announcements yet.</p>
      ) : (
        announcements.map((a, index) => (
          <div
            key={index}
            style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}
          >
            <p>{a.message}</p>
            <small>
              {a.createdAt?.seconds
                ? new Date(a.createdAt.seconds * 1000).toLocaleString()
                : "Time unknown"}
            </small>
          </div>
        ))
      )}
    </div>
  );
}
