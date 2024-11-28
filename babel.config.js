module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["nativewind/babel"],
    env: {
      production: {
        plugins: [
          "nativewind/babel",
          [
            "transform-remove-console",
            {
              exclude: ["error", "warn"],
            },
          ],
        ],
      },
    },
  };
};
