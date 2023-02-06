import { fillProgressForm, fillRecordForm, getSelectorPublishedUrl } from '../support/helpers';
import {
  selectorInputDatasetId,
  selectorPatternProblemsRecordOrb,
  selectorProgressOrb
} from '../support/selectors';

context('Sandbox', () => {
  describe('Links Pop-Out', () => {
    beforeEach(() => {
      cy.server();
      cy.visit('/dataset');
    });

    const selectorView = '.pop-out';
    const selectorOpen = `${selectorView}.open`;
    const selectorPopOutOpener = `.nav-orb.labelled.element-orb`;

    const force = { force: true };

    it('should show the opener', () => {
      cy.get(selectorPopOutOpener).should('not.exist');
      fillProgressForm('1');
      fillRecordForm('121', true);
      cy.get(selectorPopOutOpener).should('have.length', 1);
    });

    it('should open', () => {
      fillProgressForm('1');
      fillRecordForm('121', true);
      cy.get(selectorOpen).should('not.exist');
      cy.get(selectorPopOutOpener).click(force);
      cy.get(selectorOpen).should('exist');
    });

    it('should load the urls when opened (quick load)', () => {
      const datasetId1 = '1';
      const datasetId2 = '2';
      const recordId1 = '121';
      const recordId2 = '123';
      const selectorLink1 = getSelectorPublishedUrl(datasetId1, recordId1);
      const selectorLink2 = getSelectorPublishedUrl(datasetId2, recordId2);

      fillProgressForm(datasetId1);
      fillRecordForm(recordId1, true);

      cy.get(selectorOpen).should('not.exist');
      cy.get(selectorPopOutOpener).click(force);
      cy.get(selectorLink1).should('exist');
      cy.get(selectorLink2).should('not.exist');

      fillProgressForm(datasetId2);
      fillRecordForm(recordId2, true);
      cy.get(selectorPopOutOpener).click(force);

      cy.get(selectorLink1).should('not.exist');
      cy.get(selectorLink2).should('exist');
    });

    it('should load the urls when opened (delayed load)', () => {
      const datasetId = '1';
      const waitTime = 1001;
      const recordId = `${waitTime}`;
      const selectorLink = getSelectorPublishedUrl(datasetId, recordId);

      fillProgressForm(datasetId);
      fillRecordForm(recordId, true);

      cy.get(selectorPopOutOpener).click(force);
      cy.get(selectorLink).should('not.exist');
      cy.wait(waitTime);
      cy.get(selectorLink).should('exist');
    });

    it('should handle the error when loading fails', () => {
      const selErrors = '.load-error';
      fillProgressForm('1');
      fillRecordForm('1-four-o-four', true);
      cy.get(selErrors).should('not.exist');
      cy.get(selectorPopOutOpener).click(force);
      cy.get(selErrors).should('exist');
    });

    it('should remain open when the user changes tabs', () => {
      fillProgressForm('1');
      fillRecordForm('121', true);

      cy.get(selectorPopOutOpener).click(force);
      cy.get(selectorOpen)
        .filter(':visible')
        .should('exist');

      cy.get(selectorProgressOrb).click(force);
      cy.location('pathname').should('equal', `/dataset/1`);
      cy.get(selectorOpen)
        .filter(':visible')
        .should('not.exist');

      cy.get(selectorPatternProblemsRecordOrb).click(force);
      cy.get(selectorOpen)
        .filter(':visible')
        .should('exist');
    });

    it('should close when the user clicks outside', () => {
      fillProgressForm('1');
      fillRecordForm('121', true);

      cy.get(selectorPopOutOpener).click(force);
      cy.get(selectorOpen)
        .filter(':visible')
        .should('exist');

      cy.get(selectorInputDatasetId).click();
      cy.get(selectorOpen).should('not.exist');
    });
  });
});
