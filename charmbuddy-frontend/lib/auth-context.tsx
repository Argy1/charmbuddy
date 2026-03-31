"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { loginApi, logoutApi, meApi, registerApi } from "@/lib/api/auth";

type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type AuthContextValue = {
  isLoggedIn: boolean;
  isAuthResolved: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const USER_STORAGE_KEY = "cb_auth_user_v2";
const TOKEN_STORAGE_KEY = "cb_auth_token_v2";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthResolved, setIsAuthResolved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrateAuth = async () => {
      setIsLoading(true);

      let storedUser: AuthUser | null = null;
      let storedToken: string | null = null;

      try {
        const userRaw = window.localStorage.getItem(USER_STORAGE_KEY);
        const tokenRaw = window.localStorage.getItem(TOKEN_STORAGE_KEY);

        if (userRaw) {
          storedUser = JSON.parse(userRaw) as AuthUser;
        }
        if (tokenRaw) {
          storedToken = tokenRaw;
        }
      } catch {
        window.localStorage.removeItem(USER_STORAGE_KEY);
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      }

      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setToken(null);
          setIsAuthResolved(true);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await meApi(storedToken);
        if (!isMounted) {
          return;
        }
        setUser(response.data);
        setToken(storedToken);
      } catch {
        if (!isMounted) {
          return;
        }
        setUser(storedUser ?? null);
        setToken(storedToken);
      } finally {
        if (isMounted) {
          setIsAuthResolved(true);
          setIsLoading(false);
        }
      }
    };

    void hydrateAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isAuthResolved) {
      return;
    }

    try {
      if (!user || !token) {
        window.localStorage.removeItem(USER_STORAGE_KEY);
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      } else {
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
      }
    } catch {
      window.localStorage.removeItem(USER_STORAGE_KEY);
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, [isAuthResolved, token, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoggedIn: !!user && !!token,
      isAuthResolved,
      isLoading,
      user,
      token,
      login: async (email: string, password: string) => {
        setIsLoading(true);
        try {
          const response = await loginApi({ email, password });
          setUser(response.data.user);
          setToken(response.data.token);
          setIsAuthResolved(true);
          return response.data.user;
        } finally {
          setIsLoading(false);
        }
      },
      register: async (name: string, email: string, password: string) => {
        setIsLoading(true);
        try {
          const response = await registerApi({ name, email, password });
          setUser(response.data.user);
          setToken(response.data.token);
          setIsAuthResolved(true);
          return response.data.user;
        } finally {
          setIsLoading(false);
        }
      },
      logout: async () => {
        if (token) {
          try {
            await logoutApi(token);
          } catch {
            // noop: local logout fallback
          }
        }
        setUser(null);
        setToken(null);
      },
      refreshUser: async () => {
        if (!token) {
          setUser(null);
          return;
        }
        setIsLoading(true);
        try {
          const response = await meApi(token);
          setUser(response.data);
        } finally {
          setIsLoading(false);
        }
      },
    }),
    [isAuthResolved, isLoading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
