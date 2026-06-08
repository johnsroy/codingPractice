/** @type {import('@babel/core').TransformOptions} */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Module resolver lets us use @mentora/shared as an alias
      // pointing to the built dist output (or source in dev).
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            // Re-point @mentora/shared to the workspace package source
            // so Metro doesn't need to follow symlinks through node_modules.
            '@mentora/shared': '../../packages/shared/src/index.ts',
          },
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.js',
            '.jsx',
            '.json',
          ],
        },
      ],
      // expo-router requires the react-native-reanimated plugin last.
      'expo-router/babel',
    ],
  };
};
