import Pathways from './pages/Student/pathways'
import Upload from "./pages/Student/upload"
import React, { useState, useEffect, useContext } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import Login from "./Auth/login";
import { useMsal } from "@azure/msal-react";
import { AuthContext } from "./Auth/AuthContext";

import StudentNavbar from "./components/StudentNavbar";
import TeacherNavbar from "./components/TeacherNavbar";
import AdminNavbar from './components/AdminNavbar';

import Box from '@mui/material/Box';

import TeacherDashboard from "./pages/Teacher/TeacherDashboard";
import StudentDashboard from "./pages/Student/StudentDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import TeacherAttendance from "./pages/Teacher/TeacherAttendance";
import ProfilePage from "./pages/ProfilePage";

import PrivateRoute from './Auth/privateRoute';
import EditOutline from "./pages/Teacher/EditOutline";
import ViewOutline from "./pages//Teacher/ViewOutline";
import OutlineHistory from './pages/Teacher/OutlineHistory'

import AdminCourses from './pages/Admin/AdminCourses';
import AdminTeachers from './pages/Admin/AdminTeachers';
import AdminStudents from './pages/Admin/AdminStudents';
import CourseOutline from "./pages/Student/CourseOutline"; 
import CourseDashboard from "./pages/Teacher/CourseDashboard";
import OutlinePage from "./pages/Teacher/OutlinePage";
import StudentCourse from './pages/Student/StudentCourse'

import StudentMarks from './pages/Student/StudentMarks'
import StudentClasslist from './pages//Student/StudentClasslist'
import StudentStream from './pages/Student/StudentStream'
import AssignmentsTab from "./pages/Teacher/AssignmentsTab.js";
import AnnouncementsTab from "./pages/Teacher/AnnouncementsTab.js";
// import GradesTab from "./pages/GradesTab";
// import StudentsTab from "./pages/StudentsTab";
// import CourseOutlineTab from "./pages/CourseOutlineTab";



import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export default function App() {

  const { accounts } = useMsal();
  const { user, role, loading } = useContext(AuthContext);
  const location = useLocation();
  const [error, setError] = useState("");
  const hideNavbar = ["/"].includes(location.pathname);

  

  if (loading) return null;

  // Redirect on base route based on role
  if (user && location.pathname === "/") {
    if (role === "admin") return <Navigate to="/dashboard/admin" replace />;
    if (role === "teacher") return <Navigate to="/courses" replace />;
    if (role === "student") return <Navigate to="/dashboard/student" replace />;
  }

  return (
    <>
      {!hideNavbar && (
        role === "admin" ? (
          <AdminNavbar user={user} />
        ) : role === "teacher" ? (
          <TeacherNavbar user={user} />
        ) : role === "student" ? (
          <StudentNavbar user={user} />
        ) : null
      )}

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
          <Route
            path="/course/:courseId"
            element={
              <PrivateRoute>
                <StudentCourse user={user} />
              </PrivateRoute>
            }
          >
            <Route path="stream" element={<StudentStream user={user} />} />
            <Route path="people" element={<StudentClasslist user={user} />} />
            <Route path="marks" element={<StudentMarks user={user} />} />
          </Route>
          
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
            path="/attendance"
            element={
              <PrivateRoute>
                <TeacherAttendance user={user} />
              </PrivateRoute>
            }
          />
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
            path="/view/:courseId"
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

          {/* Distinct routes */}
          <Route
            path="/student/course/:courseId"
            element={
              <PrivateRoute>
                <CourseOutline />
              </PrivateRoute>
            }
          />

          {/* Nested routing for CourseDashboard with tabs */}
          <Route
            path="/dashboard/course/:courseId/*"
            element={
              <PrivateRoute>
                <CourseDashboard user={user} />
              </PrivateRoute>
            }
          >
            <Route path="assignments" element={<AssignmentsTab user={user}/>} />
            <Route index element={<AnnouncementsTab />} />
            {/* <Route path="grades" element={<GradesTab />} />
            <Route path="students" element={<StudentsTab />} />
            <Route path="outline" element={<CourseOutlineTab />} />  */}
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
                
        </Routes>
      </Box>
    </>
  );
}
