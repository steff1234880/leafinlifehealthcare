import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('leafinlife_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('leafinlife_user_token') || null;
  });

  const [loading, setLoading] = useState(true);

  // Validate or refresh current user profile on initial mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const savedToken = localStorage.getItem('leafinlife_user_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await apiClient.get('/auth/me');
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('leafinlife_user', JSON.stringify(data.user));
        }
      } catch (err) {
        // Only clear session if token is genuinely invalid or unauthorized (401 / 403)
        // If it's a network glitch, server offline, timeout, or 500 error, preserve the local session
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.warn('Session expired or unauthorized, clearing credentials:', err.response?.data?.message);
          setUser(null);
          setToken(null);
          localStorage.removeItem('leafinlife_user_token');
          localStorage.removeItem('leafinlife_user');
        } else {
          console.warn('Network or server error during session validation; keeping existing offline session:', err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Register
  const register = async ({ name, email, phone, password }) => {
    const { data } = await apiClient.post('/auth/register', {
      name,
      email,
      phone,
      password,
    });

    if (data.success && data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('leafinlife_user_token', data.token);
      localStorage.setItem('leafinlife_user', JSON.stringify(data.user));
    }
    return data;
  };

  // Login
  const login = async ({ email, password }) => {
    const { data } = await apiClient.post('/auth/login', {
      email,
      password,
    });

    if (data.success && data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('leafinlife_user_token', data.token);
      localStorage.setItem('leafinlife_user', JSON.stringify(data.user));

      // If user is also admin, store admin session for seamless dashboard navigation
      if (data.user?.role === 'admin') {
        localStorage.setItem('leafinlife_admin_token', data.token);
        localStorage.setItem('leafinlife_admin_user', JSON.stringify(data.user));
      }
    }
    return data;
  };

  // Update Profile
  const updateProfile = async ({ name, phone }) => {
    const { data } = await apiClient.put('/auth/profile', { name, phone });
    if (data.success && data.user) {
      setUser(data.user);
      localStorage.setItem('leafinlife_user', JSON.stringify(data.user));
    }
    return data;
  };

  // Logout
  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('leafinlife_user_token');
      localStorage.removeItem('leafinlife_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isAdmin: user?.role === 'admin',
        loading,
        register,
        login,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

