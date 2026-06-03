import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import { setAccessToken, setOnAuthFailure } from '@/api/client';
import { login as apiLogin, register as apiRegister, logout as apiLogout, refreshToken } from '@/api/auth.api';
import type { LoginRequest, RegisterRequest } from '@/types/auth.types';

interface AuthContextValue {
  username: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearAuth: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuth = useCallback(() => {
    setAccessToken(null);
    setUsername(null);
  }, []);

  useEffect(() => {
    setOnAuthFailure(clearAuth);
  }, [clearAuth]);

  useEffect(() => {
    let mounted = true;
    const tryRefresh = async () => {
      try {
        const data = await refreshToken();
        if (mounted) {
          setAccessToken(data.accessToken);
          setUsername(data.username);
        }
      } catch {
        if (mounted) {
          clearAuth();
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    tryRefresh();
    return () => {
      mounted = false;
    };
  }, [clearAuth]);

  const login = useCallback(async (data: LoginRequest) => {
    const response = await apiLogin(data);
    setAccessToken(response.accessToken);
    setUsername(response.username);
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const response = await apiRegister(data);
    setAccessToken(response.accessToken);
    setUsername(response.username);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  return (
    <AuthContext.Provider
      value={{
        username,
        isAuthenticated: !!username,
        isLoading,
        login,
        register,
        logout,
        clearAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
