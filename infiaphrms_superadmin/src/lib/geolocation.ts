/**
 * Robust browser geolocation utility
 * - Guarantees resolution (never hangs)
 * - Dual timeout: browser option + manual JS fallback
 * - Retry with fallback accuracy
 * - Normalized error codes
 */

export type GeoCoords = {
  lat: number;
  lng: number;
  accuracy: number;
  ts: number;
};

export type GeoPermissionState = "granted" | "denied" | "prompt" | "unknown";

export type GeoErrorCode =
  | "PERMISSION_DENIED"
  | "POSITION_UNAVAILABLE"
  | "TIMEOUT"
  | "UNSUPPORTED"
  | "INSECURE_CONTEXT"
  | "UNKNOWN";

export interface GeoError {
  code: GeoErrorCode;
  message: string;
}

export type GeoResult = GeoCoords & { attempt: number };

export function isGeolocationSupported(): boolean {
  return typeof window !== "undefined" && "geolocation" in navigator && !!navigator.geolocation;
}

export function isInsecureContext(): boolean {
  if (typeof window === "undefined") return false;
  return window.isSecureContext === false && window.location.hostname !== "localhost";
}

export async function getPermissionState(): Promise<GeoPermissionState> {
  if (typeof window === "undefined") return "unknown";
  if (!navigator.permissions) return "unknown";
  try {
    const result = await navigator.permissions.query({ name: "geolocation" as PermissionName });
    if (result.state === "granted") return "granted";
    if (result.state === "denied") return "denied";
    return "prompt";
  } catch {
    return "unknown";
  }
}

export function normalizeGeolocationError(err: unknown): GeoError {
  if (isInsecureContext()) {
    return {
      code: "INSECURE_CONTEXT",
      message: "Geolocation requires a secure context (HTTPS or localhost).",
    };
  }
  if (!isGeolocationSupported()) {
    return {
      code: "UNSUPPORTED",
      message: "Your browser does not support geolocation.",
    };
  }
  if (err && typeof err === "object" && "code" in err) {
    const code = (err as GeolocationPositionError).code;
    switch (code) {
      case 1:
        return {
          code: "PERMISSION_DENIED",
          message: "Location permission was denied. Please enable it in your browser settings and retry.",
        };
      case 2:
        return {
          code: "POSITION_UNAVAILABLE",
          message: "Unable to retrieve your location. Please check that GPS or Wi-Fi is enabled.",
        };
      case 3:
        return {
          code: "TIMEOUT",
          message: "Location request timed out. Try moving to an open area with better signal and retry.",
        };
      default:
        return { code: "UNKNOWN", message: "An unknown geolocation error occurred." };
    }
  }
  if (err instanceof Error) {
    if (err.message === "INSECURE_CONTEXT") {
      return { code: "INSECURE_CONTEXT", message: "Geolocation requires HTTPS or localhost." };
    }
    if (err.message === "UNSUPPORTED") {
      return { code: "UNSUPPORTED", message: "Your browser does not support geolocation." };
    }
    return { code: "UNKNOWN", message: err.message };
  }
  return { code: "UNKNOWN", message: "An unexpected error occurred while retrieving location." };
}

/**
 * Fetch position with a manual JS timeout fallback in case the browser
 * ignores the PositionOptions timeout.
 */
function fetchPosition(
  opts: PositionOptions & { manualTimeoutMs: number }
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    let resolved = false;

    const timer = setTimeout(() => {
      if (resolved) return;
      resolved = true;
      const err = new Error("Timeout") as any;
      err.code = 3;
      reject(err);
    }, opts.manualTimeoutMs);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timer);
        resolve(pos);
      },
      (err) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timer);
        reject(err);
      },
      opts
    );
  });
}

/**
 * Attempt #1: highAccuracy=true, timeout=8s
 * Attempt #2: highAccuracy=false, timeout=6s (fallback)
 * Uses maximumAge to allow a fast cached position when acceptable.
 */
export async function getBrowserLocation(options?: {
  maximumAge?: number;
}): Promise<GeoResult> {
  if (typeof window === "undefined") {
    throw normalizeGeolocationError(new Error("UNSUPPORTED"));
  }
  if (isInsecureContext()) {
    throw normalizeGeolocationError(new Error("INSECURE_CONTEXT"));
  }
  if (!isGeolocationSupported()) {
    throw normalizeGeolocationError(new Error("UNSUPPORTED"));
  }

  const maximumAge = options?.maximumAge ?? 60000;

  try {
    const pos = await fetchPosition({
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge,
      manualTimeoutMs: 10000,
    });
    return {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      ts: Date.now(),
      attempt: 1,
    };
  } catch (err1) {
    const pos = await fetchPosition({
      enableHighAccuracy: false,
      timeout: 6000,
      maximumAge,
      manualTimeoutMs: 8000,
    });
    return {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      ts: Date.now(),
      attempt: 2,
    };
  }
}
