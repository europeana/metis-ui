import { User } from '../../src/app/_models/user';
import { UrlManipulation } from '../../test-data/_models/test-models';

export function fillLoginFieldsAndSubmit(submit = true, email = 'hello@example.com'): void {
  cy.get('#email')
    .clear()
    .type(email);
  cy.get('#password')
    .clear()
    .type('x');
  if (submit) {
    cy.get('.login-btn').click();
  }
}

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

export function setEmptyDataResult(url: string, emptyArray = false): void {
  const manipulationType = emptyArray
    ? UrlManipulation.RETURN_EMPTY_ARRAY
    : UrlManipulation.RETURN_EMPTY;
  url = Cypress.env('dataServer') + url + manipulationType;
  cy.request(url);
}

export function checkAHref(subject: Cypress.Chainable, href: string): void {
  subject.closest('a').should('have.attr', 'href', href);
}
