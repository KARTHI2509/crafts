import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute Component
 *
 * Purpose:
 * - Protects routes from unauthorized access
 * - Checks if the user is logged in
 * - Shows loading state while auth is being verified
 * - Redirects to login page if not authenticated
 */
const ProtectedRoute = ({ children }) => {
  // Get authentication state from AuthContext
  const { isAuthenticated, loading } = useAuth();

  // Store current route location for redirect after login
  const location = useLocation();

  // -----------------------------------
  // Show loading spinner while checking authentication
  // -----------------------------------
  if (loading) {
    return (
      <div
        className="loading-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Loading Spinner */}
        <div
          className="spinner"
          style={{
            border: "4px solid var(--bg-light)",
            borderTop: "4px solid var(--primary)",
            borderRadius: "50%",
            width: "50px",
            height: "50px",
            animation: "spin 1s linear infinite",
          }}
        ></div>

        {/* Loading Text */}
        <p style={{ color: "var(--muted)" }}>Loading...</p>
      </div>
    );
  }

  // -----------------------------------
  // Redirect if user is not authenticated
  // -----------------------------------
  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }} // Save previous route
        replace
      />
    );
  }

  // -----------------------------------
  // User is authenticated → render protected page
  // -----------------------------------
  return children;
};

export default ProtectedRoute;