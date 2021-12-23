import { selectorLinkDatasetForm } from '../support/selectors';

context('Sandbox', () => {
  describe('Report Form', () => {
    beforeEach(() => {
      cy.server();
      cy.visit('/1/2');
    });

    const selectorSubmit = '[data-e2e="submitRecord"]';
    const selectorInputRecordId = '[data-e2e="recordToTrack"]';
    const selectorLinkTrackForm = '[data-e2e="link-track-form"]';
    const selectorProgressOrb = '.orb-status.progress-orb';
    const selectorDatasetOrb = '.wizard-status .orb-status:not(.progress-orb, .report-orb)';

    it('should show the input and submit button', () => {
      cy.get(selectorSubmit).should('have.length', 1);
      cy.get(selectorSubmit).should('not.be.disabled');
      cy.get(selectorInputRecordId).should('have.value', '2');
    });

    it('should link to the progress / track form', () => {
      cy.get(selectorProgressOrb)
        .filter(':visible')
        .should('have.length', 0);
      cy.get(selectorLinkTrackForm).click();
      cy.get(selectorLinkTrackForm).should('have.length', 0);
      cy.get(selectorProgressOrb)
        .filter(':visible')
        .should('have.length', 1);
    });

    it('should link to the datset form', () => {
      cy.get(selectorProgressOrb)
        .filter(':visible')
        .should('have.length', 0);
      cy.get(selectorDatasetOrb)
        .filter(':visible')
        .should('have.length', 0);
      cy.get(selectorLinkDatasetForm).click();
      cy.get(selectorProgressOrb)
        .filter(':visible')
        .should('have.length', 1);
      cy.get(selectorDatasetOrb)
        .filter(':visible')
        .should('have.length', 3);
    });
  });
});
