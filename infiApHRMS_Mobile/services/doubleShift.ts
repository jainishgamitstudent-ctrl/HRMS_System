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

export type EmployeeWithDoubleShift = {
  _id: string;
  name: string;
  email: string;
  employeeId?: string;
  department?: string;
  designation?: string;
  doubleShiftAllowed: boolean;
  status?: string;
};

export type EmployeeListResponse = {
  success: boolean;
  data: EmployeeWithDoubleShift[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export const fetchEmployeesForDoubleShift = async (page = 1, limit = 50) => {
  const headers = await getAuthHeaders();
  return request<EmployeeListResponse>(`/hr/employees?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers,
  });
};

export const updateEmployeeDoubleShiftPermission = async (employeeId: string, doubleShiftAllowed: boolean) => {
  const headers = await getAuthHeaders();
  return request<{
    success: boolean;
    message: string;
    data?: EmployeeWithDoubleShift;
  }>(`/hr/employees/${employeeId}/double-shift`, {
    method: 'PUT',
    headers,
    body: { doubleShiftAllowed },
  });
};
