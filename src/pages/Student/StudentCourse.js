// src/pages/Student/StudentCourse.js
import React from "react";
import { useParams } from "react-router-dom";
import StudentStreamWithTabs from "./StudentStreamWithTabs";

export default function StudentCourse({ user }) {
  const { courseId } = useParams();

  return (
    <StudentStreamWithTabs user={user} courseId={courseId} />
  );
}
