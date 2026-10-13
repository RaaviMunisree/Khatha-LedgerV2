import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { loginUser } from "../../features/auth/api/auth.api";

import type {
  AuthUser,
  LoginRequest,
} from "../../features/auth/types/auth.types";

import {
  clearAuth,
  getStoredUser,
  getToken,
  saveAuth,
} from "../../lib/auth/auth-storage";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    payload: LoginRequest,
  ) => Promise<AuthUser>;
  logout: () => void;
}

export const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({
  children,
}: AuthProviderProps) => {
  const [token, setToken] =
    useState<string | null>(() =>
      getToken(),
    );

  const [user, setUser] =
    useState<AuthUser | null>(() =>
      getStoredUser(),
    );

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleAuthExpired = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener(
      "khatax:auth-expired",
      handleAuthExpired,
    );

    return () => {
      window.removeEventListener(
        "khatax:auth-expired",
        handleAuthExpired,
      );
    };
  }, []);

  const login = async (
    payload: LoginRequest,
  ): Promise<AuthUser> => {
    const response =
      await loginUser(payload);

    saveAuth({
      token: response.data.token,
      user: response.data.user,
    });

    setToken(response.data.token);
    setUser(response.data.user);

    return response.data.user;
  };

  const logout = () => {
    clearAuth();
    setToken(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated:
        Boolean(token) && Boolean(user),
      isLoading,
      login,
      logout,
    }),
    [
      user,
      token,
      isLoading,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};