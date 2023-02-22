context('Sandbox', () => {
  describe('App', () => {
    beforeEach(() => {
      cy.server();
      cy.visit('/dataset');
    });

    const selectorLogo = '.metis-logo .logo';
    const selectorSandboxNavigation = '.sandbox-navigation';
    const selectorFeedback = '[data-e2e=feedback-url]';
    const selectorUserGuide = '[data-e2e=user-guide-url]';
    const selectorDocumentation = '[data-e2e=documentation-url]';

    it('should show the header and the sandbox navigation component', () => {
      cy.get(selectorLogo).should('have.length', 1);
      cy.get(selectorSandboxNavigation).should('have.length', 1);
    });

    it('should open and close the side panel / user assistance urls', () => {
      const selHamburger = '.hamburger';

      cy.get(selectorFeedback)
        .filter(':visible')
        .should('not.exist');
      cy.get(selectorUserGuide)
        .filter(':visible')
        .should('not.exist');
      cy.get(selectorDocumentation)
        .filter(':visible')
        .should('not.exist');

      cy.get(selHamburger).click();

      cy.get(selectorFeedback)
        .filter(':visible')
        .should('have.length', 1);
      cy.get(selectorUserGuide)
        .filter(':visible')
        .should('have.length', 1);
      cy.get(selectorDocumentation)
        .filter(':visible')
        .should('have.length', 1);

      cy.get(selHamburger).click();

      cy.get(selectorFeedback)
        .filter(':visible')
        .should('not.exist');
      cy.get(selectorUserGuide)
        .filter(':visible')
        .should('not.exist');
      cy.get(selectorDocumentation)
        .filter(':visible')
        .should('not.exist');
    });
  });
});
