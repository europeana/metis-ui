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
      cy.visit('/dataset');
    });

    const datasetIdContentTier = '1';
    const datasetIdMetadataTier = '5';
    const datasetIdBoth = '3';

    const selectorView = '.warning-view';
    const selectorPopOutCloser = selectorProgressOrb;
    const selectorPopOutOpener = `${selectorView} .orb-container:not(.hidden) .nav-orb`;
    const selectorOpen = `${selectorView}:not(.closed)`;
    const selectorOpenerWarning = `${selectorPopOutOpener}.warning-animated`;
    const force = { force: true };

    it('should show the openers', () => {
      cy.get(selectorPopOutOpener).should('not.exist');
      fillProgressForm(datasetIdContentTier);
      cy.get(selectorPopOutOpener).should('have.length', 1);
      fillProgressForm(datasetIdBoth);
      cy.get(selectorPopOutOpener).should('have.length', 2);
      fillProgressForm(datasetIdMetadataTier);
      cy.get(selectorPopOutOpener).should('have.length', 1);
    });

    it('should open', () => {
      fillProgressForm(datasetIdContentTier);
      cy.get(selectorOpen).should('not.exist');
      cy.get(selectorPopOutOpener)
        .first()
        .click(force);
      cy.get(selectorOpen).should('exist');
    });

    it('should hide the opener warnings once opened', () => {
      fillProgressForm(datasetIdBoth);
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
      fillProgressForm(datasetIdBoth);
      fillRecordForm('1');
      cy.get(selectorLinkProgressForm).click(force);
      cy.get(selectorPopOutOpener)
        .first()
        .click(force);
      cy.get(selectorOpen).should('exist');

      cy.get(selectorReportOrb).click(force);
      cy.location('pathname').should('equal', `/dataset/${datasetIdBoth}`);

      cy.get(selectorProgressOrb).click(force);
      cy.location('search').should('equal', '');
      cy.get(selectorOpen).should('exist');
    });

    it('should close when new data is loaded', () => {
      fillProgressForm(datasetIdBoth);
      cy.get(selectorPopOutOpener)
        .first()
        .click(force);
      cy.get(selectorOpen).should('exist');

      fillProgressForm('2');
      cy.get(selectorOpen).should('not.exist');
    });

    it('should close when the user clicks outside', () => {
      fillProgressForm(datasetIdBoth);
      cy.get(selectorPopOutOpener)
        .first()
        .click(force);
      cy.get(selectorOpen).should('exist');
      cy.get(selectorInputDatasetId).click();
      cy.get(selectorOpen).should('not.exist');
    });
  });
});
