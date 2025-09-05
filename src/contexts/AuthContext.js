import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  useEffect(() => {
    // Set base URL
    axios.defaults.baseURL = 'https://ezpzshare-backend-production.up.railway.app';
    
    // Set auth token if it exists
    const token = localStorage.getItem('ezpzshare_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Check for existing user on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('ezpzshare_token');
      const savedUser = localStorage.getItem('ezpzshare_user');
      
      if (token && savedUser) {
        try {
          // Set the token for this request
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // Verify token is still valid
          await axios.get('/api/folders');
          setUser(JSON.parse(savedUser));
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('ezpzshare_token');
          localStorage.removeItem('ezpzshare_user');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('ezpzshare_token', token);
      localStorage.setItem('ezpzshare_user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      toast.success(`Welcome back, ${userData.name}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post('/api/auth/register', { name, email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('ezpzshare_token', token);
      localStorage.setItem('ezpzshare_user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      toast.success(`Welcome to EzPzShare, ${userData.name}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('ezpzshare_token');
    localStorage.removeItem('ezpzshare_user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};