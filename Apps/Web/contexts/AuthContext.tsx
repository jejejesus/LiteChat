"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import * as api from "@/lib/auth.api";

interface User {
  userId: string;
  email: string;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: api.RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const token = api.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      const valid = await api.verifyToken();
      if (valid) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setUser({
            userId: payload.sub,
            email: payload.email,
            fullName: payload.full_name,
          });
        } catch {
          api.setToken(null);
        }
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.login({ email, password });
      setUser({
        userId: res.userId,
        email: res.email,
        fullName: res.fullName,
      });
      router.push("/");
    },
    [router],
  );

  const register = useCallback(
    async (data: api.RegisterRequest) => {
      const res = await api.register(data);
      setUser({
        userId: res.userId,
        email: res.email,
        fullName: res.fullName,
      });
      router.push("/");
    },
    [router],
  );

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
    router.push("/auth/login");
  }, [router]);

  const forgotPassword = useCallback(async (email: string) => {
    await api.forgotPassword(email);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export type { RegisterRequest } from "@/lib/auth.api";
