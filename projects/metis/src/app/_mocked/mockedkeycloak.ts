import Keycloak from 'keycloak-js';

export const mockedKeycloak = ({
  authenticated: true,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  login: (): void => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  logout: (): void => {},
  loadUserProfile: () => {
    return new Promise((resolve) => {
      resolve({
        username: 'name'
      });
    });
  }
} as unknown) as Keycloak;
