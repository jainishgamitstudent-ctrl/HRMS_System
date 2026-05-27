"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getBrowserLocation,
  getPermissionState,
  normalizeGeolocationError,
  type GeoCoords,
  type GeoError,
  type GeoPermissionState,
  isGeolocationSupported,
  isInsecureContext,
} from "@/lib/geolocation";

type GateStatus = "idle" | "loading" | "granted" | "denied" | "error" | "unavailable";

export interface GeolocationGateState {
  status: GateStatus;
  permissionState: GeoPermissionState;
  coords: GeoCoords | null;
  error: GeoError | null;
  attempts: number;
  elapsed: number;
}

const MAX_TOTAL_TIME_MS = 15000;
const ELAPSED_TICK_MS = 250;

export function useGeolocationGate(autoRequest = false) {
  const [state, setState] = useState<GeolocationGateState>({
    status: "idle",
    permissionState: "unknown",
    coords: null,
    error: null,
    attempts: 0,
    elapsed: 0,
  });

  const activeRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAllTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    activeRef.current = false;
    clearAllTimers();
    setState({
      status: "idle",
      permissionState: "unknown",
      coords: null,
      error: null,
      attempts: 0,
      elapsed: 0,
    });
  }, [clearAllTimers]);

  const runRequest = useCallback(async () => {
    activeRef.current = true;
    const startTime = Date.now();

    setState((prev) => ({
      ...prev,
      status: "loading",
      error: null,
      coords: null,
      attempts: 0,
      elapsed: 0,
    }));

    clearAllTimers();

    intervalRef.current = setInterval(() => {
      if (!activeRef.current) return;
      const elapsed = Date.now() - startTime;
      setState((prev) => ({ ...prev, elapsed }));
    }, ELAPSED_TICK_MS);

    timeoutRef.current = setTimeout(() => {
      if (!activeRef.current) return;
      activeRef.current = false;
      clearAllTimers();
      setState((prev) => ({
        ...prev,
        status: "error",
        error: {
          code: "TIMEOUT",
          message: "Unable to get location within the allowed time. Please check your settings and retry.",
        },
        elapsed: Date.now() - startTime,
      }));
    }, MAX_TOTAL_TIME_MS);

    let permission: GeoPermissionState = "unknown";
    try {
      permission = await getPermissionState();
    } catch {
      permission = "unknown";
    }
    setState((prev) => ({ ...prev, permissionState: permission }));

    if (!isGeolocationSupported() || isInsecureContext()) {
      if (activeRef.current) {
        activeRef.current = false;
        clearAllTimers();
        const normalized = normalizeGeolocationError(
          isInsecureContext() ? new Error("INSECURE_CONTEXT") : new Error("UNSUPPORTED")
        );
        setState({
          status: "unavailable",
          permissionState: permission,
          coords: null,
          error: normalized,
          attempts: 0,
          elapsed: Date.now() - startTime,
        });
      }
      return;
    }

    try {
      const result = await getBrowserLocation({ maximumAge: 60000 });
      if (activeRef.current) {
        activeRef.current = false;
        clearAllTimers();
        setState({
          status: "granted",
          permissionState: permission === "unknown" ? "granted" : permission,
          coords: result,
          error: null,
          attempts: result.attempt,
          elapsed: Date.now() - startTime,
        });
      }
    } catch (err) {
      if (!activeRef.current) return;
      activeRef.current = false;
      clearAllTimers();
      const normalized = normalizeGeolocationError(err);
      setState({
        status: normalized.code === "PERMISSION_DENIED" ? "denied" : "error",
        permissionState: normalized.code === "PERMISSION_DENIED" ? "denied" : permission,
        coords: null,
        error: normalized,
        attempts: 2,
        elapsed: Date.now() - startTime,
      });
    }
  }, [clearAllTimers]);

  const requestLocation = useCallback(() => {
    reset();
    const id = setTimeout(() => {
      runRequest();
    }, 50);
    return () => clearTimeout(id);
  }, [reset, runRequest]);

  useEffect(() => {
    if (autoRequest) {
      runRequest();
    }
    return () => {
      activeRef.current = false;
      clearAllTimers();
    };
  }, [autoRequest, runRequest, clearAllTimers]);

  return {
    ...state,
    requestLocation,
    reset,
    isReady: state.status === "granted" && !!state.coords,
    isBlocked: state.status === "denied" || state.status === "unavailable" || state.status === "error",
  };
}
