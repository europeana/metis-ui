const getEnvVar = (key: string): string | boolean | number | null => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (window as any).__env;
  return env ? env[key] : null;
};

export const apiSettings = {
  enableThemes: getEnvVar('enableThemes') as boolean,
  apiHost: getEnvVar('apiHost') as string,
  feedbackUrl: getEnvVar('feedbackUrl') as string,
  documentationUrl: getEnvVar('documentationUrl') as string,
  userGuideUrl: getEnvVar('userGuideUrl') as string,
  interval: 2000,
  intervalMaintenance: 60000,
  previewUrlPrefix: getEnvVar('previewUrlPrefix') as string,
  remoteEnvUrl: getEnvVar('remoteEnvUrl') as string,
  remoteEnvKey: getEnvVar('remoteEnvKey') as string,
  remoteEnv: {
    maintenanceMessage: ''
  }
};
