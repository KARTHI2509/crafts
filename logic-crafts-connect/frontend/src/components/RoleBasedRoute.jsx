import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleBasedRoute Component
 * Checks if authenticated user has the required role
 * Supports: 'artisan', 'buyer', 'admin'
 * Shows access denied message or redirects if role doesn't match
 */
const RoleBasedRoute = ({ children, role, showAccessDenied = true }) => {
  const { user, hasRole, loading } = useAuth();

  // Show loading spinner while checking auth
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
        <p style={{ color: 'var(--muted)' }}>Verifying access...</p>
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has the required role
  // Support both exact role match and 'user' legacy role for backwards compatibility
  const userHasRole = hasRole(role) || (user.role === 'user' && (role === 'artisan' || role === 'buyer'));
  
  if (!userHasRole) {
    // Show access denied message or redirect based on preference
    if (showAccessDenied) {
      return (
        <div className="container" style={{ padding: '64px 16px', textAlign: 'center' }}>
          <div className="access-denied" style={{
            background: 'var(--card-bg)',
            padding: '48px 32px',
            borderRadius: '12px',
            boxShadow: 'var(--shadow)',
            maxWidth: '600px',
            margin: '0 auto',
            border: '2px solid var(--danger)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>🚫</div>
            <h2 style={{ color: 'var(--danger)', marginBottom: '16px', fontSize: '28px' }}>
              Access Denied
            </h2>
            <p style={{ color: 'var(--muted)', marginBottom: '24px', fontSize: '16px' }}>
              You don't have permission to access this page.
            </p>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>
              <strong>Your role:</strong> {user.role}<br />
              <strong>Required role:</strong> {role}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                className="btn secondary" 
                onClick={() => window.history.back()}
              >
                Go Back
              </button>
              <button 
                className="btn" 
                onClick={() => window.location.href = '/'}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      // Redirect to home page
      return <Navigate to="/" replace />;
    }
  }

  // User has the required role, render the protected content
  return children;
};

export default RoleBasedRoute;
