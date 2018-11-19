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
});
