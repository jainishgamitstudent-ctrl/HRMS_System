/**
 * Enterprise Geofencing Utility
 * Validates employee location against office coordinates
 */

// Default office coordinates - should be overridden via env vars
const OFFICE_LAT = parseFloat(process.env.OFFICE_LATITUDE || "23.0092977");
const OFFICE_LNG = parseFloat(process.env.OFFICE_LONGITUDE || "72.522745");
const OFFICE_RADIUS_METERS = parseInt(process.env.OFFICE_RADIUS_METERS || "100", 10);
const WFH_RADIUS_METERS = parseInt(process.env.WFH_RADIUS_METERS || "500", 10);
const LOCATION_VALIDATION_REQUIRED = process.env.LOCATION_VALIDATION_REQUIRED !== 'false';

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in meters
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371e3; // Earth's radius in meters
    const toRad = (deg) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

/**
 * Check if coordinates are within the allowed radius
 * @param {number} lat - Employee latitude
 * @param {number} lng - Employee longitude
 * @param {number} workMode - 1=Office, 2=WFH, 3=Meeting, 4=Offsite
 * @param {Object} options - Optional custom office coordinates
 * @returns {Object} Validation result
 */
const validateGeofence = (lat, lng, workMode = 1, options = {}) => {
    const officeLat = options.officeLat || OFFICE_LAT;
    const officeLng = options.officeLng || OFFICE_LNG;
    const radius = workMode === 2 ? WFH_RADIUS_METERS : OFFICE_RADIUS_METERS;

    const distance = calculateDistance(lat, lng, officeLat, officeLng);
    const isInside = distance <= radius;

    // If location validation is disabled, always return valid (for audit purposes still calculate distance)
    const isValid = LOCATION_VALIDATION_REQUIRED ? isInside : true;

    return {
        isValid,
        distance: Math.round(distance),
        maxRadius: radius,
        officeLat,
        officeLng,
        workMode,
        locationValidationRequired: LOCATION_VALIDATION_REQUIRED,
        message: !LOCATION_VALIDATION_REQUIRED
            ? `Location validation disabled. Distance from office: ${Math.round(distance)}m`
            : isInside
                ? `Location verified: ${Math.round(distance)}m from office`
                : `You are ${Math.round(distance)}m away from office. Max allowed: ${radius}m`,
    };
};

/**
 * Detect potential mock GPS by checking location accuracy and speed
 * @param {Object} locationData - Location data from client
 * @returns {Object} Mock detection result
 */
const detectMockLocation = (locationData) => {
    const { accuracy, altitude, speed, mocked, isFromMockProvider } = locationData || {};

    const checks = {
        mockedFlag: mocked === true || isFromMockProvider === true,
        unrealisticAccuracy: accuracy !== undefined && accuracy < 0,
        unrealisticSpeed: speed !== undefined && speed > 150, // > 150 m/s is unrealistic for employee
        missingAccuracy: accuracy === undefined || accuracy === null,
    };

    const isSuspicious = Object.values(checks).some(Boolean);

    return {
        isMock: isSuspicious,
        confidence: isSuspicious ? 'high' : 'low',
        checks,
        message: isSuspicious
            ? 'Potential mock GPS detected. Please disable mock location apps.'
            : 'Location source appears genuine.',
    };
};

/**
 * Get office configuration for client-side validation
 * @returns {Object} Office config (excludes sensitive data)
 */
const getOfficeConfig = () => ({
    officeLat: OFFICE_LAT,
    officeLng: OFFICE_LNG,
    radiusMeters: OFFICE_RADIUS_METERS,
    wfhRadiusMeters: WFH_RADIUS_METERS,
    locationValidationRequired: LOCATION_VALIDATION_REQUIRED,
});

module.exports = {
    calculateDistance,
    validateGeofence,
    detectMockLocation,
    getOfficeConfig,
    OFFICE_LAT,
    OFFICE_LNG,
    OFFICE_RADIUS_METERS,
    LOCATION_VALIDATION_REQUIRED,
};
