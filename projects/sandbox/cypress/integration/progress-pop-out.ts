import { fillProgressForm, fillRecordForm } from '../support/helpers';
import {
  selectorInputDatasetId,
  selectorLinkProgressForm,
  selectorProgressOrb,
  selectorReportOrb
} from '../support/selectors';

context('Sandbox', () => {
  describe('Progress Pop-Out', () => {
    beforeEach(() => {
      cy.server();
      cy.visit('/');
    });

    const datasetIdOpenerSingle = '1';
    const datasetIdOpenerDouble = '3';

    const selectorView = '.warning-view';
    const selectorPopOutCloser = selectorProgressOrb;
    const selectorPopOutOpener = `${selectorView} .nav-orb`;
    const selectorOpen = `${selectorView}:not(.closed)`;
    const selectorOpenerWarning = `${selectorPopOutOpener}.warning-animated`;
    const force = { force: true };

    it('should show the openers', () => {
      cy.get(selectorPopOutOpener).should('not.exist');
      fillProgressForm(datasetIdOpenerSingle);
      cy.get(selectorPopOutOpener).should('have.length', 1);
      fillProgressForm(datasetIdOpenerDouble);
      cy.get(selectorPopOutOpener).should('have.length', 2);
    });

    it('should open', () => {
      fillProgressForm(datasetIdOpenerSingle);
      cy.get(selectorOpen).should('not.exist');
      cy.get(selectorPopOutOpener)
        .first()
        .click(force);
      cy.get(selectorOpen).should('exist');
    });

    it('should hide the opener warnings once opened', () => {
      fillProgressForm(datasetIdOpenerDouble);
      cy.get(selectorOpenerWarning).should('have.length', 2);
      cy.get(selectorPopOutOpener)
        .first()
        .click(force);
      cy.get(selectorOpen).should('exist');
      cy.get(selectorOpenerWarning).should('have.length', 1);

      cy.get(selectorPopOutCloser).click(force);
      cy.get(selectorOpenerWarning).should('have.length', 1);

      cy.get(selectorPopOutOpener)
        .last()
        .click(force);
      cy.get(selectorOpen).should('exist');
      cy.get(selectorOpenerWarning).should('not.exist');

      cy.get(selectorPopOutCloser).click(force);
      cy.get(selectorOpenerWarning).should('not.exist');
    });

    it('should remain open when the user changes tabs', () => {
      fillProgressForm(datasetIdOpenerDouble);
      fillRecordForm('1');
      cy.get(selectorLinkProgressForm).click(force);
      cy.get(selectorPopOutOpener)
        .first()
        .click(force);
      cy.get(selectorOpen).should('exist');

      cy.get(selectorReportOrb).click(force);
      cy.location('pathname').should('equal', `/dataset/${datasetIdOpenerDouble}`);

      cy.get(selectorProgressOrb).click(force);
      cy.location('search').should('equal', '');
      cy.get(selectorOpen).should('exist');
    });

    it('should close when new data is loaded', () => {
      fillProgressForm(datasetIdOpenerDouble);
      cy.get(selectorPopOutOpener)
        .first()
        .click(force);
      cy.get(selectorOpen).should('exist');

      fillProgressForm('2');
      cy.get(selectorOpen).should('not.exist');
    });

    it('should close when the user clicks outside', () => {
      fillProgressForm(datasetIdOpenerDouble);
      cy.get(selectorPopOutOpener)
        .first()
        .click(force);
      cy.get(selectorOpen).should('exist');
      cy.get(selectorInputDatasetId).click();
      cy.get(selectorOpen).should('not.exist');
    });
  });
});
