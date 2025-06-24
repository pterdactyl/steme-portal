// src/App.js
import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./Auth/login";
import Signup from "./Auth/signup";
import Navbar from "./components/Navbar";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import { Box } from "@mui/material";
import { useAuth } from './Auth/auth';
import PrivateRoute from './Auth/privateRoute';


export default function App() {
  const { user } = useAuth();
  const location = useLocation();
  const hideNavbarPaths = ["/", "/signup"];

  const hideNavbar = hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
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
        </Routes>
      </Box>
    </>
  );
}