/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { storage } from "../utils/storage";
import { ROUTES } from "../utils/routes";

// Create Auth Context
export const AuthContext = createContext();

/**
 * Custom Hook for AuthContext
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};

/**
 * Auth Provider
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Restore session
  useEffect(() => {
    const storedToken = storage.getToken();
    const storedUser = storage.getUser();

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(storedUser);
      } catch (error) {
        console.error("Session restore failed:", error);
        storage.clearAll();
      }
    }

    setLoading(false);
  }, []);

  /**
   * Login
   */
  const login = async (email, password) => {
    try {
      setLoading(true);

      const response = await authAPI.login(email, password);
      const res = response.data || response;

      if (!res.success || !res.data) {
        return {
          success: false,
          message: res.message || "Login failed",
        };
      }

      const { user: userData, token: authToken } = res.data;

      // Save using storage utils
      storage.setToken(authToken);
      storage.setUser(userData);
      storage.setRole(userData.role);

      setUser(userData);
      setToken(authToken);

      redirectBasedOnRole(userData.role);

      return {
        success: true,
        user: userData,
      };
    } catch (error) {
      console.error("Login Error:", error);

      return {
        success: false,
          message:
            error.response?.data?.message || error.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register
   */
  const register = async (userData) => {
    try {
      setLoading(true);

      const response =
        await authAPI.register(userData);
        const res = response.data || response;

        if (!res.success) {
          return {
            success: false,
            message: res.message || "Registration failed",
          };
        }

        navigate(ROUTES.LOGIN);

        return {
          success: true,
          message: res.message || "Registration successful! Please login.",
        };
    } catch (error) {
      console.error(
        "Registration Error:",
        error
      );

      return {
        success: false,
          message:
            error.response?.data?.message || error.message || "Registration failed",
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout
   */
  const logout = () => {
    storage.clearAll();

    setUser(null);
    setToken(null);

    navigate(ROUTES.LOGIN);
  };

  /**
   * Check auth
   */
  const isAuthenticated = () => {
    return Boolean(user && token);
  };

  /**
   * Get role
   */
  const getUserRole = () => {
    return user?.role || null;
  };

  /**
   * Role checker
   */
  const hasRole = (requiredRole) => {
    return user?.role === requiredRole;
  };

  /**
   * Redirect by role
   */
  const redirectBasedOnRole = (role) => {
    switch (role) {
      case "admin":
        navigate(ROUTES.ADMIN_DASHBOARD);
        break;

      case "buyer":
        navigate(ROUTES.BUYER_DASHBOARD);
        break;

      case "artisan":
        navigate(ROUTES.ARTISAN_DASHBOARD);
        break;

      default:
        navigate(ROUTES.HOME);
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    isAuthenticated,
    getUserRole,
    hasRole,
    redirectBasedOnRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}