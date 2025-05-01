import { login } from '../support/helpers';

context('Sandbox', () => {
  describe('Debias', () => {
    const force = { force: true };
    const selCsvDownload = '.csv-download';
    const selDebiasLink = 'li .debias-link';
    const selDebiasOpener = '.debias-opener';
    const selDetailPanel = '.debias-detail';
    const selModalClose = '.modal .head .btn-close';
    const txtNoDetections = 'No Biases Found';
    const pollInterval = 2000;
    const urlEmptyReport = '/dataset/28';
    const urlWithReport = '/dataset/3';

    const openReport = (url: string): void => {
      cy.visit(url);
      login();
      cy.wait(pollInterval);
      cy.get('.debias').should('not.exist');
      cy.get(selDebiasLink)
        .last()
        .click(force);
      cy.get('.debias').should('exist');
    };

    it('should toggle the info', () => {
      cy.visit(urlWithReport);
      login();
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
      const selInfoToggle = '.debias .open-info';
      const selOverlay = '.debias-overlay.active';

      cy.get(selHeader).should('have.class', 'closed');
      cy.get(selOverlay).should('not.exist');

      cy.get(selInfoToggle).click(force);

      cy.get(selHeader).should('not.have.class', 'closed');
      cy.get(selOverlay).should('exist');
    });

    it('should not allow debias checks for failed datasets', () => {
      cy.visit('/dataset/909');
      login();
      cy.wait(1000);
      cy.get(selDebiasLink).should('not.exist');
    });

    it('should show an empty report', () => {
      cy.visit(urlEmptyReport);
      login();
      cy.wait(pollInterval);
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
      openReport(urlWithReport);
      cy.get('.debias').should('exist');
      cy.contains(txtNoDetections).should('not.exist');
    });

    it('should close the report', () => {
      openReport(urlWithReport);
      cy.get('.debias').should('exist');
      cy.get(selModalClose).click();
      cy.get('.debias').should('not.exist');
    });

    it('should open and close the debias detail', () => {
      const selDetailPanelClose = '.debias-detail .btn-close-detail';

      openReport(urlWithReport);
      cy.get(selDetailPanel)
        .filter(':visible')
        .should('not.exist');

      cy.get('.term-highlight')
        .first()
        .click();
      cy.get(selDetailPanel)
        .filter(':visible')
        .should('exist');

      cy.get(selDetailPanelClose).click(force);

      cy.get(selDetailPanel)
        .filter(':visible')
        .should('not.exist');
    });

    it('should close the debias detail when the debias report is closed', () => {
      openReport(urlWithReport);

      cy.get(selDetailPanel)
        .filter(':visible')
        .should('not.exist');

      cy.get('.term-highlight')
        .first()
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
      openReport(urlWithReport);
      cy.get(selCsvDownload)
        .filter(':visible')
        .should('exist');
    });

    it('should not show the download link when there is no data', () => {
      openReport(urlEmptyReport);
      cy.get(selCsvDownload).should('not.exist');
    });
  });
});
