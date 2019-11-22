import { cleanupUser } from '../support/helpers';
import { user } from '../fixtures';

context('metis-ui', () => {
  describe('signin', () => {
    afterEach(() => {
      cleanupUser();
    });

    beforeEach(() => {
      cy.server();
      cy.visit('/signin');
    });

    it('should validate the email', () => {
      cy.get('#email')
        .clear()
        .type('hello')
        .blur();
      cy.get('#password')
        .clear()
        .type('x')
        .blur();
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
      cy.get('#email')
        .clear()
        .type('hello@example.com')
        .blur();
      cy.get('#password')
        .clear()
        .type('x')
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

      cy.get('#email')
        .clear()
        .type('hello@example.com')
        .blur();
      cy.get('#password')
        .clear()
        .type('x')
        .blur();
      cy.get('.login-btn').click();

      cy.get('.error-notification').contains('401 Oops!');
    });

    it('should login', () => {
      cy.route('POST', '/authentication/login', user);

      cy.get('#email')
        .clear()
        .type('hello@example.com')
        .blur();
      cy.get('#password')
        .clear()
        .type('x')
        .blur();
      cy.get('.login-btn').click();

      cy.url().should('contain', '/dashboard');
    });

    it('should show the search form when logged in', () => {
      cy.route('POST', '/authentication/login', user);
      cy.get('#email')
        .clear()
        .type('hello@example.com')
        .blur();
      cy.get('#password')
        .clear()
        .type('x')
        .blur();

      cy.get('.search-form').should('have.length', 0);
      cy.get('.login-btn').click();
      cy.get('.search-form').should('have.length', 1);
    });
  });
});
