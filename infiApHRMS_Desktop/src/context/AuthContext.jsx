/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';
import apiClient from '../services/apiClient';
import { tokenStore } from '../services/tokenStore';

const AuthContext = createContext();

const normalizeRole = (role) => {
  const value = (role || '').toString().trim().toLowerCase();

  if (value === 'main admin') return 'Main Admin';
  if (value === 'admin') return 'Admin';
  if (value === 'hr') return 'HR';
  if (value === 'employee') return 'Employee';

  return role || null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pending 2FA challenge state
  const [pending2FA, setPending2FA] = useState(null);

  // ── Persist auth state ──────────────────────────────────────────────────
  const storeAuth = (authToken, userData) => {
    const normalizedUser = userData || {};
    const normalizedRole = normalizeRole(normalizedUser.role);
    // Store token in memory store as fallback when cookies don't work
    tokenStore.setToken(authToken);
    tokenStore.setRole(normalizedRole);
    setToken(authToken);
    setRole(normalizedRole);
    setUser({ ...normalizedUser, role: normalizedRole });
  };

  const clearAuth = () => {
    // Clear token store and state
    tokenStore.clearToken();
    setToken(null);
    setRole(null);
    setUser(null);
    setPending2FA(null);
  };

  // ── Hydrate on mount — check stored token ───────────────────────────────
  const hydrate = useCallback(async () => {
    try {
      // Restore token from sessionStorage if available (survives page refresh)
      const storedToken = tokenStore.getToken();
      if (storedToken) {
        setToken(storedToken);
      }

      // Only call /auth/me if we have a token to validate
      // This prevents auto-logout when session exists in sessionStorage
      if (!storedToken) {
        // No stored token - need to authenticate fresh
        setLoading(false);
        return;
      }

      // Call /auth/me to get fresh data from database
      const res = await apiClient.get('/auth/me');
      // Backend returns { message, user }
      const userData = res.data?.user || res.data?.data;
      if (userData) {
        const normalizedRole = normalizeRole(userData.role);
        setUser({ ...userData, role: normalizedRole });
        setRole(normalizedRole);
      }
    } catch (err) {
      // Only clear auth on 401 if there's NO stored token
      // If we have a stored token, keep the user logged in despite API error
      const is401 = err.response?.status === 401;
      if (is401 && !storedToken) {
        clearAuth();
      }
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array - run only once on mount

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // ── Login → triggers 2FA ────────────────────────────────────────────────
  const login = async (email, password, role) => {
    try {
      setError(null);
      setLoading(true);
      const data = await authService.login(email, password, role);

      if (data.require2FA || data.requires2FA) {
        setPending2FA({
          userId: data.userId,
          role: normalizeRole(data.role),
          devOtp: data.devOtp,
        });
        return { success: true, requires2FA: true, devOtp: data.devOtp };
      }

      if (data.token) {
        storeAuth(data.token, data.user || data);
        return { success: true, requires2FA: false, role: normalizeRole(data.role || data.user?.role) };
      }

      return { success: false, error: 'Unexpected response' };
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Login failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ── Verify 2FA → get token ──────────────────────────────────────────────
  const verify2FA = async (otp) => {
    if (!pending2FA?.userId) {
      return { success: false, error: 'No pending 2FA challenge' };
    }

    try {
      setError(null);
      setLoading(true);
      const data = await authService.verify2FA(pending2FA.userId, otp);

      if (data.token) {
        storeAuth(data.token, data.user || data);
        setPending2FA(null);
        return { success: true, role: normalizeRole(data.role || data.user?.role) };
      }

      return { success: false, error: 'Verification failed' };
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'OTP verification failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };


  // ── Register ────────────────────────────────────────────────────────────
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const res = await apiClient.post('/auth/register', userData);
      if (res.data?.token) {
        storeAuth(res.data.token, res.data.user || res.data.data);
        return { success: true, data: res.data.user || res.data.data };
      }
      return { success: true, data: res.data };
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ── Get profile ─────────────────────────────────────────────────────────
  const fetchProfile = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      const userData = res.data?.user || res.data?.data;
      if (userData) {
        const normalizedRole = normalizeRole(userData.role);
        setUser({ ...userData, role: normalizedRole });
        setRole(normalizedRole);
      }
      return userData;
    } catch {
      return null;
    }
  };

  // ── User management (admin) ─────────────────────────────────────────────
  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/auth/users');
      setLoading(false);
      return { success: true, data: res.data.data };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.response?.data?.error || 'Failed to fetch users', data: [] };
    }
  };

  const deleteUser = async (id) => {
    try {
      await apiClient.delete(`/auth/users/${id}`);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to delete user' };
    }
  };

  // ── Admin User Creation ───────────────────────────────────────────────
  const createAdmin = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const res = await apiClient.post('/main-admin-dashboard/admin', userData);
      return { success: true, data: res.data?.user || res.data };
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Failed to create admin account';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const createHR = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const res = await apiClient.post('/admin-dashboard/hr', userData);
      return { success: true, data: res.data?.user || res.data };
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Failed to create HR account';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const res = await apiClient.post('/admin-dashboard/employees', userData);
      return { success: true, data: res.data?.user || res.data };
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Failed to create employee account';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // ── Logout ──────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      // Call backend logout to clear cookies
      await apiClient.post('/auth/logout');
    } catch (err) {
      // Silent logout error - user is clearing anyway
    } finally {
      clearAuth();
    }
  };

  // Legacy compat — switchRole for role-based nav
  const switchRole = (newRole) => {
    const normalizedRole = normalizeRole(newRole);
    setRole(normalizedRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        loading,
        error,
        pending2FA,
        isAuthenticated: !!user,  // true if user is hydrated (cookie OR token auth)
        login,
        verify2FA,
        register,
        logout,
        switchRole,
        fetchProfile,
        fetchAllUsers,
        deleteUser,
        createAdmin,
        createHR,
        createEmployee,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
