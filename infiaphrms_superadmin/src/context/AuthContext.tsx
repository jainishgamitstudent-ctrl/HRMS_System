"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendOtp: () => Promise<{ success: boolean; message: string; devEmailOtp?: string }>;
  verifyOtp: (emailOtp: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "infiap_superadmin_auth";

function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.expiresAt && Date.now() > parsed.expiresAt) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    return parsed.user || null;
  } catch {
    return null;
  }
}

function setStoredUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (!user) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({ user, expiresAt: Date.now() + 24 * 60 * 60 * 1000 })
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    setIsLoading(false);
  }, []);

  const sendOtp = useCallback(async (): Promise<{ success: boolean; message: string; devEmailOtp?: string }> => {
    try {
      const data = await authApi.sendSuperadminOtp();
      return {
        success: true,
        message: data.message || "OTP sent to your email",
        devEmailOtp: data.devEmailOtp,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Failed to send OTP",
      };
    }
  }, []);

  const verifyOtp = useCallback(async (
    emailOtp: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      if (!emailOtp.trim() || emailOtp.length !== 6 || !/^\d{6}$/.test(emailOtp)) {
        return { success: false, message: "Please enter a valid 6-digit OTP" };
      }

      const data = await authApi.verifySuperadminOtp(emailOtp.trim());

      const newUser: AuthUser = {
        id: data.user?._id || "superadmin-1",
        email: data.user?.email || "mriya0619@gmail.com",
        name: data.user?.name || "Super Admin",
      };

      setUser(newUser);
      setStoredUser(newUser);

      return { success: true, message: data.message || "Login successful" };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Invalid OTP. Please try again",
      };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setStoredUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        sendOtp,
        verifyOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
