// Minimal ambient declaration so EXPO_PUBLIC_* env vars typecheck without
// pulling in full @types/node (which conflicts with React Native's globals).
// Expo's Babel plugin inlines `process.env.EXPO_PUBLIC_*` at build time.
declare const process: {
  env: {
    EXPO_PUBLIC_API_URL?: string;
    [key: string]: string | undefined;
  };
};
