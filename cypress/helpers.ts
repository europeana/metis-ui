import user from './fixtures/user';

export function setupUser(): void {
  cy.window().then((w) => {
    w.localStorage.setItem('currentUser', JSON.stringify({
      user,
      email: user.email,
      token: user.metisUserAccessToken.accessToken
    }));
  });
}
