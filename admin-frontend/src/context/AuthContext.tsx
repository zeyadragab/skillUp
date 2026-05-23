import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../services/api';
import type { Admin, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateAdmin: (admin: Admin) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    admin: null,
    token: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminStr = localStorage.getItem('admin');

    if (token && adminStr) {
      try {
        const admin = JSON.parse(adminStr);
        setState({
          admin,
          token,
          isAuthenticated: true,
          loading: false,
        });
      } catch {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        setState(prev => ({ ...prev, loading: false }));
      }
    } else {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      const { token, admin } = response.data.data;

      localStorage.setItem('adminToken', token);
      localStorage.setItem('admin', JSON.stringify(admin));

      setState({
        admin,
        token,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    setState({
      admin: null,
      token: null,
      isAuthenticated: false,
      loading: false,
    });
  };

  const updateAdmin = (admin: Admin) => {
    localStorage.setItem('admin', JSON.stringify(admin));
    setState(prev => ({ ...prev, admin }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
