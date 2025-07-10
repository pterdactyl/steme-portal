// src/Auth/privateRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./auth";

export default function PrivateRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    // Not logged in — redirect to login page
    return <Navigate to="/" replace />;
  }

  // Logged in — render children components
  return children;
}