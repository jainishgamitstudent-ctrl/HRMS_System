import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axios';

const PolicyContext = createContext();

export const usePolicyContext = () => {
    const context = useContext(PolicyContext);
    if (!context) {
        throw new Error('usePolicyContext must be used within a PolicyProvider');
    }
    return context;
};

export const PolicyProvider = ({ children }) => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPolicies = async () => {
        setLoading(true);
        try {
            const res = await api.get('/policies');
            setPolicies(res.data.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch policies');
        } finally {
            setLoading(false);
        }
    };

    const addPolicy = async (policyData) => {
        try {
            const res = await api.post('/policies', policyData);
            setPolicies([res.data.data, ...policies]);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'An error occurred' };
        }
    };

    const removePolicy = async (id) => {
        try {
            await api.delete(`/policies/${id}`);
            setPolicies(policies.filter(policy => policy._id !== id));
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error || 'An error occurred' };
        }
    };

    return (
        <PolicyContext.Provider value={{
            policies,
            loading,
            error,
            fetchPolicies,
            addPolicy,
            removePolicy
        }}>
            {children}
        </PolicyContext.Provider>
    );
};
