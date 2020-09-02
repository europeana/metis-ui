import { cleanupUser } from '../support/helpers';
import { user } from '../fixtures';

context('metis-ui', () => {
  const fillLoginFieldsAndSubmit = (submit = true) => {
    cy.get('#email')
      .clear()
      .type('hello@example.com');
    cy.get('#password')
      .clear()
      .type('x');
    if (submit) {
      cy.get('.login-btn').click();
    }
  };

  describe('signin', () => {
    afterEach(() => {
      cleanupUser();
    });

    beforeEach(() => {
      cy.server();
      cy.visit('/signin');
    });

    it('should set the title of the page', () => {
      cy.title().should('eq', 'Sign In | Metis');
    });

    it('should validate the email', () => {
      cy.get('#email')
        .clear()
        .type('hello')
        .blur();
      cy.get('#password')
        .clear()
        .type('x');

      cy.get('.error-message').contains('Please enter a valid email address');
      cy.get('.login-btn').should('be.disabled');

      cy.get('#email')
        .clear()
        .blur();
      cy.get('.error-message').contains('Please enter a valid email address');
      cy.get('.login-btn').should('be.disabled');

      cy.get('#email')
        .clear()
        .type('hello@example.com')
        .blur();
      cy.get('.error-message').should('not.exist');
      cy.get('.login-btn').should('not.be.disabled');
    });

    it('should validate the password', () => {
      fillLoginFieldsAndSubmit(false);
      cy.get('#password')
        .clear()
        .blur();
      cy.get('.error-message').contains('Please enter a valid password');
      cy.get('.login-btn').should('be.disabled');
      cy.get('#password')
        .clear()
        .type('x');
      cy.get('.error-message').should('not.exist');
      cy.get('.login-btn').should('not.be.disabled');
    });

    it('should not login with the wrong credentials', () => {
      cy.route({
        method: 'POST',
        url: '/authentication/login',
        status: 401,
        response: { errorMessage: 'Oops!' }
      });
      fillLoginFieldsAndSubmit();
      cy.get('.error-notification').contains('401 Oops!');
    });

    it('should login', () => {
      cy.route('POST', '/authentication/login', user);
      fillLoginFieldsAndSubmit();
      cy.url().should('contain', '/dashboard');
    });

    it('should show the search form when logged in', () => {
      cy.route('POST', '/authentication/login', user);
      fillLoginFieldsAndSubmit(false);
      cy.get('.search-form').should('have.length', 0);
      cy.get('.login-btn').click();
      cy.get('.search-form').should('have.length', 1);
    });

    it('should redirect to the originally requested url after a successful login', () => {
      const destinationUrl = '/dataset/edit/2';
      cy.visit(destinationUrl);
      cy.url().should('contain', '/signin');
      fillLoginFieldsAndSubmit();
      cy.url().should('contain', destinationUrl);
    });
  });
});
