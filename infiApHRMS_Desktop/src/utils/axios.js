import axios from 'axios';
import { tokenStore } from '../services/tokenStore';

const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true // Send cookies with requests
});

// Add a request interceptor to handle FormData and add auth token
api.interceptors.request.use(
    (config) => {
        const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;

        if (isFormData) {
            delete config.headers['Content-Type'];
            delete config.headers['content-type'];
        }

        // Add token from store as fallback when cookies don't work
        const token = tokenStore.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor for automatic logout on 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid — clear store and redirect to login
            tokenStore.clearToken();
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
