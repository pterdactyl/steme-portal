import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function AssignmentsTab({ user }) {

  const { courseId } = useParams(); // this is the course code like "ENG1D"


  const [assignments, setAssignments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editAssignmentId, setEditAssignmentId] = useState(null);

  // First, get numeric course_id from course_code
  // useEffect(() => {
  //   async function fetchCourseId() {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       const res = await fetch(`http://localhost:4000/api/assignments/course?course_code=${courseCode}`);
  //       if (!res.ok) throw new Error("Failed to fetch course ID");
  //       const data = await res.json();
  //       setCourseId(data.course_id);
  //     } catch (err) {
  //       console.error(err);
  //       setError("Could not load course info");
  //       setCourseId(null);
  //     }
  //     setLoading(false);
  //   }
  //   fetchCourseId();
  // }, [courseCode]);

  // Once we have courseId, fetch assignments
  useEffect(() => {
    console.log("courseId:", courseId);
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

  // Handle editing an assignment
  const handleEditAssignment = (assignment) => {
    setTitle(assignment.title);
    setDescription(assignment.description);
    setDeadline(assignment.due_date);
    setEditAssignmentId(assignment.id); // Set the ID of the assignment being edited
    setShowForm(true); // Show the form to edit
  };

  // Handle delete assignment
  const handleDeleteAssignment = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this assignment?");

    if (!confirmDelete) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:4000/api/assignments/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorMsg = await res.text();
        throw new Error(errorMsg || "Failed to delete assignment");
      }

      const result = await res.json();

      // Remove deleted assignment from the list
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
      setError("Error deleting assignment");
    }
  };

  // Creating new assignment
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!courseId) {
      setError("Invalid course ID");
      return;
    }

    const payload = {
      course_id: courseId,
      title: title.trim(),
      description: description.trim(),
      due_date: deadline || null,
    };

    try {
      const res = await fetch("http://localhost:4000/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorMsg = await res.text();
        throw new Error(errorMsg || "Failed to create assignment");
      }

      const created = await res.json();

      // Add new assignment to list
      setAssignments((prev) => [...prev, { id: created.id, ...payload }]);

      // Reset form
      setTitle("");
      setDescription("");
      setDeadline("");
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError("Error creating assignment");
    }
  };

  // Handle edit form submission (for updating existing assignments)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    const payload = {
      course_id: courseId, // Use the numeric course_id
      title: title.trim(),
      description: description.trim(),
      due_date: deadline || null,
    };

    try {
      const res = await fetch(`http://localhost:4000/api/assignments/${editAssignmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorMsg = await res.text();
        throw new Error(errorMsg || "Failed to update assignment");
      }

      const result = await res.json();
      alert(result.message); // Confirmation message

      // Update the assignment in the list after successful update
      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === editAssignmentId
            ? { ...assignment, ...payload }
            : assignment
        )
      );

      setTitle("");
      setDescription("");
      setDeadline("");
      setShowForm(false); // Hide the form after submission
    } catch (err) {
      console.error(err);
      setError("Error updating assignment");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Assignments for Course </h1>

      { (
        <button
  onClick={() => {
    if (showForm) {
      // Cancel: hide and clear form
      setShowForm(false);
      setTitle("");
      setDescription("");
      setDeadline("");
      setEditAssignmentId(null);
    } else {
      // New Assignment: show form
      setShowForm(true);
    }
  }}
>
  {showForm ? "Cancel" : "+ New Assignment"}
</button>

      )}

      {showForm && (
        <form onSubmit={editAssignmentId ? handleEditSubmit : handleSubmit} style={{ marginTop: "1rem", marginBottom: "2rem" }}>
          <input
            type="text"
            placeholder="Assignment title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: "100%", marginBottom: "0.5rem" }}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: "100%", marginBottom: "0.5rem" }}
          />
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            style={{ width: "100%", marginBottom: "0.5rem" }}
          />
          <button type="submit">Save Assignment</button>
        </form>
      )}
      
      <div style={{ marginTop: "20px" }}>
        {assignments.length === 0 ? (
          <p>No assignments yet.</p>
        ) : (
          assignments.map((a) => (
            <div
              key={a.id}
              style={{ border: "1px solid #ddd", padding: "1rem", marginBottom: "1rem" }}
            >
              <h3>{a.title}</h3>
              <p>{a.description}</p>
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
              <div style={{ marginTop: "10px" }}>
                <button style={{ marginRight: "10px" }} onClick={() => handleEditAssignment(a)}>Edit</button>
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
