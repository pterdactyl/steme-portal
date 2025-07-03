// src/App.js
import Pathways from './pages/pathways'
import Upload from "./pages/upload"
import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./Auth/login";
import Signup from "./Auth/signup";
import Navbar from "./components/Navbar";
import Box from '@mui/material/Box';

import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherAttendance from "./pages/TeacherAttendance";
import ProfilePage from "./pages/ProfilePage";
import EditOutline from "./pages/EditOutline";
import AdminNavbar from './components/AdminNavbar'
import { getIdTokenResult } from "firebase/auth";
import AdminCourses from './pages/AdminCourses';
import AdminTeachers from './pages/AdminTeachers';
import AdminStudents from './pages/AdminStudents';
import TeacherGrades from "./pages/TeacherGrades";
import CourseOutline from "./pages/CourseOutline"; 

import { useAuth } from "./Auth/auth";
import PrivateRoute from "./Auth/privateRoute";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import Course from './pages/Course'




export default function App() {
  const { user, firebaseUser, logout } = useAuth();
  const location = useLocation();
  const [isAdmin, setAdmin] = useState(false);
  const hideNavbar = ["/", "/signup"].includes(location.pathname);

  useEffect(() => {
    const checkClaims = async () => {
      console.log("user from useAuth():", user);
      if (firebaseUser) {
        const tokenResult = await getIdTokenResult(firebaseUser);
        console.log("App.js Admin:", tokenResult.claims.admin);
        setAdmin(tokenResult.claims.admin);
      }
      else{
        setAdmin(false);
      }
    }
    checkClaims();
  }, [user])
  
  
 
  return (
    <>
      {!hideNavbar && (
        isAdmin ? (
          <AdminNavbar user={user} onLogout={logout} />
        ) : user?.role === 'teacher' ? (
          <Navbar user={user} onLogout={logout} />
        ) : user?.role === 'student' ? (
          <Navbar user={user} onLogout={logout} />
        ) : null
      )}
      <Box p={!hideNavbar ? 3 : 0}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected dashboards */}
          <Route
            path="/dashboard/teacher"
            element={
              <PrivateRoute>
                <TeacherDashboard user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/course"
            element={
              <PrivateRoute>
                <Course user={user} />
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
          {/* Other protected routes */}
          <Route
            path="/dashboard/admin"
            element={
              <PrivateRoute>
                <AdminDashboard user={user} />
              </PrivateRoute>
            }
          />
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
                <Upload user={user}/>
              </PrivateRoute>
            }
          />

          <Route
            path="/edit"
            element={
              <PrivateRoute>
                <EditOutline user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/grades/manage"
            element={
              <PrivateRoute>
                <TeacherGrades user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/course/:courseId"
            element={
              <PrivateRoute>
                <CourseOutline />
              </PrivateRoute>
            }
          />
          <Route path="/admin/courses" 
            element={
              <PrivateRoute>
                <AdminCourses user={user}/>
                </PrivateRoute>
              }
          />
          <Route path="/admin/teachers" 
            element={
              <PrivateRoute>
                <AdminTeachers user={user}/>
                </PrivateRoute>
              }
          />
          <Route path="/admin/students" 
            element={
              <PrivateRoute>
                <AdminStudents user={user}/>
                </PrivateRoute>
              }
          />
        </Routes>
      </Box>
    </>
  );
}
