/*
  keycloak-settings
*/


import { getEnvVar } from 'shared';

const url = getEnvVar('apiHostAuth') as string;
const realm = 'europeana';
const clientId = getEnvVar('keycloakClientId') as string;

export const keycloakSettings = {
  url,
  realm,
  clientId
};
