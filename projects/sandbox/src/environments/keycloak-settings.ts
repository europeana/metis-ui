/*
  keycloak-settings
*/

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { getEnvVar } from 'shared';

//const url = apiSettings.apiHostAuth;
const url = getEnvVar('apiHostAuth');
const realm = 'europeana';
const clientId = getEnvVar('keycloakClientId');

export const keycloakSettings = {
  url,
  realm,
  clientId
};
