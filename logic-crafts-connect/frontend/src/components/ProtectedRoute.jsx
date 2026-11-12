import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * Checks if user is authenticated before rendering the route
 * Redirects to /login if not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="loading-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div className="spinner" style={{
          border: '4px solid var(--bg-light)',
          borderTop: '4px solid var(--primary)',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: 'var(--muted)' }}>Loading...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected content
  return children;
};

export default ProtectedRoute;
