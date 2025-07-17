import React, { useContext } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";

import Login from "./Auth/login";
import { AuthContext } from "./Auth/AuthContext";

import StudentNavbar from "./components/StudentNavbar";
import TeacherNavbar from "./components/TeacherNavbar";
import AdminNavbar from "./components/AdminNavbar";

import Box from "@mui/material/Box";

import TeacherDashboard from "./pages/Teacher/TeacherDashboard";
import StudentDashboard from "./pages/Student/StudentDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ProfilePage from "./components/ProfilePage";

import PrivateRoute from "./Auth/privateRoute";
import EditOutline from "./pages/Teacher/EditOutline";
import ViewOutline from "./pages/Teacher/ViewOutline";
import OutlineHistory from "./pages/Teacher/OutlineHistory"; 

import AdminCourses from "./pages/Admin/AdminCourses";
import AdminTeachers from "./pages/Admin/AdminTeachers";
import AdminStudents from "./pages/Admin/AdminStudents";
import CourseDashboard from "./pages/Teacher/CourseDashboard";
import OutlinePage from "./pages/Teacher/OutlinePage";
import StudentCourse from "./pages/Student/StudentCourse";

import AssignmentsTab from "./pages/Teacher/AssignmentsTab.js";
import AnnouncementsTab from "./pages/Teacher/AnnouncementsTab.js";
import GradesTab from "./pages/Teacher/GradesTab";
import StudentsTab from "./pages/Teacher/StudentsTab";
import CourseOutlineTab from "./pages/Teacher/CourseOutlineTab";
import AttendanceTab from "./pages/Teacher/AttendanceTab"
import AttendanceHistory from "./pages/Teacher/AttendanceHistory.js";
import SubmissionsPage from './pages/Teacher/SubmissionsPage';

import Pathways from "./pages/Student/pathways";
import Upload from "./pages/Student/upload";
import CourseSelection from "./pages/Student/CourseSelection";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export default function App() {
  useMsal();
  const { user, role, loading } = useContext(AuthContext);
  const location = useLocation();
  const hideNavbar = ["/"].includes(location.pathname);

  if (loading) return null;

  if (user && location.pathname === "/") {
    if (role === "admin") return <Navigate to="/dashboard/admin" replace />;
    if (role === "teacher") return <Navigate to="/courses" replace />;
    if (role === "student") return <Navigate to="/dashboard/student" replace />;
  }

  return (
    <>
      {!hideNavbar &&
        (role === "admin" ? (
          <AdminNavbar user={user} />
        ) : role === "teacher" ? (
          <TeacherNavbar user={user} />
        ) : role === "student" ? (
          <StudentNavbar user={user} />
        ) : null)}

      <Box p={!hideNavbar ? 3 : 0}>
        <Routes>
          <Route path="/" element={<Login />} />

          {/* Dashboards */}
          <Route
            path="/courses"
            element={
              <PrivateRoute>
                <TeacherDashboard user={user} />
              </PrivateRoute>
            }
          />

          {/* Student Course Page with tabs */}
          <Route
            path="/course/:courseId"
            element={
              <PrivateRoute>
                <StudentCourse user={user} />
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

          {/* Other pages */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage user={user} />
              </PrivateRoute>
            }
          />
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
            path="/edit/:courseId"
            element={
              <PrivateRoute>
                <EditOutline user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/view/:courseCode"
            element={
              <PrivateRoute>
                <ViewOutline user={user} />
              </PrivateRoute>
            }
          />

          <Route
            path="/course/:courseId/history"
            element={
              <PrivateRoute>
                <OutlineHistory user={user} />
              </PrivateRoute>
            }
          />

          {/* Nested routing for Teacher's CourseDashboard with tabs */}
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
            <Route path="grades" element={<GradesTab />} />
            <Route path="students" element={<StudentsTab />} />
            <Route path="outline" element={<CourseOutlineTab />} />
            <Route path="attendance" element={<AttendanceTab/>}/>
            <Route path="attendance/:studentId/history" element={<AttendanceHistory />} />
            <Route path="assignment/:assignmentId/submissions" element={<SubmissionsPage />} />
          </Route> 
          

          <Route
            path="/outline"
            element={
              <PrivateRoute>
                <OutlinePage user={user} />
              </PrivateRoute>
            }
          />

          {/* Admin pages */}
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

          {/* Course selection */}
          <Route
            path="/course-selection"
            element={
              <PrivateRoute>
                <CourseSelection />
              </PrivateRoute>
            }
          />
        </Routes>
      </Box>
    </>
  );
}
