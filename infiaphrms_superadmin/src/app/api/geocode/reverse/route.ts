import { NextRequest, NextResponse } from "next/server";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const REQUEST_TIMEOUT_MS = 5000;

interface AddressResult {
  formatted: string;
  street: string;
  neighbourhood: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface CacheEntry {
  address: AddressResult;
  expiresAt: number;
}

type UnknownRecord = Record<string, unknown>;
type AddressComponent = {
  long_name?: string;
  types?: string[];
};

const cache = new Map<string, CacheEntry>();

function roundCoord(value: number, decimals = 4): number {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}

function buildCacheKey(lat: number, lng: number): string {
  return `${roundCoord(lat)},${roundCoord(lng)}`;
}

function cleanCache() {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (entry.expiresAt <= now) {
      cache.delete(key);
    }
  }
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function parseGoogleAddress(components: AddressComponent[]): AddressResult {
  const get = (types: string[]): string => {
    for (const comp of components) {
      if (comp.types && types.some((t) => comp.types.includes(t))) {
        return comp.long_name || "";
      }
    }
    return "";
  };

  const streetNumber = get(["street_number"]);
  const route = get(["route"]);
  const street = streetNumber && route
    ? `${streetNumber} ${route}`
    : route || streetNumber || "";

  return {
    formatted: "",
    street,
    neighbourhood: get(["neighborhood", "sublocality", "sublocality_level_1"]),
    city: get(["locality", "administrative_area_level_3", "postal_town"]),
    state: get(["administrative_area_level_1"]),
    country: get(["country"]),
    postalCode: get(["postal_code"]),
  };
}

function parseNominatimAddress(data: unknown): AddressResult {
  const root = isRecord(data) ? data : {};
  const address = isRecord(root.address) ? root.address : {};
  const city =
    readString(address.city) ||
    readString(address.town) ||
    readString(address.village) ||
    readString(address.municipality) ||
    readString(address.county) ||
    "";
  const road =
    readString(address.road) ||
    readString(address.pedestrian) ||
    readString(address.footway);
  const streetParts = [readString(address.house_number), road]
    .filter(Boolean);

  return {
    formatted: readString(root.display_name),
    street: streetParts.join(" "),
    neighbourhood:
      readString(address.neighbourhood) ||
      readString(address.suburb) ||
      readString(address.quarter),
    city,
    state: readString(address.state),
    country: readString(address.country),
    postalCode: readString(address.postcode),
  };
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "infiApHRMS/1.0 reverse-geocode",
        Accept: "application/json",
      },
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function reverseGeocodeWithGoogle(lat: number, lng: number): Promise<AddressResult> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key is not configured.");
  }

  const url =
    "https://maps.googleapis.com/maps/api/geocode/json" +
    `?latlng=${lat},${lng}` +
    `&key=${GOOGLE_MAPS_API_KEY}` +
    `&result_type=street_address|locality|administrative_area_level_1|country`;

  const res = await fetchWithTimeout(url, REQUEST_TIMEOUT_MS);
  if (!res.ok) {
    throw new Error(`Geocoding provider error (${res.status}).`);
  }

  const data = await res.json();

  const root = isRecord(data) ? data : {};
  const status = readString(root.status);

  if (status !== "OK") {
    throw new Error(readString(root.error_message) || `Geocoding provider returned status: ${status}`);
  }

  const results = Array.isArray(root.results) ? root.results : [];
  if (results.length === 0) {
    throw new Error("No address found for the given coordinates.");
  }

  const first = isRecord(results[0]) ? results[0] : {};
  const components = Array.isArray(first.address_components)
    ? first.address_components.filter(isRecord).map((comp) => ({
        long_name: readString(comp.long_name),
        types: Array.isArray(comp.types) ? comp.types.filter((type): type is string => typeof type === "string") : [],
      }))
    : [];
  const parsed = parseGoogleAddress(components);
  parsed.formatted = readString(first.formatted_address);
  return parsed;
}

async function reverseGeocodeWithNominatim(lat: number, lng: number): Promise<AddressResult> {
  const url =
    "https://nominatim.openstreetmap.org/reverse" +
    `?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}` +
    "&zoom=18&addressdetails=1";

  const res = await fetchWithTimeout(url, REQUEST_TIMEOUT_MS);
  if (!res.ok) {
    throw new Error(`Fallback geocoding provider error (${res.status}).`);
  }

  const data = await res.json();
  if (isRecord(data) && data.error) {
    throw new Error(readString(data.error) || "Reverse geocoding failed.");
  }

  const parsed = parseNominatimAddress(data);
  if (!parsed.formatted && !parsed.city && !parsed.state && !parsed.country) {
    throw new Error("No address found for the given coordinates.");
  }

  return parsed;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");

  if (!latParam || !lngParam) {
    return NextResponse.json(
      { ok: false, error: "Missing lat or lng query parameter." },
      { status: 400 }
    );
  }

  const lat = parseFloat(latParam);
  const lng = parseFloat(lngParam);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json(
      { ok: false, error: "Invalid lat or lng value." },
      { status: 400 }
    );
  }

  const cacheKey = buildCacheKey(lat, lng);
  cleanCache();
  const cached = cache.get(cacheKey);
  if (cached) {
    return NextResponse.json(
      { ok: true, coords: { lat, lng }, address: cached.address, cached: true },
      { status: 200 }
    );
  }

  try {
    let parsed: AddressResult;
    try {
      parsed = GOOGLE_MAPS_API_KEY
        ? await reverseGeocodeWithGoogle(lat, lng)
        : await reverseGeocodeWithNominatim(lat, lng);
    } catch (primaryErr) {
      if (!GOOGLE_MAPS_API_KEY) throw primaryErr;
      parsed = await reverseGeocodeWithNominatim(lat, lng);
    }

    cache.set(cacheKey, {
      address: parsed,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return NextResponse.json(
      { ok: true, coords: { lat, lng }, address: parsed, cached: false },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json(
        { ok: false, error: "Geocoding request timed out." },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Reverse geocoding failed." },
      { status: 500 }
    );
  }
}
