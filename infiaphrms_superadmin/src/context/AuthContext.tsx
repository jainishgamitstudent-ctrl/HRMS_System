"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface SendOtpResult {
  success: boolean;
  message: string;
  devEmailOtp?: string;
  devPhoneOtp?: string;
  email?: string;
  phone?: string;
  expiresInSeconds?: number;
  cooldownSeconds?: number;
}

interface VerifyResult {
  success: boolean;
  message: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

interface CompleteLoginResult {
  success: boolean;
  message: string;
  nextStep?: "DONE";
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sendOtp: () => Promise<SendOtpResult>;
  verifyEmailOtp: (otp: string) => Promise<VerifyResult>;
  verifyPhoneOtp: (otp: string) => Promise<VerifyResult>;
  completeLogin: (
    geo?: { latitude: number; longitude: number; address?: string; city?: string; state?: string; country?: string }
  ) => Promise<CompleteLoginResult>;
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

function setStoredUser(user: AuthUser | null, accessToken?: string) {
  if (typeof window === "undefined") return;
  if (!user) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({ user, accessToken, expiresAt: Date.now() + 24 * 60 * 60 * 1000 })
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

  const sendOtp = useCallback(async (): Promise<SendOtpResult> => {
    try {
      const data = await authApi.sendSuperadminOtp();
      return {
        success: true,
        message: "OTPs sent successfully",
        devEmailOtp: data.devEmailOtp,
        devPhoneOtp: data.devPhoneOtp,
        email: data.email,
        phone: data.phone,
        expiresInSeconds: data.expiresInSeconds,
        cooldownSeconds: data.cooldownSeconds,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Failed to send OTPs",
      };
    }
  }, []);

  const verifyEmailOtp = useCallback(async (otp: string): Promise<VerifyResult> => {
    try {
      const normalized = otp.trim().toUpperCase();
      if (!normalized || normalized.length !== 6 || !/^[A-Z0-9]{6}$/.test(normalized)) {
        return { success: false, message: "Please enter a valid 6-character email OTP" };
      }
      const data = await authApi.verifySuperadminEmailOtp(normalized);
      return {
        success: true,
        message: "Email OTP verified",
        emailVerified: data.emailVerified,
        phoneVerified: data.phoneVerified,
      };
    } catch (err: any) {
      const code = err.data?.code || err.code;
      const msg = err.data?.message || err.message || "Verification failed";
      const userMsg =
        code === "invalid_otp" ? "Invalid email OTP" :
        code === "expired_otp" ? "Email OTP expired. Please resend." :
        code === "too_many_attempts" ? "Too many attempts. Try again later." :
        code === "user_not_found" ? "SuperAdmin not found." :
        code === "no_active_otp" ? "No active OTP. Please request a new one." :
        msg;
      return { success: false, message: userMsg };
    }
  }, []);

  const verifyPhoneOtp = useCallback(async (otp: string): Promise<VerifyResult> => {
    try {
      const normalized = otp.trim();
      if (!normalized || normalized.length !== 6 || /^\d{6}$/.test(normalized) === false) {
        return { success: false, message: "Please enter a valid 6-digit phone OTP" };
      }
      const data = await authApi.verifySuperadminPhoneOtp(normalized);
      return {
        success: true,
        message: "Phone OTP verified",
        emailVerified: data.emailVerified,
        phoneVerified: data.phoneVerified,
      };
    } catch (err: any) {
      const code = err.data?.code || err.code;
      const msg = err.data?.message || err.message || "Verification failed";
      const userMsg =
        code === "invalid_otp" ? "Invalid phone OTP" :
        code === "expired_otp" ? "Phone OTP expired. Please resend." :
        code === "too_many_attempts" ? "Too many attempts. Try again later." :
        code === "user_not_found" ? "SuperAdmin not found." :
        code === "no_active_otp" ? "No active OTP. Please request a new one." :
        msg;
      return { success: false, message: userMsg };
    }
  }, []);

  const completeLogin = useCallback(async (
    geo?: { latitude: number; longitude: number; address?: string; city?: string; state?: string; country?: string }
  ): Promise<CompleteLoginResult> => {
    try {
      const data = await authApi.completeSuperadminLogin(geo);
      if (data.nextStep === "DONE") {
        const newUser: AuthUser = {
          id: data.user?._id || "superadmin-1",
          email: data.user?.email || "mriya0619@gmail.com",
          name: data.user?.name || "Super Admin",
        };
        const token = data.access_token || data.accessToken || data.token;
        setUser(newUser);
        setStoredUser(newUser, token);
      }
      return {
        success: true,
        message: data.message || "Login successful",
        nextStep: data.nextStep,
      };
    } catch (err: any) {
      const code = err.data?.code || err.code;
      const msg = err.data?.message || err.message || "Login completion failed";
      const userMsg =
        code === "incomplete_verification" ? "Both OTPs must be verified first." :
        code === "user_not_found" ? "SuperAdmin not found." :
        msg;
      return { success: false, message: userMsg };
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
        verifyEmailOtp,
        verifyPhoneOtp,
        completeLogin,
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
