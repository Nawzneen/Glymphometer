const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("txt");

module.exports = config;

// const { getDefaultConfig } = require("@react-native/metro-config");

// const defaultConfig = getDefaultConfig(__dirname);

// module.exports = {
//   ...defaultConfig,
//   transformer: {
//     ...defaultConfig.transformer,
//     unstable_allowRequireContext: true,
//   },
// };
