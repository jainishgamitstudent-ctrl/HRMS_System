import { API_BASE_URL } from '../constants/api';
import { getStoredAuthSession } from './auth';

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

const request = async <T>(path: string, options: { method?: string; headers?: Record<string, string>; body?: unknown } = {}): Promise<T> => {
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

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const session = await getStoredAuthSession();
  if (!session?.token) {
    throw new ApiError('You are not signed in.');
  }
  return { Authorization: `Bearer ${session.token}` };
};

export type RequestRoomMessage = {
  sender: { _id: string; name: string; profile_image?: string; role?: string } | string;
  text: string;
  createdAt: string;
};

export type RequestRoom = {
  _id: string;
  title: string;
  description: string;
  requestType: 'leave' | 'general';
  leaveType?: string;
  requestData: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: { _id: string; name: string; profile_image?: string; employeeId?: string; department?: string; designation?: string } | string;
  participants: Array<{ _id: string; name: string; profile_image?: string; role?: string } | string>;
  messages: RequestRoomMessage[];
  relatedLeaveId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export const fetchMyRequestRooms = async () => {
  const headers = await getAuthHeaders();
  return request<{ status: string; data: RequestRoom[] }>('/request-rooms/my-rooms', {
    method: 'GET',
    headers,
  });
};

export const fetchRequestRoomById = async (id: string) => {
  const headers = await getAuthHeaders();
  return request<{ status: string; data: RequestRoom }>(`/request-rooms/${id}`, {
    method: 'GET',
    headers,
  });
};

export const updateRequestRoomStatus = async (id: string, status: 'approved' | 'rejected', messageText?: string) => {
  const headers = await getAuthHeaders();
  return request<{ status: string; data: RequestRoom }>(`/request-rooms/${id}/status`, {
    method: 'PATCH',
    headers,
    body: { status, messageText },
  });
};

export const addRequestRoomMessage = async (id: string, text: string) => {
  const headers = await getAuthHeaders();
  return request<{ status: string; data: RequestRoom }>(`/request-rooms/${id}/messages`, {
    method: 'POST',
    headers,
    body: { text },
  });
};
