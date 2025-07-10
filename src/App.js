import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { getIdTokenResult } from "firebase/auth";

import Box from "@mui/material/Box";

import Login from "./Auth/login";
import Signup from "./Auth/signup";
import { useAuth } from "./Auth/auth";
import PrivateRoute from "./Auth/privateRoute";

import StudentNavbar from "./components/StudentNavbar";
import TeacherNavbar from "./components/TeacherNavbar";
import AdminNavbar from "./components/AdminNavbar";

import Pathways from "./pages/Student/pathways";
import Upload from "./pages/Student/upload";
import TeacherDashboard from "./pages/Teacher/TeacherDashboard";
import StudentDashboard from "./pages/Student/StudentDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import TeacherAttendance from "./pages/Teacher/TeacherAttendance";
import ProfilePage from "./pages/ProfilePage";
import EditOutline from "./pages/Teacher/EditOutline";
import ViewOutline from "./pages/Teacher/ViewOutline";
import AdminCourses from "./pages/Admin/AdminCourses";
import AdminTeachers from "./pages/Admin/AdminTeachers";
import AdminStudents from "./pages/Admin/AdminStudents";

import StudentCourse from "./pages/Student/StudentCourse";
import StudentMarks from "./pages/Student/StudentMarks";
import StudentClasslist from "./pages/Student/StudentClasslist";
import StudentStream from "./pages/Student/StudentStream";

import CourseOutline from "./pages/Student/CourseOutline"; // If you still want this for something else
import CourseDashboard from "./pages/Teacher/CourseDashboard";
import OutlinePage from "./pages/Teacher/OutlinePage";
import CourseSelection from "./pages/CourseSelection";

import AssignmentsTab from "./pages/Teacher/AssignmentsTab";
import AnnouncementsTab from "./pages/Teacher/AnnouncementsTab";

// PrimeReact styles
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export default function App() {
  const { user, firebaseUser, logout } = useAuth();
  const location = useLocation();
  const [isAdmin, setAdmin] = useState(false);
  const hideNavbar = ["/", "/signup"].includes(location.pathname);

  useEffect(() => {
    async function checkClaims() {
      if (firebaseUser) {
        const tokenResult = await getIdTokenResult(firebaseUser);
        setAdmin(!!tokenResult.claims.admin);
      } else {
        setAdmin(false);
      }
    }
    checkClaims();
  }, [user, firebaseUser]);

  if (user && location.pathname === "/") {
    if (isAdmin) return <Navigate to="/dashboard/admin" replace />;
    if (user.role === "teacher") return <Navigate to="/courses" replace />;
    if (user.role === "student") return <Navigate to="/dashboard/student" replace />;
  }

  return (
    <>
      {!hideNavbar &&
        (isAdmin ? (
          <AdminNavbar user={user} onLogout={logout} />
        ) : user?.role === "teacher" ? (
          <TeacherNavbar user={user} onLogout={logout} />
        ) : user?.role === "student" ? (
          <StudentNavbar user={user} onLogout={logout} />
        ) : null)}

      <Box p={!hideNavbar ? 3 : 0}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Dashboards */}
          <Route
            path="/courses"
            element={
              <PrivateRoute>
                <TeacherDashboard user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/student"
            element={
              <PrivateRoute>
                <StudentDashboard user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <PrivateRoute>
                <AdminDashboard user={user} />
              </PrivateRoute>
            }
          />

          {/* Student Course with nested tabs */}
          <Route
            path="/course/:courseId/details"
            element={
              <PrivateRoute>
                <StudentCourse user={user} />
              </PrivateRoute>
            }
          >
            <Route index element={<StudentStream user={user} />} />
            <Route path="stream" element={<StudentStream user={user} />} />
            <Route path="people" element={<StudentClasslist user={user} />} />
            <Route path="marks" element={<StudentMarks user={user} />} />
          </Route>

          {/* Other student pages */}
          <Route
            path="/pathways"
            element={
              <PrivateRoute>
                <Pathways user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <PrivateRoute>
                <Upload user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/course-selection"
            element={
              <PrivateRoute>
                <CourseSelection user={user} />
              </PrivateRoute>
            }
          />

          {/* Teacher-only */}
          <Route
            path="/attendance"
            element={
              <PrivateRoute>
                <TeacherAttendance user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit/:courseId"
            element={
              <PrivateRoute>
                <EditOutline user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/course/:courseId/*"
            element={
              <PrivateRoute>
                <CourseDashboard user={user} />
              </PrivateRoute>
            }
          >
            <Route path="assignments" element={<AssignmentsTab user={user} />} />
            <Route index element={<AnnouncementsTab />} />
          </Route>
          <Route
            path="/outline"
            element={
              <PrivateRoute>
                <OutlinePage user={user} />
              </PrivateRoute>
            }
          />

          {/* Admin-only */}
          <Route
            path="/admin/courses"
            element={
              <PrivateRoute>
                <AdminCourses user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/teachers"
            element={
              <PrivateRoute>
                <AdminTeachers user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <PrivateRoute>
                <AdminStudents user={user} />
              </PrivateRoute>
            }
          />

          {/* Optional fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </>
  );
}
