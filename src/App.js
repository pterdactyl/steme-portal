import Pathways from './pages/pathways'
import Upload from "./pages/upload"
import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Login from "./Auth/login";
import Signup from "./Auth/signup";
import StudentNavbar from "./components/StudentNavbar";
import TeacherNavbar from "./components/TeacherNavbar";
import AdminNavbar from './components/AdminNavbar';
import Box from '@mui/material/Box';

import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherAttendance from "./pages/TeacherAttendance";
import ProfilePage from "./pages/ProfilePage";
import EditOutline from "./pages/EditOutline";
import { getIdTokenResult } from "firebase/auth";
import AdminCourses from './pages/AdminCourses';
import AdminTeachers from './pages/AdminTeachers';
import AdminStudents from './pages/AdminStudents';
import CourseOutline from "./pages/CourseOutline"; 
import CourseDashboard from "./pages/CourseDashboard";
import OutlinePage from "./pages/OutlinePage";
import CoursePage from "./pages/coursePage.js";
import StudentCourse from './pages/StudentCourse'

import StudentMarks from './pages/StudentMarks'
import StudentClasslist from './pages/StudentClasslist'
import StudentStream from './pages/StudentStream'


import { useAuth } from "./Auth/auth";
import PrivateRoute from "./Auth/privateRoute";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export default function App() {
  const { user, firebaseUser, logout } = useAuth();
  const location = useLocation();
  const [isAdmin, setAdmin] = useState(false);
  const hideNavbar = ["/", "/signup"].includes(location.pathname);

  useEffect(() => {
    const checkClaims = async () => {
      if (firebaseUser) {
        const tokenResult = await getIdTokenResult(firebaseUser);
        setAdmin(tokenResult.claims.admin);
      } else {
        setAdmin(false);
      }
    };
    checkClaims();
  }, [user, firebaseUser]);

  if (user && location.pathname === "/") {
    if (isAdmin) {
      return <Navigate to="/dashboard/admin" replace />;
    } else if (user.role === "teacher") {
      return <Navigate to="/courses" replace />;
    } else if (user.role === "student") {
      return <Navigate to="/dashboard/student" replace />;
    }
  }

  return (
    <>
      {!hideNavbar && (
        isAdmin ? (
          <AdminNavbar user={user} onLogout={logout} />
        ) : user?.role === 'teacher' ? (
          <TeacherNavbar user={user} onLogout={logout} />
        ) : user?.role === 'student' ? (
          <StudentNavbar user={user} onLogout={logout} />
        ) : null
      )}
      
      <Box p={!hideNavbar ? 3 : 0}>
        <Routes>
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

          {/* ❗Distinct routes now */}
          <Route
            path="/course/:courseId"
            element={
              <PrivateRoute>
                <CourseOutline />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/course/:courseId"
            element={
              <PrivateRoute>
                <CourseDashboard user={user} />
              </PrivateRoute>
            }
          />
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

          <Route path="/course/:courseId"
           element={
            <PrivateRoute>
           <CoursePage user={user}/>
           </PrivateRoute>
           }
          />

        </Routes>
      </Box>
    </>
  );
}
