context('Sandbox', () => {
  describe('App', () => {
    beforeEach(() => {
      cy.server();
      cy.visit('/');
    });

    const selectorLogo = '.metis-logo .logo';
    const selectorWizard = '.wizard';
    const selectorFeedback = '[data-e2e=feedback-url]';
    const selectorUserGuide = '[data-e2e=user-guide-url]';
    const selectorDocumentation = '[data-e2e=documentation-url]';

    it('should show the header and the wizard', () => {
      cy.get(selectorLogo).should('have.length', 1);
      cy.get(selectorWizard).should('have.length', 1);
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
