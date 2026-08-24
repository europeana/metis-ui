export const getEnvVar = (key: string): string | boolean | number | null => {
  const env = (window as any).__env;
  return env ? env[key] : null;
};
