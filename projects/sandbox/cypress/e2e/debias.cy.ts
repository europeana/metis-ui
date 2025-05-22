import { fillProgressForm, login } from '../support/helpers';

context('Sandbox', () => {
  describe('Debias', () => {
    const force = { force: true };
    const selCsvDownload = '.csv-download';
    const selDebiasLink = 'li .debias-link';
    const selDebiasOpener = '.debias-opener';
    const selDetailPanel = '.debias-detail';
    const selDebiasReport = '.debias';
    const selErrorDetail = '.error-detail';
    const selErrorCloser = `${selErrorDetail} .cross`;
    const selModalClose = '.modal .head .btn-close';
    const txtNoDetections = 'No Biases Found';
    const pollInterval = 2000;

    const termWithDetail = 'aboriginal';
    const termWithConnectionError = 'connection';
    const termWithError = 'data';

    const idEmptyReport = '28';
    const idWithReport = '12';
    const idWithErrors = '12';

    const urlEmptyReport = `/dataset/${idEmptyReport}`;
    const urlWithReport = `/dataset/${idWithReport}`;
    const urlWithErrors = `/dataset/${idWithErrors}`;

    const goToDatasetAsDefaultUser = (id: string): void => {
      cy.visit('/dataset');
      login();
      fillProgressForm(id);
      cy.wait(pollInterval);
    };

    const checkReportOpens = (doesOpen = true): void => {
      cy.get(selDebiasReport).should('not.exist');
      cy.get(selDebiasLink)
        .last()
        .click(force);
      cy.wait(pollInterval);
      if (doesOpen) {
        cy.get(selDebiasReport).should('exist');
      } else {
        cy.get(selDebiasReport).should('not.exist');
      }
    };

    const openReportById = (id: string): void => {
      goToDatasetAsDefaultUser(id);
      checkReportOpens();
    };

    const openReportWithUserFromUrl = (url: string): void => {
      cy.visit(url);
      login();
      cy.wait(pollInterval);
      checkReportOpens();
    };

    it('should toggle the info', () => {
      goToDatasetAsDefaultUser(idWithReport);
      cy.wait(pollInterval);

      cy.get(selDebiasLink)
        .last()
        .click(force);

      cy.wait(pollInterval);

      cy.get(selDebiasOpener)
        .last()
        .click(force);
      cy.wait(pollInterval);

      const selHeader = '.debias-header';
      const selInfoToggle = `${selDebiasReport} .open-info`;
      const selOverlay = '.debias-overlay.active';

      cy.get(selHeader).should('have.class', 'closed');
      cy.get(selOverlay).should('not.exist');

      cy.get(selInfoToggle).click();

      cy.get(selHeader).should('not.have.class', 'closed');
      cy.get(selOverlay).should('exist');
    });

    it('should not allow debias checks for failed datasets', () => {
      goToDatasetAsDefaultUser('909');
      cy.get(selDebiasLink).should('not.exist');
    });

    it('should show an empty report', () => {
      goToDatasetAsDefaultUser(idEmptyReport);
      cy.get(selDebiasLink)
        .last()
        .click(force);
      cy.wait(1);
      cy.get(selDebiasLink)
        .last()
        .click(force);
      cy.contains(txtNoDetections).should('exist');
    });

    it('should show a report', () => {
      openReportById(idWithReport);
      cy.get(selDebiasReport).should('exist');
      cy.contains(txtNoDetections).should('not.exist');
    });

    it('should close the report', () => {
      openReportById(idWithReport);
      cy.get(selDebiasReport).should('exist');
      cy.get(selModalClose).click();
      cy.get(selDebiasReport).should('not.exist');
    });

    it('should handle dereference errors', () => {
      openReportById(idWithErrors);
      cy.get('.term-highlight')
        .contains(termWithError)
        .click();

      cy.get(selDetailPanel)
        .filter(':visible')
        .should('not.exist');

      cy.get(selErrorDetail).should('exist');
      cy.get(selErrorCloser).click();
      cy.get(selErrorDetail).should('not.exist');
    });

    it('should handle dereference connection errors', () => {
      openReportWithUserFromUrl(urlWithErrors);
      cy.get('.term-highlight')
        .contains(termWithConnectionError)
        .click();

      cy.get(selDetailPanel)
        .filter(':visible')
        .should('not.exist');

      cy.get(selErrorDetail).should('exist');
      cy.get(selErrorCloser).click();
      cy.get(selErrorDetail).should('not.exist');
    });

    it('should open and close the debias detail', () => {
      const selDetailPanelClose = '.debias-detail .btn-close-detail';

      openReportWithUserFromUrl(urlWithReport);
      cy.get(selDetailPanel)
        .filter(':visible')
        .should('not.exist');

      cy.get('.term-highlight')
        .contains(termWithDetail)
        .first()
        .click();
      cy.get(selDetailPanel)
        .filter(':visible')
        .should('exist');

      cy.get(selDetailPanelClose).click();

      cy.get(selDetailPanel)
        .filter(':visible')
        .should('not.exist');
    });

    it('should close the debias detail when the debias report is closed', () => {
      openReportWithUserFromUrl(urlWithReport);

      cy.get(selDetailPanel)
        .filter(':visible')
        .should('not.exist');

      cy.get('.term-highlight')
        .contains(termWithDetail)
        .click();

      cy.get(selDetailPanel)
        .filter(':visible')
        .should('exist');

      // close and re-open the whole modal
      cy.get(selModalClose).click(force);
      cy.get(selDebiasLink)
        .first()
        .click(force);

      cy.get(selDetailPanel)
        .filter(':visible')
        .should('not.exist');
    });

    it('should show the download link', () => {
      openReportWithUserFromUrl(urlWithReport);
      cy.get(selCsvDownload)
        .filter(':visible')
        .should('exist');
    });

    it('should not show the download link when there is no data', () => {
      openReportWithUserFromUrl(urlEmptyReport);
      cy.get(selCsvDownload).should('not.exist');
    });

    it('should allow unauthenticated users to view the report', () => {
      cy.visit(urlWithReport);
      checkReportOpens();
    });

    it('should close the report returning from history', () => {
      openReportById(idWithReport);
      cy.get(selDebiasReport).should('exist');
      cy.go('back');
      cy.go('forward');
      cy.get(selDebiasReport).should('not.exist');
    });

    it('should close the report when the dataset id changes', () => {
      openReportById(idWithReport);
      fillProgressForm(idEmptyReport);
      checkReportOpens();
      cy.get(selDebiasReport).should('exist');
      cy.go('back');
      cy.get(selDebiasReport).should('not.exist');
    });
  });
});
