import { API_BASE_URL } from '../constants/api';
import { getAuthHeaders } from './auth';

const buildUrl = (path: string) => `${API_BASE_URL}${path}`;

export interface PerformanceData {
  monthlyScore: number;
  month: string;
  coreMetrics: {
    efficiency: number;
    quality: number;
    reliability: number;
  };
  goalsTracking: {
    id: number;
    title: string;
    progress: number;
    status: string;
  }[];
  feedback: {
    date: string;
    type: string;
    message: string;
    from: string;
  }[];
  achievements: {
    date: string;
    title: string;
    description: string;
  }[];
}

export interface PerformanceTrendItem {
  month: string;
  avgScore: number;
}

export interface PerformanceTrendResponse {
  success: boolean;
  data: PerformanceTrendItem[];
}

export const fetchEmployeePerformance = async (): Promise<{ status: string; statusCode: number; data: PerformanceData }> => {
  const headers = await getAuthHeaders();
  const response = await fetch(buildUrl('/performance/current'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
  });
  const rawText = await response.text();
  console.log('[Performance] response status:', response.status, 'body preview:', rawText.slice(0, 120));
  const data = rawText ? JSON.parse(rawText) : {};
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Failed to fetch performance data');
  }
  return data;
};

export const fetchPerformanceTrends = async (): Promise<PerformanceTrendResponse> => {
  const headers = await getAuthHeaders();
  const response = await fetch(buildUrl('/hr/performance/report/trends'), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
  });
  const rawText = await response.text();
  console.log('[Performance Trends] response status:', response.status, 'body preview:', rawText.slice(0, 120));
  const data = rawText ? JSON.parse(rawText) : {};
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Failed to fetch performance trends');
  }
  return data;
};
