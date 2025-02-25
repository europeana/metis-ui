context('metis-ui', () => {
  describe('unuathorised', () => {
    it('Prohibits unauthorised users from access', () => {
      cy.visit('/dataset/edit/0');
      cy.get('.modal').should('not.exist');
      cy.visit('/dataset/edit/403');
      cy.get('.modal .head')
        .contains('Account Unauthorised')
        .should('exist');
    });
  });
});
