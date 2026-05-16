import React, { createContext, useContext, useState } from 'react';

const DepartmentContext = createContext();

export const useDepartmentContext = () => {
  const context = useContext(DepartmentContext);
  if (!context) {
    throw new Error('useDepartmentContext must be used within a DepartmentProvider');
  }
  return context;
};

export const DepartmentProvider = ({ children }) => {
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);

  const addDepartment = (newDept) => {
    // Map manager ID to name for display
    const managerMap = {
      'rahul': 'Rahul Sharma',
      'priya': 'Priya Kapur',
      'amit': 'Amit Verma'
    };

    const formattedDept = {
      name: newDept.name,
      sub: 'NEW UNIT',
      head: managerMap[newDept.manager] || newDept.manager,
      teams: parseInt(newDept.teams) || 0,
      employees: 0,
      color: 'indigo' // Default color for new depts
    };

    setDepartments(prev => [...prev, formattedDept]);
  };

  const addTeam = (newTeam) => {
    // Lead map for display names
    const leadMap = {
      'sneha': 'Sneha Desai',
      'rohan': 'Rohan Sharma',
      'vikas': 'Vikas Roy'
    };

    const formattedTeam = {
      name: newTeam.name,
      lead: leadMap[newTeam.lead] || newTeam.lead,
      members: 0, // New teams start empty
      type: newTeam.department === 'engineering' ? 'Development' : 
            newTeam.department === 'marketing' ? 'Design' : 'Development',
      keyMembers: []
    };

    setTeams(prev => [...prev, formattedTeam]);
  };

  const totals = {
    deptCount: departments.length,
    teamCount: departments.reduce((acc, current) => acc + current.teams, 0)
  };

  return (
    <DepartmentContext.Provider value={{ departments, addDepartment, teams, addTeam, totals }}>
      {children}
    </DepartmentContext.Provider>
  );
};
