context('Sandbox', () => {
  describe('Progress Form', () => {
    beforeEach(() => {
      cy.server();
      cy.visit('/');
    });

    const selectorError = '.errors';
    const selectorInput = '[data-e2e="idToTrack"]';
    const selectorSubmit = '[data-e2e="submitProgress"]';
    const selectorProgressTitle = '.progress-title';

    it('should show the input and submit button', () => {
      cy.get(selectorInput).should('have.length', 1);
      cy.get(selectorSubmit).should('have.length', 1);
    });

    it('should show the progress on submit', () => {
      cy.get(selectorProgressTitle).should('have.length', 0);
      cy.get(selectorInput)
        .clear()
        .type('1');
      cy.get(selectorSubmit).click();
      cy.get(selectorProgressTitle).should('have.length', 1);
    });

    it('should show network errors', () => {
      cy.get(selectorError).should('have.length', 0);
      cy.get(selectorInput)
        .clear()
        .type('404');
      cy.get(selectorSubmit).click();
      cy.get(selectorSubmit).should('have.length', 1);
      cy.get(selectorInput)
        .clear()
        .type('500');
      cy.get(selectorError).should('have.length', 0);
      cy.get(selectorSubmit).click();
      cy.get(selectorError).should('have.length', 1);
    });
  });
});
