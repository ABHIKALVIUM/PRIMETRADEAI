import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initializeAuth = useCallback(async (authToken) => {
    if (!authToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const result = await res.json();

      if (res.ok && result.success) {
        setUser(result.data.user);
        setError(null);
      } else {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Session pre-load connection error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth(token);
  }, [token, initializeAuth]);

  const register = async (name, email, password, role = 'user') => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, role })
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Registration failed');
      }

      localStorage.setItem('token', result.token);
      setToken(result.token);
      setUser(result.data.user);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Login failed');
      }

      localStorage.setItem('token', result.token);
      setToken(result.token);
      setUser(result.data.user);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    setError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be utilized strictly inside an AuthProvider wrapper.');
  }
  return context;
};