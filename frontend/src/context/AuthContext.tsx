import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User, AuthResponse } from '../types';
import { authService, LoginRequest, RegisterRequest } from '../services/authService';
import { setAuthToken, getAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  roles: string[];
  isStudent: boolean;
  isInstructor: boolean;
  isAdmin: boolean;
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  register: (data: RegisterRequest) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => getAuthToken());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session on mount (reads strictly from memory/sessionStorage, never localStorage)
  const refreshUser = useCallback(async () => {
    const currentToken = getAuthToken();
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch {
      // Token expired or invalid
      setAuthToken(null);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const authData = await authService.login(credentials);
      setToken(authData.token);
      setUser({
        id: authData.userId,
        email: authData.email,
        firstName: authData.firstName,
        lastName: authData.lastName,
        headline: authData.headline,
        profilePictureUrl: authData.profilePictureUrl,
        roles: authData.roles || [],
      });
      return authData;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const authData = await authService.register(data);
      setToken(authData.token);
      setUser({
        id: authData.userId,
        email: authData.email,
        firstName: authData.firstName,
        lastName: authData.lastName,
        headline: authData.headline,
        profilePictureUrl: authData.profilePictureUrl,
        roles: authData.roles || [],
      });
      return authData;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
  }, []);

  const roles = useMemo(() => user?.roles || [], [user]);
  const isStudent = useMemo(() => roles.includes('Student'), [roles]);
  const isInstructor = useMemo(() => roles.includes('Instructor'), [roles]);
  const isAdmin = useMemo(() => roles.includes('Admin'), [roles]);
  const isAuthenticated = useMemo(() => !!user && !!token, [user, token]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      isLoading,
      roles,
      isStudent,
      isInstructor,
      isAdmin,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, isAuthenticated, isLoading, roles, isStudent, isInstructor, isAdmin, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

