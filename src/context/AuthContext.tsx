import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { AuthUser, UserRole } from '../types/ldap';
import { api, getStoredToken } from '../services/api';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  role: UserRole;
  isGlobalAdmin: boolean;
  isGlobalReader: boolean;
  isDemoUser: boolean;
  canWrite: boolean;
  login: (u: string, p: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await api.getCurrentUser();
      if (res.authenticated && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If token exists, verify immediately
    if (getStoredToken()) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.login(username, password);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.logout();
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    await checkAuth();
  };

  // Derive roles dynamically from user groups
  const { role, isGlobalAdmin, isGlobalReader, isDemoUser, canWrite } = useMemo(() => {
    if (!user) {
      return {
        role: 'USER' as UserRole,
        isGlobalAdmin: false,
        isGlobalReader: false,
        isDemoUser: false,
        canWrite: false,
      };
    }

    const groups = user.groups || [];
    const isGlobalAdmin = groups.includes('GLOBAL_ADMIN');
    const isGlobalReader = groups.includes('GLOBAL_READER');
    const isDemoUser = groups.includes('DEMO_USERS');

    let resolvedRole: UserRole = 'USER';
    if (isGlobalAdmin) resolvedRole = 'GLOBAL_ADMIN';
    else if (isGlobalReader) resolvedRole = 'GLOBAL_READER';
    else if (isDemoUser) resolvedRole = 'DEMO_USERS';

    return {
      role: resolvedRole,
      isGlobalAdmin,
      isGlobalReader,
      isDemoUser,
      canWrite: isGlobalAdmin,
    };
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        role,
        isGlobalAdmin,
        isGlobalReader,
        isDemoUser,
        canWrite,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
