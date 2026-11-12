/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Call actual API
      const response = await authAPI.login(email, password);
      
      if (response.success && response.data) {
        const { user: userData, token: authToken } = response.data;

        // Store in localStorage
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('role', userData.role);

        // Update state
        setToken(authToken);
        setUser(userData);

        // Role-based redirect
        redirectBasedOnRole(userData.role);

        return { success: true, user: userData };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      
      // Call actual API to store user in database
      const response = await authAPI.register(userData);
      
      if (response.success && response.data) {
        // Registration successful - redirect to login page
        // DO NOT auto-login, make user login with credentials
        navigate('/login');
        
        return { 
          success: true, 
          message: 'Registration successful! Please login with your credentials.',
          user: response.data.user 
        };
      } else {
        return { success: false, message: response.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: error.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  // Get user role
  const getUserRole = () => {
    return user?.role || null;
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!(token && user);
  };

  // Check if user has specific role
  const hasRole = (requiredRole) => {
    return user?.role === requiredRole;
  };

  // Role-based redirect helper
  const redirectBasedOnRole = (role) => {
    switch (role) {
      case 'admin':
        navigate('/admin-dashboard');
        break;
      case 'buyer':
        navigate('/buyer-dashboard');
        break;
      case 'artisan':
        navigate('/artisan-dashboard');
        break;
      default:
        navigate('/');
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    getUserRole,
    isAuthenticated,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
