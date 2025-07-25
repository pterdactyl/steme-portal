import React from "react";
import "./CourseModal.css";

export default function CourseModal({ open, onClose, onSelect, courseOptions }) {
  if (!open) return null;

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      onClose(); // close when clicking outside modal-content
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <h3>Select a Course</h3>
        <ul className="course-list">
          {courseOptions.map((course) => (
            <li key={course.id} onClick={() => onSelect(course)}>
              <strong>{course.title}</strong>
              <br />
              <span>{course.code} • {course.credits} Credit</span>
            </li>
          ))}
        </ul>
        <button className="close-btn" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
