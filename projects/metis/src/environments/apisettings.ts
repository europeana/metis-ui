const getEnvVar = (key: string): string | null => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (window as any).__env;
  return env ? env[key] : null;
};

export const apiSettings = {
  apiHostCore: getEnvVar('apiHostCore') || '',
  apiHostAuth: getEnvVar('apiHostAuth') || '',
  viewPreview: getEnvVar('viewPreview') || '',
  viewCollections: getEnvVar('viewCollections') || ''
};
