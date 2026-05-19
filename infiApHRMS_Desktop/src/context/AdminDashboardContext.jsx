import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../utils/axios';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

const AdminDashboardContext = createContext();

const normalizeSummary = (data = {}, fallbacks = {}) => ({
  totalDepartments: Number(data.totalDepartments ?? data.departments ?? fallbacks.departments ?? 0),
  departments: Number(data.departments ?? data.totalDepartments ?? fallbacks.departments ?? 0),
  totalEmployees: Number(data.totalEmployees ?? data.employees ?? fallbacks.employees ?? 0),
  employees: Number(data.employees ?? data.totalEmployees ?? fallbacks.employees ?? 0),
  activeEmployees: Number(data.activeEmployees ?? data.activeStaff ?? fallbacks.activeEmployees ?? fallbacks.activeStaff ?? 0),
  activeStaff: Number(data.activeStaff ?? data.activeEmployees ?? fallbacks.activeStaff ?? fallbacks.activeEmployees ?? 0),
  activeJobs: Number(data.activeJobs ?? data.openJobs ?? fallbacks.activeJobs ?? 0),
  openJobs: Number(data.openJobs ?? data.activeJobs ?? fallbacks.activeJobs ?? 0),
  teams: Number(data.teams ?? fallbacks.teams ?? 0),
  pendingLeaves: Number(data.pendingLeaves ?? fallbacks.pendingLeaves ?? 0),
  monthlyPayroll: Number(data.monthlyPayroll ?? 0),
  openPositions: Number(data.openPositions ?? data.activeJobs ?? fallbacks.activeJobs ?? 0),
  newHires: Number(data.newHires ?? 0),
  announcements: Number(data.announcements ?? 0),
  resignations: Number(data.resignations ?? data.totalResignations ?? fallbacks.resignations ?? 0)
});

const normalizeDepartment = (department) => ({
  id: department.id || department._id,
  name: department.name || department.departmentName || 'Unnamed Department',
  sub: String(
    department.sub ||
    department.category ||
    department.departmentCategory ||
    department.name ||
    'Department'
  )
    .toUpperCase()
    .slice(0, 18),
  head:
    department.head?.name ||
    department.departmentHead?.name ||
    department.departmentHead ||
    department.head ||
    'Unassigned',
  teams: Math.max(
    Number(department.teamCount || 0),
    Number(department.numberOfTeams || 0),
    Number(department.teams || 0)
  ),
  employees: Math.max(
    Number(department.employeeCount || 0),
    Number(department.totalEmployees || 0),
    Number(department.employees || 0)
  ),
  color: department.color || 'indigo',
  description: department.description || ''
});

const normalizeTeam = (team) => {
  const memberList = Array.isArray(team.members) ? team.members : [];
  const memberIds = memberList.map((member) => (
    typeof member === 'string' ? member : (member?._id || member?.id)
  )).filter(Boolean);
  
  return {
    id: team.id || team._id,
    name: team.name || team.teamName || 'Unnamed Team',
    lead: team.lead?.name || team.lead || 'Unassigned',
    leadId: team.lead?._id || team.lead?.id || team.lead || null,
    members: team.totalMembers || memberList.length || 0,
    memberIds,
    type: team.type || team.departmentName || 'General',
    keyMembers: memberList.map(m => ({
      id: typeof m === 'string' ? m : (m?._id || m?.id),
      name: typeof m === 'string' ? 'Assigned Employee' : (m?.name || 'Unknown'),
      role: typeof m === 'string' ? 'Member' : (m?.designation || 'Member'),
      status: typeof m === 'string' ? 'Active' : (m?.status || 'Active'),
      img: typeof m === 'string'
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent('U')}&background=random&color=fff`
        : (m?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(m?.name || 'U')}&background=random&color=fff`)
    })),
    departmentId: team.departmentId || team.department_id || (typeof team.department === 'string' ? team.department : (team.department?._id || team.department?.id)) || null,
    departmentName: team.departmentName || (typeof team.department === 'string' ? '' : team.department?.name) || ''
  };
};

const normalizeJob = (job) => {
  const status = String(job.status || '').toLowerCase();

  return {
    id: job.id || job._id,
    title: job.title,
    department: job.department,
    type: job.type || 'Full-time',
    experience: job.experience || 'Mid (3-5 years)',
    location: job.location || 'Remote',
    status: status === 'open' ? 'Active' : (job.status || 'Active'),
    applicants: Number(job.applicants) || 0,
    postedDate: job.postedDate || job.createdAt || new Date().toISOString().slice(0, 10),
    deadline: job.deadline || null
  };
};

export const AdminDashboardProvider = ({ children }) => {
  const { role, user } = useAuth();
  const { addToast } = useNotifications();

  const isAdmin = role === 'Admin';
  const hrDepartmentId = user?.department?._id || user?.department?.id || user?.departmentId || user?.department || null;
  const hrDepartmentName = user?.department?.name || user?.departmentName || user?.department || null;
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(normalizeSummary({}, {
    departments: 0,
    teams: 0,
    activeStaff: 0,
    activeJobs: 0,
    pendingLeaves: 0,
    announcements: 0,
    resignations: 0
  }));
  const [insights, setInsights] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [staffDirectory, setStaffDirectory] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [activities, setActivities] = useState([]);
  const [resignations, setResignations] = useState([]);

  const isAdminView = ['admin', 'main admin', 'hr'].includes(String(role || '').toLowerCase());

  const fetchSummary = async () => {
    const fallback = {
      departments: departments.length,
      teams: teams.length,
      employees: staffDirectory.length,
      activeStaff: staffDirectory.filter(e => e.status === 'Active').length,
      activeEmployees: staffDirectory.filter(e => e.status === 'Active').length,
      activeJobs: jobs.filter((job) => job.status === 'Active').length,
      pendingLeaves: pendingLeaves.length,
      resignations: resignations.length
    };

    try {
      const res = await api.get('/admin-dashboard/summary');
      const normalized = normalizeSummary(res.data?.data || {}, fallback);
      setSummary(normalized);
      return normalized;
    } catch (error) {
      const normalized = normalizeSummary({}, fallback);
      setSummary(normalized);
      return normalized;
    }
  };

  const fetchInsights = async () => {
    try {
      const res = await api.get('/admin-dashboard/insights');
      setInsights(res.data?.data || null);
      return res.data?.data;
    } catch (error) {
      setInsights(null);
      return null;
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/admin-dashboard/departments');
      let mapped = (res.data?.data || []).map(normalizeDepartment);
      console.log('[fetchDepartments] raw count:', mapped.length, '| hrDepartmentId:', hrDepartmentId, '| hrDepartmentName:', hrDepartmentName, '| isAdmin:', isAdmin);

      if (!isAdmin && hrDepartmentId) {
        const filtered = mapped.filter(d =>
          String(d.id) === String(hrDepartmentId) ||
          String(d.name).toLowerCase() === String(hrDepartmentName).toLowerCase()
        );
        console.log('[fetchDepartments] filtered count:', filtered.length);

        // Safety fallback: if filtering wipes everything, show all departments
        // so the page isn't blank (likely a data mismatch)
        if (filtered.length === 0 && mapped.length > 0) {
          console.warn('[fetchDepartments] HR filter returned 0 departments. Falling back to all.');
          mapped = mapped;
        } else {
          mapped = filtered;
        }
      }

      setDepartments(mapped);
      return mapped;
    } catch (error) {
      console.error('[fetchDepartments] error:', error);
      return departments;
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await api.get('/admin-dashboard/teams');
      
      let allTeams = [];
      if (res.data?.data && Array.isArray(res.data.data.departments)) {
         // Flatten teams from all departments
         res.data.data.departments.forEach(dept => {
            if (Array.isArray(dept.teams)) {
               dept.teams.forEach(team => {
                 allTeams.push({
                   ...team,
                   departmentName: dept.departmentName || dept.name,
                   departmentId: dept.departmentId || dept._id || dept.id
                 });
               });
            }
         });
      } else if (res.data?.data && Array.isArray(res.data.data)) {
         allTeams = res.data.data;
      } else if (Array.isArray(res.data)) {
         allTeams = res.data;
      }
      
      let mapped = allTeams.map(normalizeTeam);
      if (!isAdmin && hrDepartmentId) {
        const filtered = mapped.filter(t =>
          String(t.departmentId) === String(hrDepartmentId) ||
          String(t.departmentName).toLowerCase() === String(hrDepartmentName).toLowerCase()
        );
        // Safety fallback: if filtering wipes everything, show all teams
        // so the page isn't blank (likely a data mismatch)
        if (filtered.length === 0 && mapped.length > 0) {
          console.warn('[fetchTeams] HR filter returned 0 teams. Falling back to all.');
        } else {
          mapped = filtered;
        }
      }
      setTeams(mapped);
      return mapped;
    } catch (error) {
      // Silent error - using fallback data
      return teams;
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await api.get('/admin-dashboard/jobs');
      const mapped = (res.data?.data || []).map(normalizeJob);
      setJobs(mapped);
      return mapped;
    } catch (error) {
      return jobs;
    }
  };

  const fetchStaffDirectory = async () => {
    try {
      const res = await api.get('/admin-dashboard/staff-directory');
      let data = res.data?.data || [];
      if (!isAdmin && hrDepartmentId) {
        data = data.filter(emp => {
          const empDept = emp.department?.name || emp.department || emp.departmentName || '';
          const empDeptId = emp.department?._id || emp.department?.id || emp.departmentId || '';
          return String(empDeptId) === String(hrDepartmentId) ||
                 String(empDept).toLowerCase() === String(hrDepartmentName).toLowerCase();
        });
      }
      setStaffDirectory(data);
      return data;
    } catch (error) {
      return staffDirectory;
    }
  };

  const fetchPendingLeaves = async () => {
    try {
      const res = await api.get('/admin-dashboard/leaves/pending');
      const data = res.data?.data || [];
      setPendingLeaves(data);
      return data;
    } catch (error) {
      return pendingLeaves;
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await api.get('/admin-dashboard/activities');
      const data = res.data?.data || [];
      setActivities(data);
      return data;
    } catch (error) {
      return activities;
    }
  };
  
  const fetchResignations = async () => {
    try {
      const res = await api.get('/hr/resignation/register');
      const data = res.data?.data || res.data || [];
      setResignations(data);
      return data;
    } catch (error) {
      return resignations;
    }
  };

  const addDepartment = async (payload) => {
    const parsedTeams = Number(payload.teams);
    const requestPayload = {
      departmentName: payload.name,
      name: payload.name,
      description: payload.description,
      departmentHead: payload.manager,
      head: payload.manager,
      departmentCategory: 'tech',
      category: 'tech',
      numberOfTeams: Number.isNaN(parsedTeams) ? 0 : parsedTeams,
      teams: Number.isNaN(parsedTeams) ? 0 : parsedTeams,
      color: 'indigo'
    };

    try {
      const res = await api.post('/admin-dashboard/departments', requestPayload);
      const created = normalizeDepartment(res.data?.data || requestPayload);
      setDepartments((prev) => [created, ...prev]);
      await silentRefreshAll();
      addToast('success', 'Department created successfully!');
      return { success: true, data: created };
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to create department';
      addToast('error', msg);
      return {
        success: false,
        error: msg
      };
    }
  };

  const updateDepartment = async (deptId, payload) => {
    try {
      const res = await api.patch(`/admin-dashboard/departments/${deptId}`, payload);
      const updated = normalizeDepartment(res.data?.data || payload);
      setDepartments((prev) => prev.map((dept) => (String(dept.id) === String(deptId) ? updated : dept)));
      await silentRefreshAll();
      addToast('success', 'Department updated successfully!');
      return { success: true, data: updated };
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to update department';
      addToast('error', msg);
      return {
        success: false,
        error: msg
      };
    }
  };

  const deleteDepartment = async (deptId) => {
    try {
      await api.delete(`/admin-dashboard/departments/${deptId}`);
      setDepartments((prev) => prev.filter((dept) => String(dept.id) !== String(deptId)));
      await silentRefreshAll();
      addToast('success', 'Department deleted successfully');
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to delete department';
      addToast('error', msg);
      return {
        success: false,
        error: msg
      };
    }
  };

  const requestDepartmentDelete = async (deptId) => {
    try {
      const res = await api.post(`/admin-dashboard/departments/${deptId}/request-delete`);
      addToast('info', res.data?.message || 'Deletion request sent for admin approval');
      return { success: true, data: res.data?.data };
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to request department deletion';
      addToast('error', msg);
      return { success: false, error: msg };
    }
  };

  const fetchDepartmentDeletionRequests = async () => {
    try {
      const res = await api.get('/admin-dashboard/department-deletion-requests');
      return { success: true, data: res.data?.data || [] };
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to fetch deletion requests';
      return { success: false, error: msg };
    }
  };

  const approveDepartmentDeletion = async (requestId) => {
    try {
      await api.post(`/admin-dashboard/department-deletion-requests/${requestId}/approve`);
      await silentRefreshAll();
      addToast('success', 'Department deletion approved and removed');
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to approve deletion';
      addToast('error', msg);
      return { success: false, error: msg };
    }
  };

  const rejectDepartmentDeletion = async (requestId) => {
    try {
      await api.post(`/admin-dashboard/department-deletion-requests/${requestId}/reject`);
      addToast('success', 'Department deletion request rejected');
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to reject deletion';
      addToast('error', msg);
      return { success: false, error: msg };
    }
  };

  const addTeam = async (payload) => {
    const requestPayload = {
      name: payload.name,
      departmentId: payload.department,
      lead: payload.lead,
      capacity: Number(payload.capacity) || 0,
      mission: payload.mission
    };

    try {
      const res = await api.post('/admin-dashboard/teams', requestPayload);
      const created = normalizeTeam(res.data?.data || requestPayload);
      setTeams((prev) => [created, ...prev]);
      await silentRefreshAll();
      addToast('success', 'Team created successfully!');
      return { success: true, data: created };
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to create team';
      addToast('error', msg);
      return {
        success: false,
        error: msg
      };
    }
  };

  const updateTeam = async (teamId, payload) => {
    try {
      const res = await api.patch(`/admin-dashboard/teams/${teamId}`, payload);
      const updated = normalizeTeam(res.data?.data || payload);
      setTeams((prev) => prev.map((team) => (String(team.id) === String(teamId) ? updated : team)));
      await silentRefreshAll();
      addToast('success', 'Team updated successfully!');
      return { success: true, data: updated };
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to update team';
      addToast('error', msg);
      return {
        success: false,
        error: msg
      };
    }
  };

  const deleteTeam = async (teamId) => {
    try {
      await api.delete(`/admin-dashboard/teams/${teamId}`);
      setTeams((prev) => prev.filter((team) => String(team.id) !== String(teamId)));
      await silentRefreshAll();
      addToast('success', 'Team deleted successfully');
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to delete team';
      addToast('error', msg);
      return {
        success: false,
        error: msg
      };
    }
  };

  const addJob = async (payload) => {
    // Map experience string label to a year number that the backend requires
    const expMap = {
      'Entry (0-2 years)': 1,
      'Mid (3-5 years)': 4,
      'Senior (6+ years)': 7,
      'Lead / Principal': 10
    };
    const experienceYears = expMap[payload.experience] ?? Number(payload.experience) ?? 1;

    const requestPayload = {
      title: payload.title,
      department: payload.department,
      type: payload.type,
      description: payload.description || `${payload.title} - Job Opening`,
      experienceYears,
      location: payload.location || 'Remote',
      closingDate: payload.deadline || undefined,
      status: 'Open',
      requirements: Array.isArray(payload.skills) ? payload.skills : []
    };

    console.log('[addJob] Sending payload:', requestPayload);

    try {
      const res = await api.post('/admin-dashboard/jobs', requestPayload);
      console.log('[addJob] Success:', res.data);
      const created = normalizeJob(res.data?.data || requestPayload);
      setJobs((prev) => [created, ...prev]);
      await silentRefreshAll();
      addToast('success', 'Job posted successfully!');
      return { success: true, data: created };
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to post job';
      addToast('error', msg);
      return {
        success: false,
        error: msg
      };
    }
  };

  const updateJob = async (jobId, payload) => {
    let experienceYears = payload.experienceYears;
    if (payload.experience && !experienceYears) {
      const expMap = {
        'Entry (0-2 years)': 1,
        'Mid (3-5 years)': 4,
        'Senior (6+ years)': 7,
        'Lead / Principal': 10
      };
      experienceYears = expMap[payload.experience] ?? Number(payload.experience) ?? 1;
    }

    const requestPayload = {
      title: payload.title,
      department: payload.department,
      type: payload.type,
      description: payload.description,
      experienceYears,
      location: payload.location,
      closingDate: payload.deadline,
      status: payload.status,
      requirements: Array.isArray(payload.skills) ? payload.skills : payload.requirements
    };

    try {
      const res = await api.patch(`/admin-dashboard/jobs/${jobId}`, requestPayload);
      const updated = normalizeJob(res.data?.data || payload);
      setJobs((prev) => prev.map((j) => (String(j.id) === String(jobId) ? updated : j)));
      await silentRefreshAll();
      addToast('success', 'Job updated successfully!');
      return { success: true, data: updated };
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to update job';
      addToast('error', msg);
      return {
        success: false,
        error: msg
      };
    }
  };

  const deleteJob = async (jobId) => {
    try {
      await api.delete(`/admin-dashboard/jobs/${jobId}`);
      setJobs((prev) => prev.filter((j) => String(j.id) !== String(jobId)));
      await silentRefreshAll();
      addToast('success', 'Job deleted successfully');
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to delete job';
      addToast('error', msg);
      return {
        success: false,
        error: msg
      };
    }
  };

  const silentRefreshAll = async () => {
    if (!isAdminView) {
      return;
    }
    try {
      await Promise.all([
        fetchDepartments(),
        fetchTeams(),
        fetchJobs(),
        fetchStaffDirectory(),
        fetchPendingLeaves(),
        fetchActivities(),
        fetchInsights(),
        fetchResignations()
      ]);
      await fetchSummary();
    } catch (error) {
      console.error('Failed to silently refresh dashboard data:', error);
    }
  };

  const refreshAll = async () => {
    if (!isAdminView) {
      return;
    }

    setLoading(true);
    try {
      await Promise.all([
        fetchDepartments(),
        fetchTeams(),
        fetchJobs(),
        fetchStaffDirectory(),
        fetchPendingLeaves(),
        fetchActivities(),
        fetchInsights(),
        fetchResignations()
      ]);
      await fetchSummary();
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminView]);

  const totals = useMemo(() => ({
    deptCount: departments.length,
    teamCount: teams.length,
    activeCount: jobs.filter((job) => job.status === 'Active').length,
    totalApplicants: jobs.reduce((acc, current) => acc + (current.applicants || 0), 0)
  }), [departments, teams, jobs]);

  const contextValue = useMemo(() => ({
    loading,
    summary,
    insights,
    departments,
    teams,
    jobs,
    staffDirectory,
    pendingLeaves,
    activities,
    resignations,
    totals,
    refreshAll,
    silentRefreshAll,
    fetchSummary,
    fetchInsights,
    fetchDepartments,
    fetchTeams,
    fetchJobs,
    fetchStaffDirectory,
    fetchPendingLeaves,
    fetchActivities,
    fetchResignations,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    requestDepartmentDelete,
    fetchDepartmentDeletionRequests,
    approveDepartmentDeletion,
    rejectDepartmentDeletion,
    addTeam,
    updateTeam,
    deleteTeam,
    addJob,
    updateJob,
    deleteJob
  }), [
    loading, summary, insights, departments, teams, jobs, staffDirectory,
    pendingLeaves, activities, resignations, totals
  ]);

  return (
    <AdminDashboardContext.Provider value={contextValue}>
      {children}
    </AdminDashboardContext.Provider>
  );
};

export const useAdminDashboard = () => {
  const context = useContext(AdminDashboardContext);

  if (!context) {
    throw new Error('useAdminDashboard must be used within an AdminDashboardProvider');
  }

  return context;
};
