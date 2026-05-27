"use client";

export interface ReverseGeocodeAddress {
  formatted: string;
  street: string;
  neighbourhood: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface ReverseGeocodeResult {
  ok: boolean;
  coords: { lat: number; lng: number };
  address: ReverseGeocodeAddress | null;
  cached: boolean;
  error?: string;
}

export interface ReverseGeocodeError {
  message: string;
  status: number;
}

const FETCH_TIMEOUT_MS = 6000;
const DEBOUNCE_MS = 300;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    fetch(url, { signal: controller.signal })
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult> {
  if (typeof window === "undefined") {
    return {
      ok: false,
      coords: { lat, lng },
      address: null,
      cached: false,
      error: "Cannot geocode on the server.",
    };
  }

  const url = `/api/geocode/reverse?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`;

  try {
    const res = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
    const data = await res.json();

    if (!res.ok || !data.ok) {
      return {
        ok: false,
        coords: { lat, lng },
        address: null,
        cached: false,
        error: data.error || `HTTP ${res.status}`,
      };
    }

    return {
      ok: true,
      coords: data.coords,
      address: data.address,
      cached: data.cached || false,
    };
  } catch (err: any) {
    if (err.name === "AbortError") {
      return {
        ok: false,
        coords: { lat, lng },
        address: null,
        cached: false,
        error: "Address lookup timed out.",
      };
    }
    return {
      ok: false,
      coords: { lat, lng },
      address: null,
      cached: false,
      error: err?.message || "Address lookup failed.",
    };
  }
}

export function reverseGeocodeDebounced(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult> {
  return new Promise((resolve, reject) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }

    debounceTimer = setTimeout(() => {
      reverseGeocode(lat, lng)
        .then((result) => resolve(result))
        .catch((err) => reject(err));
    }, DEBOUNCE_MS);
  });
}
