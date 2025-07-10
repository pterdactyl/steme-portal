// src/Auth/privateRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User is logged in but role not permitted
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
