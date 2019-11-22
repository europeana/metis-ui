import { cleanupUser, setupUser } from '../support/helpers';

context('metis-ui', () => {
  describe('home (not logged in)', () => {
    afterEach(() => {
      cleanupUser();
    });

    beforeEach(() => {
      cy.server();
      cy.visit('/home');
    });

    it('should not show the search form', () => {
      cy.get('.search-form').should('have.length', 0);
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
    afterEach(() => {
      cleanupUser();
    });

    beforeEach(() => {
      cy.server();
      setupUser();
      cy.visit('/home');
    });

    it('should show the search form', () => {
      cy.get('.search-form').should('have.length', 1);
    });

    it('should show the dashboard screen and have a dashboard and signout button', () => {
      cy.get('.metis-welcome-message').contains('Welcome Valentine');

      cy.get('.svg-icon-dashboard').should('have.attr', 'href', '/dashboard');

      cy.get('.svg-icon-loggedin-user').click();
      cy.get('ul.menu-sublevel a')
        .contains('Sign out')
        .click();
      cy.get('a.signup').contains('Sign in');
    });
  });
});
