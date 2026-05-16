import apiClient from "./apiClient";
import { tokenStore } from "./tokenStore";

export const authService = {
  // Step 1: Login (sends OTP to email or returns token if 2FA already verified)
  login: async (email, password, role) => {
    const payload = { email, password };
    if (role) payload.role = role;
    const res = await apiClient.post("/auth/login", payload);
    // Save token if returned directly (2FA already verified or skipped in dev)
    if (res.data.token && !res.data.require2FA) {
      tokenStore.setToken(res.data.token);
      tokenStore.setRole(res.data.role);
    }
    return res.data;
  },

  // Step 2: Verify OTP (first login)
  verify2FA: async (userId, otp) => {
    const res = await apiClient.post("/auth/verify-2fa", { userId, otp });
    // Save token in memory store on success (NOT localStorage)
    if (res.data.token) {
      tokenStore.setToken(res.data.token);
      tokenStore.setRole(res.data.role);
    }
    return res.data;
  },

  // Resend OTP
  resendOTP: async (userId) => {
    const res = await apiClient.post("/auth/resend-2fa", { userId });
    return res.data;
  },

  forgotPassword: async (email) => {
    const res = await apiClient.post("/auth/forgot-password", { email });
    return res.data;
  },

  resetPassword: async (token, password) => {
    const res = await apiClient.post("/auth/reset-password", { token, password });
    return res.data;
  },

  logout: () => {
    tokenStore.clearToken();
  },
};
