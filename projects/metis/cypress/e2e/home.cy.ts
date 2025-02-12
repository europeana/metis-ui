context('metis-ui', () => {
  const selMenuLoggedIn = '.metis-user';

  const signIn = (): void => {
    cy.get(selMenuLoggedIn).should('not.exist');

    cy.get('a.signup')
      .contains('Sign in')
      .click();
    cy.get('ul.menu-sublevel a')
      .contains('Sign in')
      .click();
  };

  const signOut = (): void => {
    cy.get(selMenuLoggedIn).click();
    cy.get('ul.menu-sublevel a')
      .contains('Sign out')
      .click();
  };

  describe('home (not logged in)', () => {
    beforeEach(() => {
      cy.visit('/home');
    });

    it('should not show the search form', () => {
      cy.get('.search-form').should('not.exist');
    });

    it('should show the home screen and have signin and signout links', () => {
      cy.get('h2').contains('What can you do with Metis?');
    });

    it('should have signin and signout links', () => {
      signIn();
      cy.get(selMenuLoggedIn).should('exist');

      signOut();
      cy.get(selMenuLoggedIn).should('not.exist');
    });
  });

  describe('home (logged in)', () => {
    beforeEach(() => {
      cy.visit('/home');
      signIn();
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
