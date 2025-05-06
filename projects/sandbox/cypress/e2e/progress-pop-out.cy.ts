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
      cy.visit('/dataset');
    });

    const datasetIdContentTier = '1';
    const datasetIdMetadataTier = '5';
    const datasetIdBoth = '3';

    const selectorView = '.pop-out';
    const selectorPopOutCloser = selectorProgressOrb;
    const selectorPopOutOpener = `${selectorView} .orb-container:not(.hidden) .nav-orb`;
    const selectorOpen = `${selectorView}.open`;
    const selectorOpenerWarning = `${selectorPopOutOpener}.warning-animated`;
    const selectorCloseLink = `${selectorOpen} .warning-view-title`;
    const force = { force: true };

    it('should link to the correct section of the report', () => {
      fillProgressForm(datasetIdBoth);

      const selectorReportLink = `${selectorView} .view-record-report`;
      const reportHeaderContentTier = 'Content Tier Breakdown';
      const reportHeaderMetadataTier = 'Metadata Tier Breakdown';
      const selReportHeader = '.report-header';

      cy.get(selectorPopOutOpener)
        .first()
        .click(force);

      cy.get(selectorReportLink)
        .filter(':visible')
        .first()
        .click(force);

      cy.get(selReportHeader)
        .contains(reportHeaderContentTier)
        .should('have.length', 1);

      cy.get(selReportHeader)
        .contains(reportHeaderMetadataTier)
        .should('not.exist');

      cy.get(selectorProgressOrb).click();

      cy.get(selectorPopOutOpener)
        .last()
        .click(force);

      cy.get(selectorReportLink)
        .filter(':visible')
        .first()
        .click(force);

      cy.get(selReportHeader)
        .contains(reportHeaderContentTier)
        .should('not.exist');

      cy.get(selReportHeader)
        .contains(reportHeaderMetadataTier)
        .should('have.length', 1);
    });

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

    it('should close when the user clicks the internal title', () => {
      fillProgressForm(datasetIdBoth);
      cy.get(selectorOpen).should('not.exist');
      cy.get(selectorCloseLink).should('not.exist');
      cy.get(selectorPopOutOpener)
        .first()
        .click(force);
      cy.get(selectorOpen).should('exist');
      cy.get(selectorCloseLink).click(force);
      cy.get(selectorOpen).should('not.exist');
    });
  });
});
