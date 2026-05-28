/**
 * Robust browser geolocation utility
 * - Guarantees resolution (never hangs)
 * - Dual timeout: browser option + manual JS fallback
 * - Retry with fallback accuracy
 * - Normalized error codes with actionable messages
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

const KNOWN_GEO_ERROR_CODES: readonly string[] = [
  "UNSUPPORTED",
  "INSECURE_CONTEXT",
  "PERMISSION_DENIED",
  "TIMEOUT",
  "POSITION_UNAVAILABLE",
  "UNKNOWN",
];

export function normalizeGeolocationError(err: unknown): GeoError {
  if (isInsecureContext()) {
    return {
      code: "INSECURE_CONTEXT",
      message: "Location requires HTTPS. Please open this site on HTTPS.",
    };
  }
  if (!isGeolocationSupported()) {
    return {
      code: "UNSUPPORTED",
      message: "Your browser does not support geolocation. Please use Chrome, Edge, or Safari.",
    };
  }
  // Guard against double-normalization (e.g. if caller already normalized)
  if (
    err &&
    typeof err === "object" &&
    "code" in err &&
    typeof (err as any).code === "string" &&
    KNOWN_GEO_ERROR_CODES.includes((err as any).code)
  ) {
    return err as GeoError;
  }
  if (err && typeof err === "object" && "code" in err) {
    const code = (err as any).code;
    // Some Safari versions pass the code as a string (e.g. "2" instead of 2)
    const numericCode = typeof code === "string" ? parseInt(code, 10) : code;
    if (numericCode === 1) {
      return {
        code: "PERMISSION_DENIED",
        message: "Location permission denied. Please enable it in your browser site settings and retry.",
      };
    }
    if (numericCode === 2) {
      return {
        code: "POSITION_UNAVAILABLE",
        message: "Location unavailable. Turn on GPS/Wi-Fi, disable VPN, and try again.",
      };
    }
    if (numericCode === 3) {
      return {
        code: "TIMEOUT",
        message: "Timed out. Move near a window or try again with low accuracy mode.",
      };
    }
    // Log unexpected code for debugging
    console.warn("[geolocation] Unexpected error code:", code, err);
    return { code: "UNKNOWN", message: "An unknown geolocation error occurred." };
  }
  // Safari / CoreLocation native errors sometimes come through as plain Error
  // objects without a numeric .code property (e.g. kCLErrorLocationUnknown).
  const msg = err instanceof Error ? err.message : String(err);
  if (
    msg.includes("locationUnknown") ||
    msg.includes("LocationUnknown") ||
    msg.includes("POSITION_UNAVAILABLE") ||
    msg.includes("position unavailable")
  ) {
    return {
      code: "POSITION_UNAVAILABLE",
      message: "Location unavailable. Turn on GPS/Wi-Fi, disable VPN, and try again.",
    };
  }
  if (
    msg.includes("denied") ||
    msg.includes("kCLErrorDenied") ||
    msg.includes("PERMISSION_DENIED")
  ) {
    return {
      code: "PERMISSION_DENIED",
      message: "Location permission denied. Please enable it in your browser site settings and retry.",
    };
  }
  if (msg.includes("timeout") || msg.includes("timed out") || msg.includes("TIMEOUT")) {
    return {
      code: "TIMEOUT",
      message: "Timed out. Move near a window or try again with low accuracy mode.",
    };
  }
  if (err instanceof Error) {
    if (err.message === "INSECURE_CONTEXT") {
      return { code: "INSECURE_CONTEXT", message: "Location requires HTTPS." };
    }
    if (err.message === "UNSUPPORTED") {
      return { code: "UNSUPPORTED", message: "Your browser does not support geolocation." };
    }
    return { code: "UNKNOWN", message: err.message };
  }
  return { code: "UNKNOWN", message: "An unexpected error occurred while retrieving location." };
}

export interface BrowserHelp {
  browser: string;
  os: string;
  title: string;
  steps: string[];
}

function detectBrowser(): { browser: string; os: string } {
  if (typeof window === "undefined") return { browser: "unknown", os: "unknown" };
  const ua = navigator.userAgent;
  let browser = "unknown";
  let os = "unknown";

  if (/Edg\//.test(ua)) browser = "edge";
  else if (/OPR\//.test(ua) || /Opera/.test(ua)) browser = "opera";
  else if (/Chrome\//.test(ua)) browser = "chrome";
  else if (/Safari\//.test(ua) && /Version\//.test(ua)) browser = "safari";
  else if (/Firefox\//.test(ua)) browser = "firefox";

  if (/Mac OS X/.test(ua)) os = "macos";
  else if (/Windows/.test(ua)) os = "windows";
  else if (/Android/.test(ua)) os = "android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "ios";
  else if (/Linux/.test(ua)) os = "linux";

  return { browser, os };
}

export function openBrowserLocationHelp(): BrowserHelp {
  const { browser, os } = detectBrowser();

  if (os === "macos") {
    return {
      browser,
      os,
      title: "Enable Location on macOS",
      steps: [
        "Open System Settings → Privacy & Security → Location Services",
        "Turn on Location Services",
        `Ensure "${browser === "safari" ? "Safari" : "Chrome"}" is allowed to use location`,
        "Refresh this page and try again",
      ],
    };
  }

  if (os === "windows") {
    return {
      browser,
      os,
      title: "Enable Location on Windows",
      steps: [
        "Open Settings → Privacy → Location",
        "Turn on 'Allow access to location on this device'",
        "Allow apps (including your browser) to access location",
        "Refresh this page and try again",
      ],
    };
  }

  if (os === "ios") {
    return {
      browser,
      os,
      title: "Enable Location on iOS",
      steps: [
        "Open Settings → Privacy & Security → Location Services",
        "Turn on Location Services",
        `Find "${browser === "safari" ? "Safari" : "Chrome"}" and set to 'While Using'`,
        "Refresh this page and try again",
      ],
    };
  }

  if (os === "android") {
    return {
      browser,
      os,
      title: "Enable Location on Android",
      steps: [
        "Open Settings → Location",
        "Turn on Location / GPS",
        "Ensure your browser has location permission",
        "Refresh this page and try again",
      ],
    };
  }

  // Generic fallback
  return {
    browser,
    os,
    title: "Enable Location in Your Browser",
    steps: [
      browser === "safari"
        ? "Safari → Preferences → Websites → Location → set to 'Allow'"
        : "Click the lock icon in the address bar → Site settings → Location → Allow",
      "Refresh this page and try again",
    ],
  };
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

    // Remove our custom key so we only pass valid PositionOptions to the browser
    const { manualTimeoutMs: _, ...positionOpts } = opts;

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
      positionOpts
    );
  });
}

/**
 * Attempt #1: highAccuracy=true, timeout=12s, manualTimeout=15s
 * Attempt #2: highAccuracy=false, timeout=8s, manualTimeout=12s (fallback)
 * Uses maximumAge=60000 to allow a fast cached position when acceptable.
 * Never hangs — manual timeout guarantees resolution.
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
      timeout: 12000,
      maximumAge,
      manualTimeoutMs: 15000,
    });
    return {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      ts: Date.now(),
      attempt: 1,
    };
  } catch (err1) {
    // If permission was explicitly denied, don't waste time on a second attempt.
    if (
      err1 &&
      typeof err1 === "object" &&
      "code" in err1 &&
      (err1 as GeolocationPositionError).code === 1
    ) {
      throw err1;
    }
    try {
      const pos = await fetchPosition({
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge,
        manualTimeoutMs: 12000,
      });
      return {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        ts: Date.now(),
        attempt: 2,
      };
    } catch (err2) {
      throw err2;
    }
  }
}
