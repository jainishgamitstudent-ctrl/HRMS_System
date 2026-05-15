import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const normalizeRole = (role) => {
    const value = (role || '').toString().trim().toLowerCase();

    if (value === 'main admin') return 'Main Admin';
    if (value === 'admin') return 'Admin';
    if (value === 'hr') return 'HR';

    return role || null;
};

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();
    const normalizedRole = normalizeRole(user?.role);

    if (loading) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50">
                <div className="w-16 h-16 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Initializing Identity Node...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login but save the current location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(normalizedRole)) {
        // Role not authorized - redirect to a specific page or dashboard
        // For now, redirecting to the main dashboard of their respective role
        if (normalizedRole === 'Main Admin') return <Navigate to="/main-admin" replace />;
        if (normalizedRole === 'Admin') return <Navigate to="/admin" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
