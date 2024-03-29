context('Sandbox', () => {
  describe('privacy policy', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    const selPrivacy = '[data-e2e="privacy-policy"]';
    const selHamburger = '.hamburger';

    it('should show the privacy policy when the user goes there directly', () => {
      cy.get(selPrivacy).should('not.exist');
      cy.visit('/privacy-policy');
      cy.get(selPrivacy).should('have.length', 1);
    });

    it('should show the privacy policy when the user clicks the sidebar link', () => {
      cy.get(selPrivacy).should('not.exist');
      cy.get(selHamburger).click();
      cy.wait(10);
      cy.get('.sidebar-outer a')
        .contains('Privacy Policy')
        .should('have.length', 1)
        .click({ force: true });
      cy.get(selPrivacy).should('have.length', 1);
    });
  });
});
