import API_CONFIG from '../config';

const BASE_URL = API_CONFIG.baseURL + "/api/v1";

export const API = {
  BASE: BASE_URL,
  AUTH: `${BASE_URL}/auth`,
  HR: `${BASE_URL}/hr`,
  EMPLOYEE: `${BASE_URL}`,
  ADMIN: `${BASE_URL}/admin-dashboard`,
};
