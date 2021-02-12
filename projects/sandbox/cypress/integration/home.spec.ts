context('sandbox', () => {
  describe('home', () => {
    beforeEach(() => {
      cy.server();
      cy.visit('/');
    });

    it('should show the page', () => {
      cy.get('.metis-sandbox').should('have.length', 1);
    });
  });
});
