const { getDefaultConfig } = require('@expo/metro-config');
console.log('SI O NO?');
const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.assetExts.push('rhn');

module.exports = defaultConfig;
