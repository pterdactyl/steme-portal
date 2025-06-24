import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherAttendance from "./pages/TeacherAttendance";
import ProfilePage from "./pages/ProfilePage";
import { Box } from "@mui/material";

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogin = ({ email, role, name }) => {
    const photoURL = "/default-pfp.png"; // You can replace this with uploaded photo logic
    const userData = { email, role, name, photoURL };
    setUser(userData);

    if (role === "teacher") {
      navigate("/dashboard/teacher");
    } else {
      navigate("/dashboard/student");
    }
  };

  return (
    <>
      <Navbar user={user} onLogout={() => setUser(null)} />
      <Box p={3}>
        <Routes>
          <Route path="/" element={<Login onLogin={handleLogin} />} />
          <Route path="/dashboard/teacher" element={<TeacherDashboard user={user} />} />
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/attendance" element={<TeacherAttendance />} />
          <Route path="/profile" element={<ProfilePage user={user} />} />
        </Routes>
      </Box>
    </>
  );
}

export default App;
