import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Box } from "@mui/material";

import Login from "./Auth/login";
import Signup from "./Auth/signup";
import Navbar from "./components/Navbar";

import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherAttendance from "./pages/TeacherAttendance";
import ProfilePage from "./pages/ProfilePage";
import Pathways from "./pages/pathways";
import EditOutline from "./pages/EditOutline";
import TeacherGrades from "./pages/TeacherGrades";
import CourseOutline from "./pages/CourseOutline"; 

import { useAuth } from "./Auth/auth";
import PrivateRoute from "./Auth/privateRoute";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export default function App() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const hideNavbar = ["/", "/signup"].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar user={user} onLogout={logout} />}
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
            path="/dashboard/student"
            element={
              <PrivateRoute>
                <StudentDashboard user={user} />
              </PrivateRoute>
            }
          />
          {/* Other protected routes */}
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
        </Routes>
      </Box>
    </>
  );
}
