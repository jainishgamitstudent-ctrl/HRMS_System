import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthApiUser, fetchEmployeeProfile, getStoredAuthSession } from '../services/auth';

export interface UserProfile {
  _id?: string;
  name: string;
  role: string;
  systemRole: 'employee' | 'manager' | 'hr' | 'admin' | 'main_admin';
  avatar: string | number;
  employeeId: string;
  email: string;
  department: string;
  joiningDate: string;
  dob?: string;
  phone?: string;
  address?: string;
  doubleShiftAllowed: boolean;
  settings: {
    darkMode: boolean;
    language: string;
    pushNotifications: boolean;
    emailReports: boolean;
    twoFactorEnabled: boolean;
  };
}

interface UserContextType {
  user: UserProfile;
  isHydrating: boolean;
  isAuthenticated: boolean;
  updateUser: (updates: Partial<UserProfile>) => void;
  updateSettings: (updates: Partial<UserProfile['settings']>) => void;
  clearUserSession: () => void;
  syncUserFromApi: (apiUser: AuthApiUser & { phone?: string; address?: string; avatar?: string; profileImage?: string; systemRole?: UserProfile['systemRole']; role?: string; }) => void;
}

const defaultUser: UserProfile = {
  name: 'Sneha Desai',
  role: 'Senior Product Designer',
  systemRole: 'employee',
  avatar: require('../assets/images/sneha.png'),
  employeeId: 'INF-9402',
  email: 'sneha.d@infiap.com',
  department: 'Product Design',
  joiningDate: 'Jan 12, 2021',
  doubleShiftAllowed: false,
  settings: {
    darkMode: false,
    language: 'English (US)',
    pushNotifications: true,
    emailReports: false,
    twoFactorEnabled: true,
  },
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const syncUserFromApi: UserContextType['syncUserFromApi'] = (apiUser) => {
    setIsAuthenticated(true);
    setUser((prev) => ({
      ...prev,
      _id: apiUser._id || prev._id,
      name: apiUser.name || prev.name,
      role: apiUser.designation || apiUser.role || prev.role,
      systemRole: (apiUser.systemRole || apiUser.role || prev.systemRole) as UserProfile['systemRole'],
      email: apiUser.email || prev.email,
      employeeId: apiUser.employeeId || prev.employeeId,
      department: apiUser.department || prev.department,
      dob: apiUser.dob ?? prev.dob,
      joiningDate: (() => {
        if (!apiUser.joiningDate) return prev.joiningDate;
        const parsed = new Date(apiUser.joiningDate);
        if (isNaN(parsed.getTime())) {
          // Backend may already return a pre-formatted string; keep as-is.
          return typeof apiUser.joiningDate === 'string' && apiUser.joiningDate.trim()
            ? apiUser.joiningDate
            : prev.joiningDate;
        }
        return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      })(),
      phone: apiUser.phone ?? prev.phone,
      address: apiUser.address ?? prev.address,
      avatar: apiUser.profileImage || apiUser.avatar || prev.avatar,
      doubleShiftAllowed: apiUser.doubleShiftAllowed ?? prev.doubleShiftAllowed,
    }));
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const updateSettings = (updates: Partial<UserProfile['settings']>) => {
    setUser((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
  };

  const clearUserSession = () => {
    setIsAuthenticated(false);
    setUser(defaultUser);
  };

  useEffect(() => {
    const hydrateUser = async () => {
      try {
        const session = await getStoredAuthSession();
        if (session?.user) {
          syncUserFromApi(session.user);
        } else {
          setIsAuthenticated(false);
        }

        if (session?.token) {
          try {
            const response = await fetchEmployeeProfile();
            syncUserFromApi({
              _id: response.data.id,
              ...response.data,
              role: response.data.systemRole,
              designation: response.data.role,
              profileImage: response.data.avatar,
            });
          } catch (error) {
            console.warn('Unable to refresh profile from API:', error);
          }
        }
      } finally {
        setIsHydrating(false);
      }
    };

    hydrateUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        isHydrating,
        isAuthenticated,
        updateUser,
        updateSettings,
        clearUserSession,
        syncUserFromApi,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
