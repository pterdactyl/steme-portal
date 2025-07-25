import React from "react";
import { Modal, Box, Typography, Paper, Button, Divider } from "@mui/material";
import "./CourseDetailModal.css";

export default function CourseDetailModal({ open, onClose, course }) {
  if (!course) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          p: 3,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          maxHeight: "80vh",
          overflowY: "auto",
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          {course.title} ({course.code})
        </Typography>

        {course.description && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            {course.description}
          </Typography>
        )}

        <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
          {Array.isArray(course.units) && course.units.length > 0 && (
            <>
              <Typography variant="subtitle2" gutterBottom>
                Units
              </Typography>
              <ul style={{ paddingLeft: "1.25rem", marginTop: 0 }}>
                {course.units.map((unit, index) => (
                  <li key={index}>
                    {unit.title} – {unit.hours} hours
                  </li>
                ))}
              </ul>
              <Divider sx={{ my: 1 }} />
            </>
          )}

          {course.totalHours && (
            <Typography variant="body2">
              <strong>Total Hours:</strong> {course.totalHours}
            </Typography>
          )}

          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Prerequisite:</strong>{" "}
            {course.prerequisite && course.prerequisite !== "None"
              ? course.prerequisite
              : "None"}
          </Typography>
        </Paper>

        <Button variant="contained" color="primary" fullWidth onClick={onClose}>
          Close
        </Button>
      </Box>
    </Modal>
  );
}
