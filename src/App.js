import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import { Box } from "@mui/material";
import EditOutline from "./pages/EditOutline";

import 'primereact/resources/themes/lara-light-indigo/theme.css'; // Theme
import 'primereact/resources/primereact.min.css'; // Core CSS
import 'primeicons/primeicons.css'; // Icons



function App() {
  const navigate = useNavigate();

  const handleLogin = ({ email, role }) => {
    if (role === "teacher") {
      navigate("/dashboard/teacher");
    } else {
      navigate("/dashboard/student");
    }
  };

  return (
    <>
      <Navbar />
      <Box p={3}>
        <Routes>
          <Route path="/" element={<Login onLogin={handleLogin} />} />
          <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/edit" element={<EditOutline />} />
        </Routes>
      </Box>
    </>
  );
}

export default App;