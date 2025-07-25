const getEnvVar = (key: string): string | boolean | number | null => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (window as any).__env;
  return env ? env[key] : null;
};

export const apiSettings = {
  apiHost: getEnvVar('apiHost') as string,
  apiHostAuth: getEnvVar('apiHostAuth') as string,
  apiHostDereference: getEnvVar('apiHostDereference') as string,
  feedbackUrl: getEnvVar('feedbackUrl') as string,
  documentationUrl: getEnvVar('documentationUrl') as string,
  userGuideUrl: getEnvVar('userGuideUrl') as string,
  interval: 2000,
  previewUrlPrefix: getEnvVar('previewUrlPrefix') as string
};
