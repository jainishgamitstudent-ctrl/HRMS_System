const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // CSS support patches Metro's dependency graph (traverseDependencies) which can
  // interfere with Fast Refresh / Hot Module Replacement on native.
  // Disabling it ensures file changes are detected and sent reliably.
  isCSSEnabled: false,
});

// Enable symlinks so Metro can resolve packages that are linked (common in
// workspace / monorepo setups or when using npm link / yarn link).
config.resolver.unstable_enableSymlinks = true;

// Guard: strip CSS extensions from source and asset resolution so Metro never
// attempts to transform a stylesheet as a JavaScript module.
config.resolver.sourceExts = config.resolver.sourceExts.filter(
  (ext) => !['css', 'scss', 'sass'].includes(ext)
);
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'css');

module.exports = config;
