const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

async function apiFetch(path: string, options?: RequestInit) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.message || `HTTP ${res.status}`);
    (error as any).status = res.status;
    (error as any).data = data;
    throw error;
  }

  return data;
}

export const authApi = {
  sendSuperadminOtp: () =>
    apiFetch("/auth/superadmin/send-otp", {
      method: "POST",
    }),

  verifySuperadminOtp: (emailOtp: string) =>
    apiFetch("/auth/superadmin/verify-otp", {
      method: "POST",
      body: JSON.stringify({ emailOtp }),
    }),
};

export default apiFetch;
