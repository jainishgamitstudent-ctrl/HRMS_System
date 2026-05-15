const mongoose = require("mongoose");

const configSchema = new mongoose.Schema(
    {
        // General Settings
        timezone: { type: String, default: 'UTC +05:30 (Chennai, Kolkata, Mumbai)' },
        dateFormat: { type: String, default: 'DD/MM/YYYY' },
        currency: { type: String, default: 'INR (₹)' },
        language: { type: String, default: 'English (US)' },

        // Notification Settings
        emailNotif: { type: Boolean, default: true },
        mobilePush: { type: Boolean, default: true },
        hrAlerts: { type: Boolean, default: false },

        // Security Settings
        twoFactor: { type: Boolean, default: true },
        loginMonitor: { type: Boolean, default: true },
        sessionTimeout: { type: String, default: '15 Minutes' },

        // Platform Preferences
        systemLogs: { type: Boolean, default: true },
        maintenanceMode: { type: Boolean, default: false },

        // Company Settings
        companyName: { type: String, default: 'InfiAP' },
        maxUsersPerCompany: { type: Number, default: 50 },
        defaultLeaveDays: { type: Number, default: 20 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Config", configSchema);
