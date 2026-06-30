import Keycloak from 'keycloak-js';

// Internal track state for the mock instance execution context
let currentAuthState = true;

export const mockedKeycloak = ({
  get authenticated(): boolean {
    return currentAuthState;
  },
  set authenticated(value: boolean) {
    currentAuthState = value;
  },

  // Simulates a realistic asynchronous identity login handshake
  login: (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        currentAuthState = true;
        resolve();
      }, 150);
    });
  },

  // Simulates a realistic asynchronous logout lifecycle loop
  logout: (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        currentAuthState = false;
        resolve();
      }, 150);
    });
  },

  createAccountUrl: () => 'http://europeana-account-page.html',
  loadUserProfile: () => {
    return new Promise((resolve) => {
      resolve({
        username: 'name'
      });
    });
  }
} as unknown) as Keycloak;
