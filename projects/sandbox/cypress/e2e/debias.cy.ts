context('Sandbox', () => {
  describe('Debias', () => {
    const force = { force: true };
    const selDebiasLink = 'li .debias-link';
    const txtNoDetections = 'No Biases Found';
    const pollInterval = 2000;

    it('should toggle the info', () => {
      cy.visit('/dataset/3');
      cy.wait(pollInterval);
      cy.get(selDebiasLink)
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
      cy.wait(1000);
      cy.get(selDebiasLink).should('not.exist');
    });

    it('should show an empty report', () => {
      cy.visit('/dataset/28');
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
      cy.wait(pollInterval);
      cy.get(selDebiasLink)
        .last()
        .click(force);
      cy.contains(txtNoDetections).should('not.exist');
    });
  });
});
