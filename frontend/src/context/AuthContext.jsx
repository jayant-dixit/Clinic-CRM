import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('careflow_token') || localStorage.getItem('careslot_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('careflow_token') || localStorage.getItem('careslot_token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          if (res.success) {
            setUser(res.user);
            setClinic(res.clinic);
          } else {
            logout();
          }
        } catch (err) {
          console.error('[Auth] Failed to restore session:', err.message);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.login({ email, password });
      if (res.success && res.token) {
        localStorage.setItem('careflow_token', res.token);
        setToken(res.token);
        setUser(res.user);
        setClinic(res.clinic);
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        return res;
      }
    } catch (error) {
      showToast(error.message || 'Login failed. Please check your credentials.', 'error');
      throw error;
    }
  };

  const demoLogin = async (roleType = 'CLINIC_ADMIN') => {
    let email = 'clinic@smilecare.com';
    let password = 'Password123';

    if (roleType === 'STAFF') {
      email = 'receptionist@smilecare.com';
    } else if (roleType === 'SUPER_ADMIN') {
      email = 'admin@careflow.com';
    }

    try {
      return await login(email, password);
    } catch (err) {
      if (roleType === 'SUPER_ADMIN') {
        // Fallback for previous seed database with careslot domain
        return await login('admin@careslot.com', password);
      }
      throw err;
    }
  };

  const register = async (payload) => {
    try {
      const res = await api.register(payload);
      if (res.success && res.token) {
        localStorage.setItem('careflow_token', res.token);
        setToken(res.token);
        setUser(res.user);
        setClinic(res.clinic);
        showToast('Clinic registered successfully!', 'success');
        return res;
      }
    } catch (error) {
      showToast(error.message || 'Registration failed.', 'error');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('careflow_token');
    localStorage.removeItem('careslot_token');
    setToken(null);
    setUser(null);
    setClinic(null);
  };

  const isRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        clinic,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        demoLogin,
        register,
        logout,
        isRole,
        setClinic,
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
