import { login } from '../support/helpers';

context('Sandbox', () => {
  describe('Debias', () => {
    const force = { force: true };
    const selCsvDownload = '.csv-download';
    const selDebiasLink = 'li .debias-link';
    const selDebiasOpener = '.debias-opener';
    const txtNoDetections = 'No Biases Found';
    const pollInterval = 2000;
    const urlEmptyReport = '/dataset/28';

    it('should toggle the info', () => {
      cy.visit('/dataset/3');
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
      cy.visit('/dataset/3');
      login();
      cy.wait(pollInterval);
      cy.get(selDebiasLink)
        .last()
        .click(force);
      cy.contains(txtNoDetections).should('not.exist');
    });

    it('should show the download link', () => {
      cy.visit('/dataset/3');
      login();
      cy.get(selDebiasLink)
        .first()
        .click(force);
      cy.get(selCsvDownload)
        .filter(':visible')
        .should('exist');
    });

    it('should not show the download link when there is no data', () => {
      cy.visit(urlEmptyReport);
      login();
      cy.get(selDebiasLink)
        .first()
        .click(force);
      cy.get(selCsvDownload).should('not.exist');
    });
  });
});
