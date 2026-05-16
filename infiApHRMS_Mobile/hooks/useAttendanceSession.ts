import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { AppState } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { fetchPunchStatus } from '../services/auth';

const STORAGE_KEY = 'employee-attendance-session-v1';

export type AttendanceSnapshot = {
  time: string;
  location?: string;
  latitude?: number;
  longitude?: number;
};

export type AttendanceSession = {
  dateKey: string;
  checkedIn: boolean;
  checkedOut: boolean;
  checkInSnapshot: AttendanceSnapshot | null;
  checkOutSnapshot: AttendanceSnapshot | null;
  todayPunchCount: number;
  doubleShiftEnabled: boolean;
};

const getDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const createEmptySession = (date = new Date()): AttendanceSession => ({
  dateKey: getDateKey(date),
  checkedIn: false,
  checkedOut: false,
  checkInSnapshot: null,
  checkOutSnapshot: null,
  todayPunchCount: 0,
  doubleShiftEnabled: false,
});

const normalizeSession = (value: Partial<AttendanceSession> | null | undefined, date = new Date()): AttendanceSession => {
  const todayKey = getDateKey(date);

  if (!value || value.dateKey !== todayKey) {
    return createEmptySession(date);
  }

  return {
    dateKey: todayKey,
    checkedIn: Boolean(value.checkedIn),
    checkedOut: Boolean(value.checkedOut),
    checkInSnapshot: value.checkInSnapshot ?? null,
    checkOutSnapshot: value.checkOutSnapshot ?? null,
    todayPunchCount: value.todayPunchCount ?? 0,
    doubleShiftEnabled: value.doubleShiftEnabled ?? false,
  };
};

const readStoredSession = async (date = new Date()) => {
  try {
    const rawValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return createEmptySession(date);
    }

    return normalizeSession(JSON.parse(rawValue), date);
  } catch {
    return createEmptySession(date);
  }
};

const persistSession = async (session: AttendanceSession) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

const loadSession = async (date = new Date()) => {
  const session = await readStoredSession(date);
  await persistSession(session);
  return session;
};

const syncSessionWithBackend = async (date = new Date()) => {
  try {
    const response = await fetchPunchStatus();
    const punchType = response.data.PunchType;
    const todayPunchCount = response.data.todayPunchCount ?? 0;

    // PunchType 3 means no punch/reset, or if no data exists
    if (punchType === 3 || !response.data.PunchDateTime || response.data.PunchDateTime === 'N/A') {
      // Reset local session since backend has no punch data
      const emptySession = createEmptySession(date);
      await persistSession(emptySession);
      return emptySession;
    }

    // If backend has check-in (PunchType 1) or check-out (PunchType 2), sync local state
    const localSession = await readStoredSession(date);
    const todayKey = getDateKey(date);

    if (localSession.dateKey !== todayKey) {
      // Different day, create new session
      return createEmptySession(date);
    }

    // Treat backend punch status as the source of truth. Local state can be stale
    // if a previous checkout was shown before the backend record was available.
    if (punchType === 1) {
      const syncedSession: AttendanceSession = {
        ...localSession,
        checkedIn: true,
        checkedOut: false,
        todayPunchCount,
        checkInSnapshot: localSession.checkInSnapshot ?? {
          time: response.data.PunchDateTime.split(' ')[1] || '',
        },
        checkOutSnapshot: null,
      };
      await persistSession(syncedSession);
      return syncedSession;
    } else if (punchType === 2) {
      const syncedSession: AttendanceSession = {
        ...localSession,
        checkedIn: true,
        checkedOut: true,
        todayPunchCount,
        checkOutSnapshot: localSession.checkOutSnapshot ?? {
          time: response.data.PunchDateTime.split(' ')[1] || '',
        },
      };
      await persistSession(syncedSession);
      return syncedSession;
    }

    return localSession;
  } catch (error) {
    // If sync fails, return local session
    return await readStoredSession(date);
  }
};

const getDelayUntilNextReset = () => {
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  return Math.max(1000, nextMidnight.getTime() - now.getTime() + 1000);
};

export const useAttendanceSession = () => {
  const [session, setSession] = useState<AttendanceSession>(createEmptySession());
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const nextSession = await syncSessionWithBackend();
    setSession(nextSession);
    setLoading(false);
    return nextSession;
  }, []);

  useEffect(() => {
    refreshSession();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refreshSession();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refreshSession]);

  useFocusEffect(
    useCallback(() => {
      refreshSession();
    }, [refreshSession])
  );

  useEffect(() => {
    if (loading) {
      return;
    }

    const timer = setTimeout(() => {
      refreshSession();
    }, getDelayUntilNextReset());

    return () => {
      clearTimeout(timer);
    };
  }, [loading, refreshSession, session.dateKey]);

  const recordCheckIn = useCallback(async (snapshot: AttendanceSnapshot) => {
    const currentSession = await loadSession();

    const isSecondShift = currentSession.checkedOut && currentSession.doubleShiftEnabled && currentSession.todayPunchCount < 4;

    if ((currentSession.checkedIn || currentSession.checkedOut) && !isSecondShift) {
      setSession(currentSession);
      return currentSession;
    }

    const nextSession: AttendanceSession = {
      ...currentSession,
      checkedIn: true,
      checkedOut: false,
      checkInSnapshot: snapshot,
      checkOutSnapshot: null,
      todayPunchCount: currentSession.todayPunchCount + 1,
    };

    await persistSession(nextSession);
    setSession(nextSession);
    return nextSession;
  }, []);

  const recordCheckOut = useCallback(async (snapshot: AttendanceSnapshot) => {
    const currentSession = await loadSession();

    if (!currentSession.checkedIn || currentSession.checkedOut) {
      setSession(currentSession);
      return currentSession;
    }

    const nextSession: AttendanceSession = {
      ...currentSession,
      checkedIn: true,
      checkedOut: true,
      checkOutSnapshot: snapshot,
      todayPunchCount: currentSession.todayPunchCount + 1,
    };

    await persistSession(nextSession);
    setSession(nextSession);
    return nextSession;
  }, []);

  const toggleDoubleShift = useCallback(async () => {
    const currentSession = await loadSession();
    const nextEnabled = !currentSession.doubleShiftEnabled;
    const nextSession: AttendanceSession = {
      ...currentSession,
      doubleShiftEnabled: nextEnabled,
    };
    await persistSession(nextSession);
    setSession(nextSession);
    return nextSession;
  }, []);

  const resetSession = useCallback(async () => {
    const emptySession = createEmptySession();
    await persistSession(emptySession);
    setSession(emptySession);
    return emptySession;
  }, []);

  const canCheckIn = (!session.checkedIn && !session.checkedOut) || (session.checkedOut && session.doubleShiftEnabled && session.todayPunchCount < 4);
  const canCheckOut = session.checkedIn && !session.checkedOut;
  const isLockedForToday = session.checkedOut && (!session.doubleShiftEnabled || session.todayPunchCount >= 4);

  return {
    session,
    loading,
    refreshSession,
    recordCheckIn,
    recordCheckOut,
    resetSession,
    toggleDoubleShift,
    canCheckIn,
    canCheckOut,
    isLockedForToday,
    doubleShiftEnabled: session.doubleShiftEnabled,
    nextResetLabel: '12:00 AM',
  };
};
