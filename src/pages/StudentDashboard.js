import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  return (
    <div>
      <Typography variant="h4">🎓 Welcome to the Student Dashboard!</Typography>
      <button onClick={() => navigate("/upload")}>
        Go to Dropbox
      </button>
    </div>
  )

}