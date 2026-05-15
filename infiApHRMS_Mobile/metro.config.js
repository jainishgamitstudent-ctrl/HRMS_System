const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Disable CSS support to avoid potential Fast Refresh issues in React Native
config.resolver.sourceExts = [...config.resolver.sourceExts];

module.exports = config;
