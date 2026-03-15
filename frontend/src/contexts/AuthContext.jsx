import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

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
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set default headers
  useEffect(() => {
    if (token) {
      authService.setToken(token);
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Failed to load current user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);

      if (response.data.access_token) {
        const { access_token, user } = response.data;
        setToken(access_token);
        setUser(user);
        localStorage.setItem('token', access_token);
        authService.setToken(access_token);
        return { success: true };
      }
      return { success: false, error: 'No access token received' };
    } catch (error) {
      const message = error.response?.data?.detail || error.message || 'Login failed';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    authService.setToken(null);
  };

  const register = async (username, email, password) => {
    try {
      const response = await authService.register(username, email, password);

      if (response.data.success) {
        return { success: true };
      }
      return { success: false, error: 'Registration was not successful' };
    } catch (error) {
      const message = error.response?.data?.detail || error.message || 'Registration failed';
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
