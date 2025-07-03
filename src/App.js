// src/App.js
import Pathways from './pages/pathways'
import Upload from "./pages/upload"
import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./Auth/login";
import Signup from "./Auth/signup";
import Navbar from "./components/Navbar";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherAttendance from "./pages/TeacherAttendance";
import ProfilePage from "./pages/ProfilePage";
import { Box } from "@mui/material";
import { useAuth } from './Auth/auth';
import PrivateRoute from './Auth/privateRoute';
import EditOutline from "./pages/EditOutline";


import 'primereact/resources/themes/lara-light-indigo/theme.css'; // Theme
import 'primereact/resources/primereact.min.css'; // Core CSS
import 'primeicons/primeicons.css'; // Icons

export default function App() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const hideNavbar = ["/", "/signup"].includes(location.pathname);


  return (
    <>
      {!hideNavbar && <Navbar user={user} onLogout={logout} />}
      <Box p={!hideNavbar ? 3 : 0}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

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
                <Pathways user={user}/>
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

          <Route path="/edit" 
            element={
              <PrivateRoute>
                <EditOutline user={user}/>
                </PrivateRoute>
              }
          />
        </Routes>
      </Box>
    </>
  );
}
