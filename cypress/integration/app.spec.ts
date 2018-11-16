context('metis-ui', () => {
  describe('home', () => {
    beforeEach(() => {
      cy.server({ force404: true });
    });

    before(() => {
      cy.visit('/home');
    });

    it('should show the home screen', () => {
      cy.get('h2').contains('What can you do with Metis?');
    });

    it('should have a signin button', () => {
      cy.get('a.signup').contains('Sign in').click();
      cy.get('ul.menu-sublevel a').contains('Sign in').click();
      cy.url().should('contain', '/signin');
    });
  });

  describe('signin', () => {
    beforeEach(() => {
      cy.server({ force404: true });
    });

    before(() => {
      cy.visit('/signin');
    });

    it('should validate the email', () => {
      cy.get('#email').clear().type('hello').blur();
      cy.get('#password').clear().type('x').blur();
      cy.get('.error-message').contains('Please enter a valid email address');
      cy.get('.login-btn').should('be.disabled');

      cy.get('#email').clear().blur();
      cy.get('.error-message').contains('Please enter a valid email address');
      cy.get('.login-btn').should('be.disabled');

      cy.get('#email').clear().type('hello@example.com').blur();
      cy.get('.error-message').should('not.exist');
      cy.get('.login-btn').should('not.be.disabled');
    });

    it('should validate the password', () => {
      cy.get('#email').clear().type('hello@example.com').blur();
      cy.get('#password').clear().type('x').clear().blur();
      cy.get('.error-message').contains('Please enter a valid password');
      cy.get('.login-btn').should('be.disabled');

      cy.get('#password').clear().type('x');
      cy.get('.error-message').should('not.exist');
      cy.get('.login-btn').should('not.be.disabled');
    });

    it('should not login with the wrong credentials', () => {
      cy.route({ method: 'POST', url: '/authentication/login', status: 401, response: { errorMessage: 'Oops!'} });

      cy.get('#email').clear().type('hello@example.com').blur();
      cy.get('#password').clear().type('x').blur();
      cy.get('.login-btn').click();

      cy.get('.error-message').contains('401 Oops!');
    });

    it('should login', () => {
      cy.route('POST', '/authentication/login', 'fixture:user.json');
      cy.route('GET', '/orchestrator/workflows/executions/*', 'fixture:workflow-executions.json');
      cy.route('GET', '/datasets/*', 'fixture:dataset.json');

      cy.get('#email').clear().type('hello@example.com').blur();
      cy.get('#password').clear().type('x').blur();
      cy.get('.login-btn').click();

      cy.url().should('contain', '/dashboard');
    });
  });
});
