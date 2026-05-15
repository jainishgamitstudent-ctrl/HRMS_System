import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

// Redirects /profile to the current authenticated employee profile route
const MyProfile = () => {
  const { user } = useAuth();

  if (!user || !user.id) return <Navigate to="/login" replace />;

  return <Navigate to={`/employees/profile/${user.id}`} replace />;
};

export default MyProfile;
