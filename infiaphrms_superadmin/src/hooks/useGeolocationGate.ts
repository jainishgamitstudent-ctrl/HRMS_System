"use client";

import { useCallback, useRef, useState } from "react";
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
import { reverseGeocode, type ReverseGeocodeAddress } from "@/lib/reverseGeocode";

type GateStatus = "idle" | "loading" | "granted" | "denied" | "error" | "unavailable";

export interface GeolocationGateState {
  status: GateStatus;
  permissionState: GeoPermissionState;
  coords: GeoCoords | null;
  error: GeoError | null;
  attempts: number;
  elapsed: number;
  address: ReverseGeocodeAddress | null;
  addressError: string | null;
  addressLoading: boolean;
}

const ELAPSED_TICK_MS = 250;

export function useGeolocationGate() {
  const [state, setState] = useState<GeolocationGateState>({
    status: "idle",
    permissionState: "unknown",
    coords: null,
    error: null,
    attempts: 0,
    elapsed: 0,
    address: null,
    addressError: null,
    addressLoading: false,
  });

  const activeRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    activeRef.current = false;
    clearTimers();
    setState({
      status: "idle",
      permissionState: "unknown",
      coords: null,
      error: null,
      attempts: 0,
      elapsed: 0,
      address: null,
      addressError: null,
      addressLoading: false,
    });
  }, [clearTimers]);

  const requestLocation = useCallback(async () => {
    // Reset any previous state and mark as loading
    activeRef.current = true;
    const startTime = Date.now();

    setState({
      status: "loading",
      permissionState: "unknown",
      coords: null,
      error: null,
      attempts: 0,
      elapsed: 0,
      address: null,
      addressError: null,
      addressLoading: false,
    });

    clearTimers();

    intervalRef.current = setInterval(() => {
      if (!activeRef.current) return;
      const elapsed = Date.now() - startTime;
      setState((prev) => ({ ...prev, elapsed }));
    }, ELAPSED_TICK_MS);

    // Query permission state (best-effort; do not block on it)
    let permission: GeoPermissionState = "unknown";
    try {
      permission = await getPermissionState();
    } catch {
      permission = "unknown";
    }
    setState((prev) => ({ ...prev, permissionState: permission }));

    // Gate insecure context / unsupported before attempting geolocation
    if (!isGeolocationSupported() || isInsecureContext()) {
      if (activeRef.current) {
        activeRef.current = false;
        clearTimers();
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
          address: null,
          addressError: null,
          addressLoading: false,
        });
      }
      return;
    }

    // Attempt geolocation — this call must originate from a user gesture (button click)
    try {
      const result = await getBrowserLocation({ maximumAge: 60000 });
      if (activeRef.current) {
        activeRef.current = false;
        clearTimers();
        // Re-query permission after success so UI reflects reality
        let updatedPermission = permission;
        try {
          updatedPermission = await getPermissionState();
        } catch {
          updatedPermission = "unknown";
        }
        setState((prev) => ({
          ...prev,
          status: "granted",
          permissionState: updatedPermission === "unknown" ? "granted" : updatedPermission,
          coords: result,
          error: null,
          attempts: result.attempt,
          elapsed: Date.now() - startTime,
          addressLoading: true,
          addressError: null,
        }));
        // Resolve address after coords obtained (non-blocking)
        try {
          const geoResult = await reverseGeocode(result.lat, result.lng);
          setState((prev) => ({
            ...prev,
            address: geoResult.ok ? geoResult.address : null,
            addressError: geoResult.ok ? null : geoResult.error || null,
            addressLoading: false,
          }));
        } catch {
          setState((prev) => ({
            ...prev,
            address: null,
            addressError: "Address lookup failed.",
            addressLoading: false,
          }));
        }
      }
    } catch (err) {
      if (!activeRef.current) return;
      activeRef.current = false;
      clearTimers();
      const normalized = normalizeGeolocationError(err);
      // Re-query permission after failure — user may have just changed it
      let updatedPermission = permission;
      try {
        updatedPermission = await getPermissionState();
      } catch {
        updatedPermission = "unknown";
      }
      setState({
        status: normalized.code === "PERMISSION_DENIED" ? "denied" : "error",
        permissionState: normalized.code === "PERMISSION_DENIED" ? "denied" : updatedPermission,
        coords: null,
        error: normalized,
        attempts: 2,
        elapsed: Date.now() - startTime,
        address: null,
        addressError: null,
        addressLoading: false,
      });
    }
  }, [clearTimers]);

  return {
    ...state,
    requestLocation,
    reset,
    isReady: state.status === "granted" && !!state.coords,
    isBlocked: state.status === "denied" || state.status === "unavailable",
  };
}
