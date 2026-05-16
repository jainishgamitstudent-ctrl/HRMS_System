import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../utils/axios';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

const AdminDashboardContext = createContext();

const defaultDepartments = [
  {
    id: 'dept_fallback_1',
    name: 'Engineering',
    sub: 'TECH',
    head: 'Rahul Sharma',
    teams: 2,
    employees: 42,
    color: 'indigo'
  }
];

const defaultTeams = [
  {
    id: 'team_fallback_1',
    name: 'Frontend Team',
    lead: 'Sneha Desai',
    members: 12,
    type: 'Development',
    keyMembers: []
  }
];

const defaultJobs = [
  {
    id: 'job_fallback_1',
    title: 'Frontend Developer',
    department: 'Engineering',
    type: 'Full-time',
    experience: 'Mid (3-5 years)',
    location: 'Remote',
    status: 'Active',
    applicants: 0,
    postedDate: '2026-04-01'
  }
];

const normalizeSummary = (data = {}, fallbacks = {}) => ({
  totalDepartments: Number(data.totalDepartments ?? data.departments ?? fallbacks.departments ?? 0),
  departments: Number(data.departments ?? data.totalDepartments ?? fallbacks.departments ?? 0),
  totalEmployees: Number(data.totalEmployees ?? data.employees ?? fallbacks.employees ?? 0),
  employees: Number(data.employees ?? data.totalEmployees ?? fallbacks.employees ?? 0),
  activeJobs: Number(data.activeJobs ?? data.openJobs ?? fallbacks.activeJobs ?? 0),
  openJobs: Number(data.openJobs ?? data.activeJobs ?? fallbacks.activeJobs ?? 0),
  activeStaff: Number(data.activeStaff ?? fallbacks.activeStaff ?? 0),
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
  const { role } = useAuth();
  const { addToast } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(normalizeSummary({}, {
    departments: defaultDepartments.length,
    teams: defaultTeams.length,
    activeStaff: 0,
    activeJobs: defaultJobs.length,
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
      departments: departments.length || defaultDepartments.length,
      teams: teams.length || defaultTeams.length,
      employees: staffDirectory.length,
      activeStaff: staffDirectory.length,
      activeJobs: jobs.filter((job) => job.status === 'Active').length || defaultJobs.length,
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
      const mapped = (res.data?.data || []).map(normalizeDepartment);
      setDepartments(mapped);
      return mapped;
    } catch (error) {
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
      
      const mapped = allTeams.map(normalizeTeam);
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
      setJobs(mapped.length ? mapped : defaultJobs);
      return mapped;
    } catch (error) {
      return jobs;
    }
  };

  const fetchStaffDirectory = async () => {
    try {
      const res = await api.get('/admin-dashboard/staff-directory');
      const data = res.data?.data || [];
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
      await fetchDepartments();
      await fetchSummary();
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
      setDepartments((prev) => prev.map((dept) => (dept.id === deptId ? updated : dept)));
      await fetchDepartments();
      await fetchSummary();
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
      setDepartments((prev) => prev.filter((dept) => dept.id !== deptId));
      await fetchSummary();
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
      await fetchSummary();
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
      setTeams((prev) => prev.map((team) => (team.id === teamId ? updated : team)));
      await fetchTeams();
      await fetchSummary();
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
      setTeams((prev) => prev.filter((team) => team.id !== teamId));
      await fetchSummary();
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
      await fetchSummary();
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

  return (
    <AdminDashboardContext.Provider
      value={{
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
        addTeam,
        updateTeam,
        deleteTeam,
        addJob
      }}
    >
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
