context('Sandbox', () => {
  describe('App', () => {
    beforeEach(() => {
      cy.server();
      cy.visit('/');
    });

    const selectorLogo = '.metis-logo .logo';
    const selectorWizard = '#wizard';

    it('should show the hader and the wizard', () => {
      cy.get(selectorLogo).should('have.length', 1);
      cy.get(selectorWizard).should('have.length', 1);
    });
  });
});
