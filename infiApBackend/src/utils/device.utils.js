const crypto = require("crypto");

const DEVICE_FINGERPRINT_SALT = process.env.DEVICE_FINGERPRINT_SALT || crypto.randomBytes(32).toString("hex");

function parseUserAgent(userAgent) {
    if (!userAgent) {
        return { browser: "Unknown", browserVersion: "", os: "Unknown", osVersion: "", deviceType: "desktop" };
    }

    let browser = "Unknown";
    let browserVersion = "";
    let os = "Unknown";
    let osVersion = "";
    let deviceType = "desktop";

    // Browser detection
    if (/Edg\/([\d.]+)/.test(userAgent)) {
        browser = "Edge";
        browserVersion = (userAgent.match(/Edg\/([\d.]+)/) || [])[1] || "";
    } else if (/OPR\/([\d.]+)/.test(userAgent) || /Opera/.test(userAgent)) {
        browser = "Opera";
        browserVersion = (userAgent.match(/OPR\/([\d.]+)/) || [])[1] || "";
    } else if (/Chrome\/([\d.]+)/.test(userAgent)) {
        browser = "Chrome";
        browserVersion = (userAgent.match(/Chrome\/([\d.]+)/) || [])[1] || "";
    } else if (/Safari\/([\d.]+)/.test(userAgent) && /Version\/([\d.]+)/.test(userAgent)) {
        browser = "Safari";
        browserVersion = (userAgent.match(/Version\/([\d.]+)/) || [])[1] || "";
    } else if (/Firefox\/([\d.]+)/.test(userAgent)) {
        browser = "Firefox";
        browserVersion = (userAgent.match(/Firefox\/([\d.]+)/) || [])[1] || "";
    }

    // OS detection
    if (/Windows NT 10\.0/.test(userAgent)) {
        os = "Windows";
        osVersion = "10/11";
    } else if (/Windows NT 6\.3/.test(userAgent)) {
        os = "Windows";
        osVersion = "8.1";
    } else if (/Windows NT 6\.2/.test(userAgent)) {
        os = "Windows";
        osVersion = "8";
    } else if (/Windows NT 6\.1/.test(userAgent)) {
        os = "Windows";
        osVersion = "7";
    } else if (/Mac OS X ([\d_]+)/.test(userAgent)) {
        os = "macOS";
        osVersion = (userAgent.match(/Mac OS X ([\d_]+)/) || [])[1]?.replace(/_/g, ".") || "";
    } else if (/iPhone|iPad|iPod/.test(userAgent)) {
        os = "iOS";
        osVersion = (userAgent.match(/OS ([\d_]+)/) || [])[1]?.replace(/_/g, ".") || "";
    } else if (/Android ([\d.]+)/.test(userAgent)) {
        os = "Android";
        osVersion = (userAgent.match(/Android ([\d.]+)/) || [])[1] || "";
    } else if (/Linux/.test(userAgent)) {
        os = "Linux";
    }

    // Device type
    if (/Mobi|Android|iPhone|iPad|iPod/.test(userAgent)) {
        deviceType = /iPad|Tablet/.test(userAgent) ? "tablet" : "mobile";
    }

    return { browser, browserVersion, os, osVersion, deviceType };
}

function getClientIp(req) {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
        const first = String(forwarded).split(",")[0]?.trim();
        if (first) return first;
    }
    return req.ip || req.connection?.remoteAddress || "unknown";
}

function getIpSubnet(ip) {
    if (!ip || ip === "unknown") return "unknown";
    // Handle IPv4
    if (ip.includes(".")) {
        const parts = ip.split(".");
        if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}`;
    }
    // Handle IPv6 - return first 4 groups
    if (ip.includes(":")) {
        const parts = ip.split(":");
        return parts.slice(0, 4).join(":");
    }
    return ip;
}

function generateDeviceFingerprint(userAgent, ipAddress) {
    const subnet = getIpSubnet(ipAddress);
    const raw = `${userAgent || ""}|${subnet}|${DEVICE_FINGERPRINT_SALT}`;
    return crypto.createHash("sha256").update(raw).digest("hex");
}

function getLocationFromIp(ipAddress) {
    // In production, use a geo-IP service like MaxMind or ipapi.co
    // For now, return Unknown
    return "Unknown";
}

function buildDeviceInfo(req) {
    const userAgent = req.headers["user-agent"] || "";
    const ipAddress = getClientIp(req);
    const parsed = parseUserAgent(userAgent);
    const location = getLocationFromIp(ipAddress);
    const fingerprint = generateDeviceFingerprint(userAgent, ipAddress);

    // Geolocation from frontend (optional but strongly recommended)
    const latitude = req.body?.latitude ?? null;
    const longitude = req.body?.longitude ?? null;
    const geoLocation = latitude !== null && longitude !== null
        ? { latitude, longitude }
        : null;

    return {
        fingerprint,
        browser: parsed.browser,
        browserVersion: parsed.browserVersion,
        os: parsed.os,
        osVersion: parsed.osVersion,
        deviceType: parsed.deviceType,
        userAgent,
        ipAddress,
        location,
        geoLocation,
    };
}

function formatDeviceDisplay(deviceInfo) {
    const parts = [];
    if (deviceInfo.browser && deviceInfo.browser !== "Unknown") {
        parts.push(`${deviceInfo.browser}${deviceInfo.browserVersion ? ` ${deviceInfo.browserVersion}` : ""}`);
    }
    if (deviceInfo.os && deviceInfo.os !== "Unknown") {
        parts.push(`${deviceInfo.os}${deviceInfo.osVersion ? ` ${deviceInfo.osVersion}` : ""}`);
    }
    if (deviceInfo.deviceType) {
        parts.push(deviceInfo.deviceType);
    }
    return parts.join(" · ") || "Unknown device";
}

module.exports = {
    parseUserAgent,
    getClientIp,
    getIpSubnet,
    generateDeviceFingerprint,
    getLocationFromIp,
    buildDeviceInfo,
    formatDeviceDisplay,
    DEVICE_FINGERPRINT_SALT,
};
