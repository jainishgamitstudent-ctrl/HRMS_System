import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getRecruitmentJobs, createRecruitmentJob, updateRecruitmentJob, deleteRecruitmentJob } from '../services/hrApi';
import { useAuth } from './AuthContext';

const JobContext = createContext();

export const useJobContext = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobContext must be used within a JobProvider');
  }
  return context;
};

export const JobProvider = ({ children }) => {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch jobs from API
  const fetchJobs = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await getRecruitmentJobs();
      const data = (res.data?.data || []).map(job => ({
        id: job._id || job.id,
        title: job.title || 'Untitled',
        department: job.department || 'General',
        type: job.type || 'Full-time',
        experience: job.experienceYears === 1 ? 'Entry (0-2 years)' :
                    job.experienceYears === 4 ? 'Mid (3-5 years)' :
                    job.experienceYears === 7 ? 'Senior (6+ years)' :
                    job.experienceYears === 10 ? 'Lead / Principal' :
                    job.experience || 'Mid (3-5 years)',
        salary: job.salary || '',
        location: job.location || 'Remote',
        deadline: job.deadline || '',
        status: job.status || 'Active',
        applicants: Number(job.applicants) || 0,
        postedDate: job.postedDate || job.createdAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      }));
      setJobs(data);
    } catch (err) {
      // Silent error - using fallback data
      // Keep existing fallback data if API fails
      if (jobs.length === 0) {
        setJobs([
          {
            id: 'JOB-2024-001',
            title: 'Senior Frontend Engineer',
            department: 'Engineering',
            type: 'Full-time',
            experience: 'Senior (6+ years)',
            salary: '$140k - $180k',
            location: 'Bangalore / Remote',
            deadline: '2024-05-30',
            status: 'Active',
            applicants: 42,
            postedDate: '2023-10-15'
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchJobs();
  }, [token, fetchJobs]);

  // Add job via API
  const addJob = async (newJob) => {
    try {
      const expMap = {
        'Entry (0-2 years)': 1,
        'Mid (3-5 years)': 4,
        'Senior (6+ years)': 7,
        'Lead / Principal': 10
      };
      const experienceYears = expMap[newJob.experience] ?? Number(newJob.experience) ?? 1;

      const payload = {
        title: newJob.title,
        department: newJob.department,
        type: newJob.type,
        experienceYears,
        location: newJob.location,
        description: newJob.description,
        skills: newJob.skills,
        status: 'Open',
      };

      if (newJob.deadline) {
          payload.deadline = newJob.deadline;
      }

      const res = await createRecruitmentJob(payload);

      const created = res.data?.data;
      const formattedJob = {
        id: created?._id || `JOB-${Date.now()}`,
        ...newJob,
        status: 'Active',
        applicants: 0,
        postedDate: new Date().toISOString().split('T')[0],
      };
      setJobs(prev => [formattedJob, ...prev]);
      return { success: true, data: formattedJob };
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to create job';
      setError(message);
      // Add locally as fallback
      const fallback = {
        id: `JOB-local-${Date.now()}`,
        ...newJob,
        status: 'Active',
        applicants: 0,
        postedDate: new Date().toISOString().split('T')[0],
      };
      setJobs(prev => [fallback, ...prev]);
      return { success: false, data: fallback, error: message };
    }
  };

  // Update job via API
  const updateJob = async (id, updatedData) => {
    try {
      const expMap = {
        'Entry (0-2 years)': 1,
        'Mid (3-5 years)': 4,
        'Senior (6+ years)': 7,
        'Lead / Principal': 10
      };
      const payload = { ...updatedData };
      if (payload.experience) {
        payload.experienceYears = expMap[payload.experience] ?? Number(payload.experience) ?? 1;
        delete payload.experience;
      }
      await updateRecruitmentJob(id, payload);
      setJobs(prev => prev.map(j => j.id === id ? { ...j, ...updatedData } : j));
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update job');
      return { success: false, error: err.message };
    }
  };

  // Delete job via API
  const deleteJob = async (id) => {
    try {
      await deleteRecruitmentJob(id);
      setJobs(prev => prev.filter(j => j.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete job');
      return { success: false, error: err.message };
    }
  };

  const totals = useMemo(() => ({
    activeCount: jobs.filter(j => j.status === 'Active' || j.status === 'Open').length,
    totalApplicants: jobs.reduce((acc, current) => acc + (current.applicants || 0), 0),
  }), [jobs]);

  const contextValue = useMemo(() => ({
    jobs,
    addJob,
    updateJob,
    deleteJob,
    totals,
    loading,
    error,
    fetchJobs
  }), [jobs, totals, loading, error, fetchJobs]);

  return (
    <JobContext.Provider value={contextValue}>
      {children}
    </JobContext.Provider>
  );
};
