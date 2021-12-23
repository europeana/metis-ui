context('Sandbox', () => {
  describe('Progress Form', () => {
    beforeEach(() => {
      cy.server();
      cy.visit('/1/2');
    });

    const selectorSubmit = '[data-e2e="submitRecord"]';
    const selectorInputRecordId = '[data-e2e="recordToTrack"]';
    const selectorLinkTrackForm = '[data-e2e="link-track-form"]';

    it('should show the input and submit button', () => {
      cy.get(selectorSubmit).should('have.length', 1);
      cy.get(selectorSubmit).should('not.be.disabled');
      cy.get(selectorInputRecordId).should('have.value', '2');
    });

    it('should link to the progress / track form', () => {
      cy.get(selectorLinkTrackForm).click();
      cy.get(selectorLinkTrackForm).should('have.length', 0);
    });
  });
});
