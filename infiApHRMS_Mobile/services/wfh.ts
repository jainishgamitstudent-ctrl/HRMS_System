import { API_BASE_URL } from '../constants/api';
import { getAuthHeaders } from './auth';

const REQUEST_TIMEOUT_MS = 15000;

class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const buildUrl = (path: string) => `${API_BASE_URL}${path}`;

const parseJsonSafely = (rawValue: string) => {
  if (!rawValue) return {};
  try {
    return JSON.parse(rawValue) as Record<string, unknown>;
  } catch {
    return {};
  }
};

const request = async <T>(path: string, options: { method?: string; body?: unknown; headers?: Record<string, string> } = {}): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(buildUrl(path), {
      method: options.method || 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    const rawText = await response.text();
    const data = parseJsonSafely(rawText);

    if (!response.ok) {
      const message =
        (typeof data.message === 'string' ? data.message : '') ||
        (typeof data.error === 'string' ? data.error : '') ||
        `Request failed with status ${response.status}`;
      throw new ApiError(message, response.status);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timeout. Please check your network and try again.');
    }
    throw new ApiError('Unable to reach the server. Check that the backend is running and your device can access it.');
  } finally {
    clearTimeout(timeoutId);
  }
};

export type WFHPermissionCheckResponse = {
  status: string;
  data: {
    wfhEnabled: boolean;
    level: string | null;
    notes: string | null;
  };
};

export type WFHPermissionRecord = {
  id: string;
  level: 'global' | 'employee' | 'team' | 'department';
  isActive: boolean;
  grantedAt: string;
  revokedAt: string | null;
  notes: string;
  grantedBy: { id: string; name: string; email: string } | null;
  employee: { id: string; name: string; email: string; employeeId: string } | null;
  team: { id: string; name: string } | null;
  department: { id: string; name: string } | null;
};

export type WFHPermissionListResponse = {
  status: string;
  data: WFHPermissionRecord[];
};

export type WFHPermissionGrantPayload = {
  level: 'global' | 'employee' | 'team' | 'department';
  employeeId?: string;
  teamId?: string;
  departmentId?: string;
  notes?: string;
};

export type WFHPermissionGrantResponse = {
  status: string;
  message: string;
  data: { id: string; level: string; isActive: boolean };
};

export type WFHPermissionRevokeResponse = {
  status: string;
  message: string;
  data: { id: string; level: string; isActive: boolean };
};

export type WFHUpcomingItem = {
  id: string;
  date: string;
  day: string;
  duration: string;
  status: string;
};

export type WFHUpcomingResponse = {
  status: string;
  data: WFHUpcomingItem[];
  wfhEnabled?: boolean;
};

export const checkMyWFHPermission = async () => {
  const headers = await getAuthHeaders();
  return request<WFHPermissionCheckResponse>('/wfh/permission/check', {
    method: 'GET',
    headers,
  });
};

export const fetchWFHPermissions = async (filters?: { level?: string; isActive?: boolean; employeeId?: string; teamId?: string; departmentId?: string }) => {
  const headers = await getAuthHeaders();
  const queryParams = new URLSearchParams();
  if (filters?.level) queryParams.append('level', filters.level);
  if (filters?.isActive !== undefined) queryParams.append('isActive', String(filters.isActive));
  if (filters?.employeeId) queryParams.append('employeeId', filters.employeeId);
  if (filters?.teamId) queryParams.append('teamId', filters.teamId);
  if (filters?.departmentId) queryParams.append('departmentId', filters.departmentId);

  const queryString = queryParams.toString();
  const path = `/wfh/permissions${queryString ? `?${queryString}` : ''}`;

  return request<WFHPermissionListResponse>(path, {
    method: 'GET',
    headers,
  });
};

export const grantWFHPermission = async (payload: WFHPermissionGrantPayload) => {
  const headers = await getAuthHeaders();
  return request<WFHPermissionGrantResponse>('/wfh/permissions', {
    method: 'POST',
    headers,
    body: payload,
  });
};

export const revokeWFHPermission = async (permissionId: string) => {
  const headers = await getAuthHeaders();
  return request<WFHPermissionRevokeResponse>(`/wfh/permissions/${permissionId}/revoke`, {
    method: 'PATCH',
    headers,
  });
};

export const fetchUpcomingWFH = async () => {
  const headers = await getAuthHeaders();
  return request<WFHUpcomingResponse>('/wfh/upcoming', {
    method: 'GET',
    headers,
  });
};
