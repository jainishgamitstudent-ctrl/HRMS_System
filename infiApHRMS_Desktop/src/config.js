// Environment configuration for API URLs
// Use relative paths - Vite proxy handles the routing

const getApiUrl = () => {
  // Use relative path so Vite proxy handles it (works across devices)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Default to relative path - proxy to backend
  return '';
};

export const API_CONFIG = {
  baseURL: getApiUrl(),
  uploadsURL: '/uploads',
  socketURL: '',
};

export default API_CONFIG;