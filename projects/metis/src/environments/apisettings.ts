import { getEnvVar } from 'shared';

export const apiSettings = {
  apiHostCore: getEnvVar('apiHostCore') as string,
  apiHostAuth: getEnvVar('apiHostAuth') as string,
  viewPreview: getEnvVar('viewPreview') as string,
  viewCollections: getEnvVar('viewCollections') as string
};
