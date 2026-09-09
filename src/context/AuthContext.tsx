import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types.ts';
import { api, getStoredToken } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, phone?: string, role?: UserRole) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  authModalOpen: boolean;
  authModalMode: 'login' | 'register';
  authModalRole: UserRole;
  openAuthModal: (mode?: 'login' | 'register', defaultRole?: UserRole) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authModalRole, setAuthModalRole] = useState<UserRole>('CUSTOMER');

  const refreshUser = async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.getCurrentUser();
      setUser(res.user);
    } catch {
      api.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setUser(res.user);
    return res.user;
  };

  const register = async (name: string, email: string, password: string, phone?: string, role?: UserRole) => {
    const res = await api.register(name, email, password, phone, role);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login', defaultRole: UserRole = 'CUSTOMER') => {
    setAuthModalMode(mode);
    setAuthModalRole(defaultRole);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin: user?.role === 'ADMIN',
        isCustomer: !!user,
        login,
        register,
        logout,
        refreshUser,
        authModalOpen,
        authModalMode,
        authModalRole,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
