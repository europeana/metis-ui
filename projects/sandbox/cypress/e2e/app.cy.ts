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

    it('should show the user assistance urls', () => {
      cy.get(selectorFeedback).should('have.length', 1);
      cy.get(selectorUserGuide).should('have.length', 1);
      cy.get(selectorDocumentation).should('have.length', 1);
    });
  });
});
