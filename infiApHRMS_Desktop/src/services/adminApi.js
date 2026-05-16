import api from '../utils/axios';

export const getAdminProfile = () => api.get('/admin-dashboard/profile');
export const updateAdminProfile = (data) => api.patch('/admin-dashboard/profile', data);
export const getAdminDashboardStats = () => api.get('/admin-dashboard/summary');
export const getCompanyEmployees = () => api.get('/admin-dashboard/staff-directory');
export const getCompanyDepartments = () => api.get('/admin-dashboard/departments');
export const getCompanyTeams = () => api.get('/admin-dashboard/teams');
export const getCompanySettings = () => api.get('/admin-dashboard/settings');
export const updateCompanySettings = (data) => api.patch('/admin-dashboard/settings', data);
export const getAdminInsights = () => api.get('/admin-dashboard/insights');
export const getAdminActivities = () => api.get('/admin-dashboard/activities');

export default {
  getAdminProfile,
  updateAdminProfile,
  getAdminDashboardStats,
  getCompanyEmployees,
  getCompanyDepartments,
  getCompanyTeams,
  getCompanySettings,
  updateCompanySettings,
  getAdminInsights,
  getAdminActivities,
};