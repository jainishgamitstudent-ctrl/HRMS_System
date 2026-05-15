import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getEmployees, createEmployee as apiCreateEmployee, updateEmployee as apiUpdateEmployee, getEmployeeProfile as apiGetEmployeeProfile, deleteEmployee as apiDeleteEmployee } from '../services/hrApi';
import { useAuth } from './AuthContext';

const EmployeeContext = createContext();

export const useEmployeeContext = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('useEmployeeContext must be used within an EmployeeProvider');
  }
  return context;
};

export const EmployeeProvider = ({ children }) => {
  const { token } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 1,
  });

  // ── Fetch employees from API ───────────────────────────────────────────
  const fetchEmployees = useCallback(async (params = {}) => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await getEmployees({
        page: params.page || 1,
        limit: params.limit || 50,
        ...(params.status && { status: params.status }),
        ...(params.department && { department: params.department }),
      });
      
      const data = res.data;
      const employeeList = (data?.data || []).map(emp => ({
        id: emp._id || emp.id,
        _id: emp._id,
        employeeId: emp.employeeId || emp._id,
        name: emp.name || 'Unknown',
        email: emp.email || '',
        phone: emp.phone || '',
        // Backend stores job title as 'designation', not 'role'
        role: emp.designation || emp.role || 'Employee',
        department: emp.department || 'General',
        manager: emp.reportingManager?.name || emp.manager || '',
        status: emp.status || 'Active',
        joiningDate: emp.joiningDate || '',
        salary: emp.annualSalary || emp.salary || 0,
        location: emp.address || emp.location || '',
        // Backend stores profile pic as 'profileImage' — use real image, not random avatar
        avatar: emp.profileImage || emp.avatar || null,
      }));

      setEmployees(employeeList);
      setPagination({
        page: data.page || 1,
        limit: data.limit || 50,
        total: data.total || employeeList.length,
        pages: data.pages || 1,
      });

      return employeeList;
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Failed to fetch employees';
      setError(message);
      // Silent error - already set in state
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Auto-fetch when token is available
  useEffect(() => {
    if (token) {
      fetchEmployees();
    }
  }, [token, fetchEmployees]);

  // ── Add employee via API ───────────────────────────────────────────────
  const addEmployee = async (newEmployeeData) => {
    setError(null);
    try {
      const res = await apiCreateEmployee({
        employeeId: newEmployeeData.employeeId,
        name: newEmployeeData.name,
        email: newEmployeeData.email,
        phone: newEmployeeData.phone,
        department: newEmployeeData.department,
        designation: newEmployeeData.role,
        reportingManager: newEmployeeData.manager,
        joiningDate: newEmployeeData.joiningDate,
        annualSalary: newEmployeeData.salary,
        status: newEmployeeData.status || 'Active',
      });

      const created = res.data?.data;
      if (created) {
        // Add to local state without refetching
        const normalizedEmployee = {
          id: created._id || created.id,
          _id: created._id,
          employeeId: created.employeeId || created._id,
          name: created.name,
          email: created.email,
          phone: created.phone,
          role: created.designation || created.role,
          department: created.department,
          manager: created.reportingManager?.name || created.manager,
          status: created.status || 'Active',
          joiningDate: created.joiningDate,
          salary: created.annualSalary || created.salary,
          location: created.address || created.location || '',
          avatar: created.profileImage || created.avatar || newEmployeeData.avatar || null,
        };
        setEmployees(prev => [normalizedEmployee, ...prev]);
        return { success: true, data: normalizedEmployee };
      }
      return { success: true, data: created };
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Failed to add employee';
      setError(message);
      return { success: false, error: message };
    }
  };

  // ── Update employee via API ────────────────────────────────────────────
  const updateEmployee = async (id, updatedData) => {
    setError(null);
    try {
      // Only send fields that are present in updatedData
      const payload = {};
      if (updatedData.name !== undefined) payload.name = updatedData.name;
      if (updatedData.email !== undefined) payload.email = updatedData.email;
      if (updatedData.phone !== undefined) payload.phone = updatedData.phone;
      if (updatedData.department !== undefined) payload.department = updatedData.department;
      if (updatedData.role !== undefined) payload.designation = updatedData.role;
      // Only include reportingManager if it's a valid ObjectId format (24 char hex string)
      // This prevents sending string names that cause type mismatch errors
      if (updatedData.manager !== undefined) {
        const managerId = updatedData.manager;
        if (managerId && /^[0-9a-fA-F]{24}$/.test(managerId)) {
          payload.reportingManager = managerId;
        }
      }
      if (updatedData.joiningDate !== undefined) payload.joiningDate = updatedData.joiningDate;
      if (updatedData.salary !== undefined) payload.annualSalary = updatedData.salary;
      if (updatedData.status !== undefined) payload.status = updatedData.status;
      if (updatedData.location !== undefined) payload.address = updatedData.location;
      // Handle profile picture upload (File object or URL string)
      if (updatedData.profilePicture !== undefined) {
        payload.profilePicture = updatedData.profilePicture;
      }

      // Debug: updating employee
      const res = await apiUpdateEmployee(id, payload);
      // Debug: update response

      const updated = res.data?.data;
      if (updated) {
        setEmployees(prev =>
          prev.map(emp =>
            (emp._id === id || emp.id === id)
              ? {
                  ...emp,
                  ...updatedData,
                  profileImage: updated.profileImage || updatedData.profilePicture,
                  id: updated._id || updated.id,
                  _id: updated._id,
                }
              : emp
          )
        );
        return { success: true, data: updated };
      }
      return { success: true, data: updated };
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to update employee';
      // Silent error
      // Silent error
      setError(message);
      return { success: false, error: message };
    }
  };

  // ── Get single employee profile ────────────────────────────────────────
  const getProfile = async (id) => {
    try {
      const res = await apiGetEmployeeProfile(id);
      return res.data?.data || null;
    } catch (err) {
      // Silent error
      return null;
    }
  };
  
  // ── Delete employee via API ─────────────────────────────────────────────
  const deleteEmployee = async (id) => {
    setError(null);
    try {
      await apiDeleteEmployee(id);
      setEmployees(prev => prev.filter(emp => emp.id !== id && emp._id !== id));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Failed to delete employee';
      setError(message);
      return { success: false, error: message };
    }
  };

  // ── Remove from local state (soft delete) ──────────────────────────────
  const removeEmployee = (id) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id && emp._id !== id));
  };

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        loading,
        error,
        pagination,
        fetchEmployees,
        addEmployee,
        updateEmployee,
        removeEmployee,
        deleteEmployee,
        getProfile,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};
