import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  authService,
  type AuthSessionUser,
  type UserRole,
  type LoginResult,
  type RegisterData,
  type RegisterResult,
} from '../services/authService';

export type { UserRole, AuthSessionUser, LoginResult, RegisterData, RegisterResult };

export interface AuthContextType {
  user: AuthSessionUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoggingOut: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<LoginResult>;
  register: (data: RegisterData) => Promise<RegisterResult>;
  logout: (redirectTo?: string) => void;
  updateUser: (updated: Partial<AuthSessionUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const [user, setUser] = useState<AuthSessionUser | null>(() => {
    return authService.getSession();
  });

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(
    (redirectTo: string = '/signin') => {
      // 1. Mark logging-out active to prevent ProtectedRoute from redirecting to sign-in
      setIsLoggingOut(true);

      // 2. Clear only authentication tokens and user session from storage (localStorage & sessionStorage)
      authService.clearSession();

      // 3. Clear authenticated user and role from React memory
      setUser(null);

      // 4. Navigate directly to destination (default: "/signin")
      navigate(redirectTo, { replace: true });

      // 5. Reset flag after route transition completes
      setTimeout(() => {
        setIsLoggingOut(false);
      }, 150);
    },
    [navigate]
  );

  // Listen for global auth expiration (401/403) from api.ts
  React.useEffect(() => {
    const handleAuthExpired = () => {
      logout('/signin');
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, [logout]);

  const login = useCallback(
    async (email: string, password: string, rememberMe: boolean = true): Promise<LoginResult> => {
      const result = await authService.login(email, password);
      if (result.success && result.user) {
        setUser(result.user);
        authService.saveSession(result.user, rememberMe);
      }
      return result;
    },
    []
  );

  const register = useCallback(
    async (data: RegisterData): Promise<RegisterResult> => {
      return authService.register(data);
    },
    []
  );

  const updateUser = useCallback((updated: Partial<AuthSessionUser>) => {
    const updatedUser = authService.updateUser(updated);
    if (updatedUser) {
      setUser(updatedUser);
    }
  }, []);

  const value: AuthContextType = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    isLoggingOut,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
