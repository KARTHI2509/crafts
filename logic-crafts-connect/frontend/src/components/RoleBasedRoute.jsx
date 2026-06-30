import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * RoleBasedRoute Component
 *
 * Purpose:
 * - Protects routes based on user role
 * - Allows access only if the logged-in user has the required role
 * - Supports roles: artisan, buyer, admin
 * - Can show "Access Denied" page or redirect
 */
const RoleBasedRoute = ({
  children,
  role,
  showAccessDenied = true,
}) => {
  // Get user data, role checker, and loading state from AuthContext
  const { user, hasRole, loading } = useAuth();

  // -----------------------------------
  // Show loading while checking authentication
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
        {/* Spinner */}
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
        <p style={{ color: "var(--muted)" }}>Verifying access...</p>
      </div>
    );
  }

  // -----------------------------------
  // Redirect to login if no user found
  // -----------------------------------
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // -----------------------------------
  // Check if user has required role
  // Legacy support:
  // "user" role can act as artisan or buyer
  // -----------------------------------
  const userHasRole =
    hasRole(role) ||
    (user.role === "user" &&
      (role === "artisan" || role === "buyer"));

  // -----------------------------------
  // If user does not have permission
  // -----------------------------------
  if (!userHasRole) {
    // Show access denied page
    if (showAccessDenied) {
      return (
        <div
          className="container"
          style={{
            padding: "64px 16px",
            textAlign: "center",
          }}
        >
          <div
            className="access-denied"
            style={{
              background: "var(--card-bg)",
              padding: "48px 32px",
              borderRadius: "12px",
              boxShadow: "var(--shadow)",
              maxWidth: "600px",
              margin: "0 auto",
              border: "2px solid var(--danger)",
            }}
          >
            {/* Access Denied Icon */}
            <div
              style={{
                fontSize: "64px",
                marginBottom: "24px",
              }}
            >
              🚫
            </div>

            {/* Heading */}
            <h2
              style={{
                color: "var(--danger)",
                marginBottom: "16px",
                fontSize: "28px",
              }}
            >
              Access Denied
            </h2>

            {/* Message */}
            <p
              style={{
                color: "var(--muted)",
                marginBottom: "24px",
                fontSize: "16px",
              }}
            >
              You do not have permission to access this page.
            </p>

            {/* Role Details */}
            <p
              style={{
                color: "var(--muted)",
                fontSize: "14px",
                marginBottom: "24px",
              }}
            >
              <strong>Your role:</strong> {user.role}
              <br />
              <strong>Required role:</strong> {role}
            </p>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {/* Go Back Button */}
              <button
                className="btn secondary"
                onClick={() => window.history.back()}
              >
                Go Back
              </button>

              {/* Go Home Button */}
              <button
                className="btn"
                onClick={() => (window.location.href = "/")}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Redirect to home if access denied page is disabled
    return <Navigate to="/" replace />;
  }

  // -----------------------------------
  // User has required role → render page
  // -----------------------------------
  return children;
};

export default RoleBasedRoute;