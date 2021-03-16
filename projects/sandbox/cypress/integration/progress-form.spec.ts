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
    const selectorProgressTitleComplete = '.progress-title.complete';

    const selectorWarnPresent = '.orb-status.labelled.warn';
    const selectorFailPresent = '.orb-status.labelled.fail';
    const selectorSuccessPresent = '.orb-status.labelled.success';

    const selectorErrorLink = '.open-error-detail';
    const selectorModalDisplay = '.modal';

    const selPortalLinks = '.portal-links';

    it('should show the input and submit button', () => {
      cy.get(selectorInput).should('have.length', 1);
      cy.get(selectorSubmit).should('have.length', 1);
      cy.get(selectorSubmit).should('be.disabled');
    });

    it('should show the complete progress on submit', () => {
      cy.get(selectorProgressTitle).should('have.length', 0);
      cy.get(selectorProgressTitleComplete).should('have.length', 0);
      cy.get(selPortalLinks).should('have.length', 0);
      cy.get(selectorInput)
        .clear()
        .type('1');
      cy.get(selectorSubmit).click();
      cy.get(selectorProgressTitle).should('have.length', 1);
      cy.get(selectorProgressTitleComplete).should('have.length', 1);
      cy.get(selPortalLinks).should('have.length', 1);
    });

    it('should clear the input only on successful submits', () => {
      const errorVal = '400';
      cy.get(selectorInput)
        .clear()
        .type('1');
      cy.get(selectorSubmit).click();
      cy.get(selectorInput).should('have.value', '');
      cy.get(selectorInput)
        .clear()
        .type(errorVal);
      cy.get(selectorSubmit).click();
      cy.get(selectorInput).should('have.value', errorVal);
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

    it('should show the progress success', () => {
      cy.get(selectorSuccessPresent).should('have.length', 0);
      cy.get(selectorInput)
        .clear()
        .type('100');
      cy.get(selectorSubmit).click();
      cy.get(selectorSuccessPresent).should('have.length', 9);
    });

    it('should show the progress warn', () => {
      cy.get(selectorWarnPresent).should('have.length', 0);
      cy.get(selectorInput)
        .clear()
        .type('910');
      cy.get(selectorSubmit).click();
      cy.get(selectorWarnPresent).should('have.length', 9);
    });

    it('should show the progress fail', () => {
      cy.get(selectorFailPresent).should('have.length', 0);
      cy.get(selectorInput)
        .clear()
        .type('101');
      cy.get(selectorSubmit).click();
      cy.get(selectorFailPresent).should('have.length', 9);
    });

    it('should show the progress errors', () => {
      cy.get(selectorErrorLink).should('have.length', 0);
      cy.get(selectorModalDisplay).should('not.be.visible');
      cy.get(selectorInput)
        .clear()
        .type('10118');
      cy.get(selectorSubmit).click();
      cy.get(selectorErrorLink).should('have.length', 1);
      cy.get(selectorErrorLink).click();
      cy.get(selectorModalDisplay).should('be.visible');
    });
  });
});
