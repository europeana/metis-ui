import { User } from '../../src/app/_models/user';
import { UrlManipulation } from '../../test-data/_models/test-models';

export function setupUser(): void {
  cy.window().then((w) => {
    cy.request('POST', Cypress.env('dataServer') + '/users/data/authenticate.json').then(
      (response) => {
        const user = response.body as User;
        w.localStorage.setItem(
          'currentUser',
          JSON.stringify({
            user,
            email: user.email,
            token: user.metisUserAccessToken.accessToken
          })
        );
      }
    );
  });
}

export function cleanupUser(): void {
  cy.window().then((w) => {
    w.localStorage.removeItem('currentUser');
  });
}

export function setEmptyDataResult(url: string): void {
  url = Cypress.env('dataServer') + url + UrlManipulation.RETURN_EMPTY;
  cy.request(url);
}

export function checkAHref(subject: Cypress.Chainable, href: string): void {
  subject.closest('a').should('have.attr', 'href', href);
}
