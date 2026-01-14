import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getUserData, setAuthData, clearAuthData } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const userData = getUserData();
    if (userData) {
      setUser(userData);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      // Transform credentials to match backend expectations (capital E in Email)
      const loginData = {
        Email: credentials.email || credentials.Email,
        Password: credentials.password || credentials.Password
      };
      
      const response = await api.login(loginData);
      
      if (response.success) {
        const { AccessToken, RefreshToken, LogInUser } = response.data;
        setAuthData(AccessToken, RefreshToken, LogInUser);
        setUser(LogInUser);
        setIsAuthenticated(true);
        return { success: true, user: LogInUser };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  // Register function
  const register = async (formData) => {
    try {
      const response = await api.register(formData);
      
      if (response.success) {
        return { success: true, message: 'Registration successful' };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: error.message || 'Registration failed' };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
