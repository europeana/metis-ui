context('Sandbox', () => {
  describe('cookie policy', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    const selCookiePolicy = '[data-e2e="cookie-policy"]';
    const selHamburger = '.hamburger';

    it('should show the cookie policy when the user goes there directly', () => {
      cy.get(selCookiePolicy).should('not.exist');
      cy.visit('/cookie-policy');
      cy.get(selCookiePolicy).should('have.length', 1);
    });

    it('should show the cookie policy when the user clicks the sidebar link', () => {
      cy.get(selCookiePolicy).should('not.exist');
      cy.get(selHamburger).click();
      cy.wait(10);
      cy.get('.sidebar-outer a')
        .contains('Cookies Policy')
        .should('have.length', 1)
        .click({ force: true });
      cy.get(selCookiePolicy).should('have.length', 1);
    });
  });
});
