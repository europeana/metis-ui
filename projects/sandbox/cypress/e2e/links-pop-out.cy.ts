import { fillProgressForm, fillRecordForm } from '../support/helpers';
import {
  selectorInputDatasetId,
  selectorPatternProblemsRecordOrb,
  selectorProgressOrb
} from '../support/selectors';

context('Sandbox', () => {
  describe('Links Pop-Out', () => {
    beforeEach(() => {
      cy.server();
      cy.visit('/');
    });

    const selectorView = '.record-links-view';
    const selectorOpen = `${selectorView}:not(.closed)`;
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

    it('should load the urls when opened', () => {
      fillProgressForm('1');
      fillRecordForm('121', true);

      const selectorLink1 = '[href="http://localhost:3000/dataset/1/record?recordId=121-eu"]';
      const selectorLink2 = '[href="http://localhost:3000/dataset/2/record?recordId=123-eu"]';

      cy.get(selectorOpen).should('not.exist');
      cy.get(selectorPopOutOpener).click(force);
      cy.get(selectorLink1).should('exist');
      cy.get(selectorLink2).should('not.exist');

      fillProgressForm('2');
      fillRecordForm('123', true);
      cy.get(selectorPopOutOpener).click(force);

      cy.get(selectorLink1).should('not.exist');
      cy.get(selectorLink2).should('exist');
    });

    it('should handle the error when loading fails', () => {
      const selErrors = '.errors';
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
