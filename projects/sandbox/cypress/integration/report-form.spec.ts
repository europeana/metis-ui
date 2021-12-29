import {
  selectorBtnSubmitRecord,
  selectorInputRecordId,
  selectorLinkDatasetForm,
  selectorLinkProgressForm,
  selectorProgressOrb
} from '../support/selectors';

context('Sandbox', () => {
  describe('Report Form', () => {
    beforeEach(() => {
      cy.server();
      cy.visit('/1/2');
    });

    const force = { force: true };
    const selectorDatasetOrb = '.wizard-status .nav-orb:not(.progress-orb, .report-orb)';

    it('should show the input and submit button', () => {
      cy.get(selectorBtnSubmitRecord).should('have.length', 1);
      cy.get(selectorBtnSubmitRecord).should('not.be.disabled');
      cy.get(selectorInputRecordId).should('have.value', '2');
    });

    it('should link to the progress / track form', () => {
      cy.get(selectorProgressOrb)
        .filter(':visible')
        .should('have.length', 0);
      cy.get(selectorLinkProgressForm)
        .scrollIntoView()
        .should('be.visible');
      cy.wait(500);
      cy.get(selectorLinkProgressForm)
        .scrollIntoView()
        .click(force);
      cy.get(selectorLinkProgressForm).should('have.length', 0);
      cy.get(selectorProgressOrb)
        .filter(':visible')
        .should('have.length', 1);
    });

    it('should link to the dataset form (without opening the progress form)', () => {
      cy.get(selectorProgressOrb)
        .filter(':visible')
        .should('have.length', 0);
      cy.get(selectorDatasetOrb)
        .filter(':visible')
        .should('have.length', 0);

      cy.scrollTo('bottom');
      cy.wait(500);
      cy.get(selectorLinkDatasetForm).click();

      cy.get(selectorProgressOrb)
        .filter(':visible')
        .should('have.length', 0);
      cy.get(selectorDatasetOrb)
        .filter(':visible')
        .should('have.length', 3);
    });
  });
});
