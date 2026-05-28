"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  profileImage?: string | null;
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
  locked?: boolean;
  lockedUntil?: string;
  remainingSeconds?: number;
}

interface VerifyResult {
  success: boolean;
  message: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  locked?: boolean;
  lockedUntil?: string;
  remainingSeconds?: number;
}

interface CompleteLoginResult {
  success: boolean;
  message: string;
  nextStep?: "DONE";
  locked?: boolean;
  lockedUntil?: string;
  remainingSeconds?: number;
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
  sendRecoveryOtp: () => Promise<SendOtpResult>;
  verifyRecoveryOtp: (otp: string) => Promise<CompleteLoginResult>;
  sendUnlockOtp: () => Promise<SendOtpResult>;
  verifyUnlockOtp: (otp: string) => Promise<VerifyResult>;
  updateUser: (updates: Partial<AuthUser>) => void;
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

function getStoredAccessToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    return parsed.accessToken || parsed.access_token || undefined;
  } catch {
    return undefined;
  }
}

function setStoredUser(user: AuthUser | null, accessToken?: string) {
  if (typeof window === "undefined") return;
  if (!user) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  const existingToken = accessToken ?? getStoredAccessToken();
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({ user, accessToken: existingToken, expiresAt: Date.now() + 24 * 60 * 60 * 1000 })
  );
}

function lockedResult(err: any): SendOtpResult | null {
  const data = err?.data || {};
  if (err?.status === 423 || data.error === "ACCOUNT_LOCKED" || data.code === "ACCOUNT_LOCKED") {
    return {
      success: false,
      locked: true,
      message: "Account locked",
      lockedUntil: data.lockedUntil,
      remainingSeconds: data.remainingSeconds,
    };
  }
  return null;
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
      const locked = lockedResult(err);
      if (locked) return locked;
      return {
        success: false,
        message: err.message || "Failed to send OTPs",
      };
    }
  }, []);

  const sendRecoveryOtp = useCallback(async (): Promise<SendOtpResult> => {
    try {
      const data = await authApi.sendSuperadminRecoveryOtp();
      return { success: true, message: "Recovery OTP sent", email: data.recoveryEmail, expiresInSeconds: data.expiresInSeconds, devEmailOtp: data.devOtp };
    } catch (err: any) {
      return { success: false, message: err.data?.message || err.message || "Failed to send recovery OTP" };
    }
  }, []);

  const verifyRecoveryOtp = useCallback(async (otp: string): Promise<CompleteLoginResult> => {
    try {
      const data = await authApi.verifySuperadminRecoveryOtp(otp.trim().toUpperCase());
      const newUser: AuthUser = {
        id: data.user?._id || "superadmin-1",
        email: data.user?.email || "mriya0619@gmail.com",
        name: data.user?.name || "Super Admin",
        phone: data.user?.phone || "",
        profileImage: data.user?.profileImage || null,
      };
      const token = data.access_token || data.accessToken || data.token;
      setUser(newUser);
      setStoredUser(newUser, token);
      return { success: true, message: data.message || "Recovery successful", nextStep: "DONE" };
    } catch (err: any) {
      return { success: false, message: err.data?.message || err.message || "Recovery failed" };
    }
  }, []);

  const sendUnlockOtp = useCallback(async (): Promise<SendOtpResult> => {
    try {
      const data = await authApi.sendSuperadminUnlockOtp();
      return { success: true, message: "Unlock OTP sent", email: data.email, expiresInSeconds: data.expiresInSeconds, devEmailOtp: data.devOtp };
    } catch (err: any) {
      return { success: false, message: err.data?.message || err.message || "Failed to send unlock OTP" };
    }
  }, []);

  const verifyUnlockOtp = useCallback(async (otp: string): Promise<VerifyResult> => {
    try {
      await authApi.verifySuperadminUnlockOtp(otp.trim().toUpperCase());
      return { success: true, message: "Session unlocked" };
    } catch (err: any) {
      return { success: false, message: err.data?.message || err.message || "Unlock failed" };
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
      const locked = lockedResult(err);
      if (locked) return locked;
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
      const locked = lockedResult(err);
      if (locked) return locked;
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
          phone: data.user?.phone || "",
          profileImage: data.user?.profileImage || null,
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
      const locked = lockedResult(err);
      if (locked) return locked;
      const code = err.data?.code || err.code;
      const msg = err.data?.message || err.message || "Login completion failed";
      const userMsg =
        code === "incomplete_verification" ? "Both OTPs must be verified first." :
        code === "user_not_found" ? "SuperAdmin not found." :
        msg;
      return { success: false, message: userMsg };
    }
  }, []);

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser((current) => {
      if (!current) return current;
      const nextUser = { ...current, ...updates };
      setStoredUser(nextUser);
      return nextUser;
    });
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
        sendRecoveryOtp,
        verifyRecoveryOtp,
        sendUnlockOtp,
        verifyUnlockOtp,
        updateUser,
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
