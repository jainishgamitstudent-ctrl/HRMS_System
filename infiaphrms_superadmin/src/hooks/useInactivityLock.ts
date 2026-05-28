"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "infiap_superadmin_locked";
const DEFAULT_TIMEOUT_MINUTES = Number(process.env.NEXT_PUBLIC_INACTIVITY_LOCK_MINUTES || "10");
const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"] as const;

export function useInactivityLock(enabled: boolean, timeoutMinutes = DEFAULT_TIMEOUT_MINUTES) {
  const [locked, setLocked] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lock = useCallback(() => {
    if (!enabled) return;
    setLocked(true);
    sessionStorage.setItem(STORAGE_KEY, "1");
  }, [enabled]);

  const unlock = useCallback(() => {
    setLocked(false);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const resetTimer = useCallback(() => {
    if (!enabled || locked) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(lock, Math.max(1, timeoutMinutes) * 60 * 1000);
  }, [enabled, lock, locked, timeoutMinutes]);

  useEffect(() => {
    if (!enabled || locked) return;
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));
    document.addEventListener("visibilitychange", resetTimer);
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
      document.removeEventListener("visibilitychange", resetTimer);
    };
  }, [enabled, locked, resetTimer]);

  return { locked, lock, unlock };
}
