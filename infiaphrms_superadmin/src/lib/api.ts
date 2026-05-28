export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
const SUPERADMIN_BASE = `${API_BASE}/v1/superadmin`;
export const API_ORIGIN = API_BASE.replace(/\/api$/, "");

/* ───────── existing low-level fetch (preserved for auth) ───────── */
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
    if ((res.status === 401 || res.status === 403) && path.includes("/superadmin/unlock/") && typeof window !== "undefined") {
      localStorage.removeItem("infiap_superadmin_auth");
      sessionStorage.removeItem("infiap_superadmin_locked");
      window.location.assign("/session-timeout");
    }
    const error = new Error(data.message || `HTTP ${res.status}`);
    (error as any).status = res.status;
    (error as any).data = data;
    (error as any).code = data.error || data.code;
    throw error;
  }

  return data;
}

/* ───────── token helper ───────── */
function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("infiap_superadmin_auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.accessToken || parsed.access_token || null;
  } catch {
    return null;
  }
}

/* ───────── superadmin fetcher (auth + envelope unwrapping) ───────── */
async function saFetch<T = any>(path: string, options?: RequestInit): Promise<T> {
  const url = `${SUPERADMIN_BASE}${path}`;
  const token = getAccessToken();

  const isFormData = options?.body instanceof FormData;

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    credentials: "include",
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    if ((res.status === 401 || res.status === 403) && typeof window !== "undefined") {
      localStorage.removeItem("infiap_superadmin_auth");
      sessionStorage.removeItem("infiap_superadmin_locked");
      window.location.assign("/session-timeout");
    }
    const err = new Error(body.error?.message || body.message || `HTTP ${res.status}`);
    (err as any).status = res.status;
    (err as any).code = body.error?.code;
    (err as any).data = body;
    throw err;
  }

  if (body && typeof body === "object" && "success" in body && body.success === true && "data" in body) {
    return body.data as T;
  }
  return body as T;
}

/* ───────── query-string builder ───────── */
function buildQuery(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return "";
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  return qs ? `?${qs}` : "";
}

/* ══════════════════════════ 1. AUTH ══════════════════════════ */
export const authApi = {
  sendSuperadminOtp: () =>
    apiFetch("/auth/superadmin/send-otp", { method: "POST" }),

  verifySuperadminEmailOtp: (otp: string) =>
    apiFetch("/auth/superadmin/verify-email-otp", {
      method: "POST",
      body: JSON.stringify({ otp }),
    }),

  sendSuperadminRecoveryOtp: () =>
    apiFetch("/auth/superadmin/recovery/send-otp", { method: "POST" }),

  verifySuperadminRecoveryOtp: (otp: string) =>
    apiFetch("/auth/superadmin/recovery/verify-otp", {
      method: "POST",
      body: JSON.stringify({ otp }),
    }),

  sendSuperadminUnlockOtp: () =>
    apiFetch("/auth/superadmin/unlock/send-otp", { method: "POST" }),

  verifySuperadminUnlockOtp: (otp: string) =>
    apiFetch("/auth/superadmin/unlock/verify-otp", {
      method: "POST",
      body: JSON.stringify({ otp }),
    }),

  verifySuperadminPhoneOtp: (otp: string) =>
    apiFetch("/auth/superadmin/verify-phone-otp", {
      method: "POST",
      body: JSON.stringify({ otp }),
    }),

  completeSuperadminLogin: (
    geo?: { latitude: number; longitude: number; address?: string; city?: string; state?: string; country?: string }
  ) =>
    apiFetch("/auth/superadmin/complete-login", {
      method: "POST",
      body: JSON.stringify(
        geo
          ? {
              latitude: geo.latitude,
              longitude: geo.longitude,
              address: geo.address,
              city: geo.city,
              state: geo.state,
              country: geo.country,
            }
          : {}
      ),
    }),

  /* documented endpoints (available for future UI use) */
  login: (email: string, password: string, totp_code?: string) =>
    saFetch<{ access_token: string; refresh_token: string; expires_in: number }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, totp_code }),
    }),

  logout: () => saFetch<void>("/auth/logout", { method: "POST" }),

  refresh: (refresh_token: string) =>
    saFetch<{ access_token: string; expires_in: number }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token }),
    }),

  forgotPassword: (email: string) =>
    saFetch<void>("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),

  resetPassword: (token: string, new_password: string) =>
    saFetch<void>("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, new_password }) }),
};

/* ══════════════════════════ 2. COMPANIES ══════════════════════════ */
export const companiesApi = {
  create: (payload: Record<string, unknown>) => saFetch<Record<string, unknown>>("/companies", { method: "POST", body: JSON.stringify(payload) }),

  list: (params?: { page?: number; limit?: number; search?: string; sort_by?: string; order?: "asc" | "desc"; status?: string; plan?: string; date_from?: string; date_to?: string }) =>
    saFetch<{ companies: Record<string, unknown>[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/companies${buildQuery(params)}`),

  get: (id: string) => saFetch<Record<string, unknown>>(`/companies/${id}`),

  update: (id: string, payload: Record<string, unknown>) => saFetch<Record<string, unknown>>(`/companies/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  remove: (id: string) => saFetch<void>(`/companies/${id}`, { method: "DELETE" }),

  updateStatus: (id: string, status: string, reason?: string) =>
    saFetch<void>(`/companies/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, reason }) }),

  uploadLogo: (id: string, formData: FormData) =>
    saFetch<{ logo_url: string }>(`/companies/${id}/logo`, { method: "POST", body: formData }),

  updateSettings: (id: string, payload: Record<string, unknown>) =>
    saFetch<void>(`/companies/${id}/settings`, { method: "PUT", body: JSON.stringify(payload) }),

  updateFeatureFlags: (id: string, flags: Record<string, boolean>) =>
    saFetch<void>(`/companies/${id}/feature-flags`, { method: "PUT", body: JSON.stringify({ flags }) }),

  getSubscription: (id: string) => saFetch<Record<string, unknown>>(`/companies/${id}/subscription`),

  updateSubscription: (id: string, payload: { plan_id?: string; trial_ends_at?: string }) =>
    saFetch<void>(`/companies/${id}/subscription`, { method: "PUT", body: JSON.stringify(payload) }),

  getAdmins: (companyId: string) => saFetch<Record<string, unknown>[]>(`/companies/${companyId}/admins`),

  getHrUsers: (companyId: string) => saFetch<Record<string, unknown>[]>(`/companies/${companyId}/hr-users`),
};

/* ══════════════════════════ 3. ADMINS ══════════════════════════ */
export const adminsApi = {
  create: (payload: Record<string, unknown>) => saFetch<Record<string, unknown>>("/admins", { method: "POST", body: JSON.stringify(payload) }),

  list: (params?: { page?: number; limit?: number; company_id?: string; status?: string; date_from?: string; date_to?: string }) =>
    saFetch<{ data: Record<string, unknown>[]; meta: { page: number; limit: number; total: number } }>(`/admins${buildQuery(params)}`),

  get: (id: string) => saFetch<Record<string, unknown>>(`/admins/${id}`),

  update: (id: string, payload: Record<string, unknown>) => saFetch<Record<string, unknown>>(`/admins/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  remove: (id: string) => saFetch<void>(`/admins/${id}`, { method: "DELETE" }),

  updateStatus: (id: string, status: string) => saFetch<void>(`/admins/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),

  resetPassword: (id: string) => saFetch<void>(`/admins/${id}/reset-password`, { method: "POST" }),

  getSessions: (id: string) => saFetch<Record<string, unknown>[]>(`/admins/${id}/sessions`),
};

/* ══════════════════════════ 4. HR USERS ══════════════════════════ */
export const hrUsersApi = {
  create: (payload: Record<string, unknown>) => saFetch<Record<string, unknown>>("/hr-users", { method: "POST", body: JSON.stringify(payload) }),

  list: (params?: { page?: number; limit?: number; company_id?: string; status?: string; module?: string }) =>
    saFetch<{ data: Record<string, unknown>[]; meta: { page: number; limit: number; total: number } }>(`/hr-users${buildQuery(params)}`),

  get: (id: string) => saFetch<Record<string, unknown>>(`/hr-users/${id}`),

  update: (id: string, payload: Record<string, unknown>) => saFetch<Record<string, unknown>>(`/hr-users/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  remove: (id: string) => saFetch<void>(`/hr-users/${id}`, { method: "DELETE" }),

  updateStatus: (id: string, status: string) => saFetch<void>(`/hr-users/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),

  assignCompany: (id: string, company_id: string) => saFetch<void>(`/hr-users/${id}/assign-company`, { method: "POST", body: JSON.stringify({ company_id }) }),

  updatePermissions: (id: string, module_access: string[]) => saFetch<void>(`/hr-users/${id}/permissions`, { method: "PUT", body: JSON.stringify({ module_access }) }),
};

/* ══════════════════════════ 5. ROLES & PERMISSIONS ══════════════════════════ */
export const rolesApi = {
  listPermissions: () => saFetch<Record<string, string[]>>("/permissions"),

  create: (payload: { name: string; description?: string; scope?: string }) => saFetch<Record<string, unknown>>("/roles", { method: "POST", body: JSON.stringify(payload) }),

  list: () => saFetch<Record<string, unknown>[]>("/roles"),

  get: (id: string) => saFetch<Record<string, unknown>>(`/roles/${id}`),

  update: (id: string, payload: { name?: string; description?: string }) => saFetch<Record<string, unknown>>(`/roles/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  remove: (id: string) => saFetch<void>(`/roles/${id}`, { method: "DELETE" }),

  assignPermissions: (id: string, permission_ids: string[]) => saFetch<void>(`/roles/${id}/permissions`, { method: "POST", body: JSON.stringify({ permission_ids }) }),

  revokePermission: (id: string, permId: string) => saFetch<void>(`/roles/${id}/permissions/${permId}`, { method: "DELETE" }),

  assignRoleToUser: (userId: string, role_id: string, scope?: string, company_id?: string) =>
    saFetch<void>(`/users/${userId}/roles`, { method: "POST", body: JSON.stringify({ role_id, scope, company_id }) }),

  removeRoleFromUser: (userId: string, roleId: string) => saFetch<void>(`/users/${userId}/roles/${roleId}`, { method: "DELETE" }),

  getUserPermissions: (userId: string) => saFetch<Record<string, unknown>>(`/users/${userId}/permissions`),

  diff: (roleA: string, roleB: string) => saFetch<Record<string, unknown>>(`/roles/diff${buildQuery({ roleA, roleB })}`),

  setUserPermissionOverrides: (userId: string, overrides: { permission_id: string; granted: boolean }[]) =>
    saFetch<void>(`/users/${userId}/permissions/override`, { method: "POST", body: JSON.stringify({ overrides }) }),
};

/* ══════════════════════════ 6. REPORTS & ANALYTICS ══════════════════════════ */
export const reportsApi = {
  overview: (params?: { date_from?: string; date_to?: string; company_id?: string }) =>
    saFetch<Record<string, unknown>>(`/reports/overview${buildQuery(params)}`),

  companies: (params?: { date_from?: string; date_to?: string; company_id?: string }) =>
    saFetch<Record<string, unknown>>(`/reports/companies${buildQuery(params)}`),

  employees: (params?: { date_from?: string; date_to?: string; company_id?: string }) =>
    saFetch<Record<string, unknown>>(`/reports/employees${buildQuery(params)}`),

  attendance: (params?: { date_from?: string; date_to?: string; company_id?: string }) =>
    saFetch<Record<string, unknown>>(`/reports/attendance${buildQuery(params)}`),

  payroll: (params?: { date_from?: string; date_to?: string; company_id?: string }) =>
    saFetch<Record<string, unknown>>(`/reports/payroll${buildQuery(params)}`),

  leave: (params?: { date_from?: string; date_to?: string; company_id?: string }) =>
    saFetch<Record<string, unknown>>(`/reports/leave${buildQuery(params)}`),

  recruitment: (params?: { date_from?: string; date_to?: string; company_id?: string }) =>
    saFetch<Record<string, unknown>>(`/reports/recruitment${buildQuery(params)}`),

  logins: (params?: { date_from?: string; date_to?: string; company_id?: string }) =>
    saFetch<Record<string, unknown>>(`/reports/logins${buildQuery(params)}`),

  auditLogs: (params?: { page?: number; limit?: number; actor_id?: string; action?: string; resource_type?: string; date_from?: string; date_to?: string }) =>
    saFetch<{ data: Record<string, unknown>[]; meta: { page: number; limit: number; total: number } }>(`/reports/audit-logs${buildQuery(params)}`),

  export: (payload: { report_type: string; format: string; filters: Record<string, unknown> }) =>
    saFetch<{ job_id: string; status: string }>("/reports/export", { method: "POST", body: JSON.stringify(payload) }),

  exportStatus: (jobId: string) => saFetch<{ status: string; download_url?: string; expires_at?: string }>(`/reports/export/${jobId}`),

  dashboard: () => saFetch<Record<string, unknown>>("/dashboard"),

  health: () => saFetch<Record<string, unknown>>("/dashboard/health"),
};

/* ══════════════════════════ 7. SYSTEM SETTINGS ══════════════════════════ */
export const settingsApi = {
  getProfile: () => saFetch<Record<string, unknown>>("/profile"),

  updateProfile: (payload: { name?: string; email?: string; phone?: string }) => saFetch<Record<string, unknown>>("/profile", { method: "PUT", body: JSON.stringify(payload) }),

  changePassword: (current_password: string, new_password: string) =>
    saFetch<void>("/profile/password", { method: "PUT", body: JSON.stringify({ current_password, new_password }) }),

  uploadAvatar: (formData: FormData) => saFetch<{ avatar_url: string }>("/profile/avatar", { method: "POST", body: formData }),

  changeEmail: (email: string) => saFetch<Record<string, unknown>>("/profile", { method: "PUT", body: JSON.stringify({ email }) }),

  requestEmailChange: (email: string) =>
    saFetch<{ ok: boolean; maskedCurrentEmail: string; expiresInSeconds: number; devOtp?: string }>("/profile/email/request-change", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  confirmEmailChange: (otp: string) =>
    saFetch<{ ok: boolean; email: string; maskedEmail: string }>("/profile/email/confirm-change", {
      method: "POST",
      body: JSON.stringify({ otp }),
    }),

  updateRecoveryEmail: (recoveryEmail: string) => saFetch<Record<string, unknown>>("/profile", { method: "PUT", body: JSON.stringify({ recoveryEmail }) }),

  getRecoveryEmailStatus: () =>
    saFetch<{ ok: boolean; maskedPrimaryEmail: string; maskedRecoveryEmail: string | null; hasPendingChange: boolean; maskedPendingEmail: string | null }>("/recovery-email"),

  requestRecoveryEmailChange: (recoveryEmail: string) =>
    saFetch<{ ok: boolean; message: string; maskedPrimaryEmail: string; expiresInSeconds: number; devOtp?: string }>("/recovery-email/request-change", {
      method: "POST",
      body: JSON.stringify({ recoveryEmail }),
    }),

  confirmRecoveryEmailChange: (otp: string) =>
    saFetch<{ ok: boolean; message: string; recoveryEmail: string; recoveryEmailMasked: string }>("/recovery-email/confirm-change", {
      method: "POST",
      body: JSON.stringify({ otp }),
    }),

  deleteAccount: () => saFetch<void>("/profile", { method: "DELETE" }),

  setup2fa: () => saFetch<{ secret: string; qr_code_uri: string }>("/profile/2fa/setup", { method: "POST" }),

  verify2fa: (totp_code: string) => saFetch<void>("/profile/2fa/verify", { method: "POST", body: JSON.stringify({ totp_code }) }),

  disable2fa: (password: string, totp_code: string) => saFetch<void>("/profile/2fa", { method: "DELETE", body: JSON.stringify({ password, totp_code }) }),

  getIpWhitelist: () => saFetch<Record<string, unknown>[]>("/security/ip-whitelist"),

  addIpWhitelist: (ip_cidr: string, label: string) =>
    saFetch<void>("/security/ip-whitelist", { method: "POST", body: JSON.stringify({ ip_cidr, label }) }),

  removeIpWhitelist: (id: string) => saFetch<void>(`/security/ip-whitelist/${id}`, { method: "DELETE" }),

  revokeSession: (sessionId: string) => saFetch<void>(`/security/sessions/${sessionId}`, { method: "DELETE" }),

  revokeAllSessions: (userId: string) => saFetch<void>(`/security/sessions${buildQuery({ userId })}`, { method: "DELETE" }),

  getSecurityQuestions: () =>
    saFetch<{ success: boolean; data?: { predefined: { id: string; text: string }[]; configured: { questionId: string; questionText: string }[]; isConfigured: boolean } }>("/security-questions"),

  setSecurityQuestions: (questions: { questionId: string; questionText: string; answer: string }[]) =>
    saFetch<{ success: boolean; message?: string }>("/security-questions", { method: "POST", body: JSON.stringify({ questions }) }),

  getSessions: () => saFetch<{ success: boolean; data?: Record<string, unknown>[] }>("/sessions"),

  revokeOneSession: (sessionId: string) => saFetch<{ success: boolean; message?: string }>("/sessions/revoke", { method: "POST", body: JSON.stringify({ sessionId }) }),

  revokeAllSuperadminSessions: () => saFetch<{ success: boolean; message?: string }>("/sessions/revoke-all", { method: "POST" }),

  getTrustedDevices: () => saFetch<{ success: boolean; data?: Record<string, unknown>[] }>("/trusted-devices"),

  removeTrustedDevice: (deviceId: string) => saFetch<{ success: boolean; message?: string }>("/trusted-devices/remove", { method: "POST", body: JSON.stringify({ deviceId }) }),

  getNotificationPreferences: () => saFetch<Record<string, unknown>>("/notifications/preferences"),

  updateNotificationPreferences: (payload: Record<string, unknown>) =>
    saFetch<void>("/notifications/preferences", { method: "PUT", body: JSON.stringify(payload) }),

  createAnnouncement: (payload: Record<string, unknown>) => saFetch<Record<string, unknown>>("/announcements", { method: "POST", body: JSON.stringify(payload) }),

  listAnnouncements: () => saFetch<Record<string, unknown>[]>("/announcements"),

  toggleMaintenance: (enabled: boolean, message?: string) => saFetch<void>("/maintenance", { method: "PATCH", body: JSON.stringify({ enabled, message }) }),

  toggleCompanyMaintenance: (companyId: string, enabled: boolean, message?: string) =>
    saFetch<void>(`/companies/${companyId}/maintenance`, { method: "PATCH", body: JSON.stringify({ enabled, message }) }),

  listApiKeys: () => saFetch<Record<string, unknown>[]>("/api-keys"),

  createApiKey: (payload: { name: string; scope: string[]; expires_at?: string }) =>
    saFetch<{ id: string; name: string; key: string; expires_at: string }>("/api-keys", { method: "POST", body: JSON.stringify(payload) }),

  revokeApiKey: (id: string) => saFetch<void>(`/api-keys/${id}`, { method: "DELETE" }),
};

/* ══════════════════════════ 8. BILLING ══════════════════════════ */
export const billingApi = {
  dashboard: () => saFetch<Record<string, unknown>>("/billing/dashboard"),

  listPlans: () => saFetch<Record<string, unknown>[]>("/billing/plans"),

  createPlan: (payload: Record<string, unknown>) => saFetch<Record<string, unknown>>("/billing/plans", { method: "POST", body: JSON.stringify(payload) }),

  updatePlan: (id: string, payload: Record<string, unknown>) => saFetch<Record<string, unknown>>(`/billing/plans/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  archivePlan: (id: string) => saFetch<void>(`/billing/plans/${id}/archive`, { method: "PATCH" }),

  getCompanyBilling: (companyId: string) => saFetch<Record<string, unknown>>(`/billing/companies/${companyId}`),

  changeCompanyPlan: (companyId: string, plan_id: string, effective?: string) =>
    saFetch<void>(`/billing/companies/${companyId}/plan`, { method: "PATCH", body: JSON.stringify({ plan_id, effective }) }),

  cancelSubscription: (companyId: string) => saFetch<void>(`/billing/companies/${companyId}/subscription`, { method: "DELETE" }),

  listInvoices: (params?: { page?: number; limit?: number; company_id?: string; status?: string; date_from?: string; date_to?: string }) =>
    saFetch<{ data: Record<string, unknown>[]; meta: { page: number; limit: number; total: number } }>(`/billing/invoices${buildQuery(params)}`),

  getInvoice: (id: string) => saFetch<Record<string, unknown>>(`/billing/invoices/${id}`),

  resendInvoice: (id: string) => saFetch<void>(`/billing/invoices/${id}/resend`, { method: "POST" }),

  getInvoicePdf: (id: string) => saFetch<{ download_url: string }>(`/billing/invoices/${id}/pdf`),

  listTrials: () => saFetch<Record<string, unknown>[]>("/billing/trials"),

  extendTrial: (companyId: string, trial_ends_at: string, reason: string) =>
    saFetch<void>(`/billing/trials/${companyId}/extend`, { method: "PATCH", body: JSON.stringify({ trial_ends_at, reason }) }),

  convertTrials: (company_ids: string[], plan_id: string, effective?: string) =>
    saFetch<void>("/billing/trials/convert", { method: "POST", body: JSON.stringify({ company_ids, plan_id, effective }) }),

  receiveWebhook: (payload: Record<string, unknown>, signature?: string) =>
    saFetch<void>("/billing/webhook", { method: "POST", headers: signature ? { "X-Webhook-Signature": signature } : {}, body: JSON.stringify(payload) }),
};

export default apiFetch;
