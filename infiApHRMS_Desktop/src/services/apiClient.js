import axios from "axios";
import { API } from "../config/api.config";
import { tokenStore } from "./tokenStore";

const apiClient = axios.create({
  baseURL: API.BASE,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Send cookies with requests
});

// Add Authorization header from tokenStore (or sessionStorage fallback) when cookies don't work
apiClient.interceptors.request.use((config) => {
  // Prefer in-memory token, fall back to sessionStorage (survives page refresh in same tab)
  const token = tokenStore.getToken() || sessionStorage.getItem("auth_token");
  if (token) {
    // Sync back to memory store so subsequent calls don't need to re-read sessionStorage
    if (!tokenStore.getToken()) tokenStore.setToken(token);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally (auto logout)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isUnauthorized = error.response?.status === 401;
    const isHydrationCall = error.config?.url?.includes("/auth/me");
    const isLoginPage = window.location.pathname === "/login";

    // Don't auto-redirect during the initial hydration check (/auth/me)
    // or when already on the login page — just let it fail silently.
    if (isUnauthorized && !isHydrationCall && !isLoginPage) {
      tokenStore.clearToken();
      sessionStorage.removeItem("auth_token");
      // Redirect to login (cookies are cleared by backend)
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
