import { setupUser } from '../support/helpers';

context('metis-ui', () => {
  describe('home (not logged in)', () => {
    beforeEach(() => {
      cy.server({ force404: true });
      cy.visit('/home');
    });

    it('should show the home screen and have a signin button', () => {
      cy.get('h2').contains('What can you do with Metis?');

      cy.get('a.signup')
        .contains('Sign in')
        .click();
      cy.get('ul.menu-sublevel a')
        .contains('Sign in')
        .click();
      cy.url().should('contain', '/signin');
    });
  });

  describe('home (logged in)', () => {
    beforeEach(() => {
      cy.server({ force404: true });
      setupUser();
      cy.visit('/home');
    });

    it('should show the home screen and have a dashboard and signout button', () => {
      cy.get('h2').contains('What can you do with Metis?');

      cy.get('.svg-icon-dashboard').should('have.attr', 'href', '/dashboard');

      cy.get('.svg-icon-loggedin-user').click();
      cy.get('ul.menu-sublevel a')
        .contains('Sign out')
        .click();
      cy.get('a.signup').contains('Sign in');
    });
  });
});
