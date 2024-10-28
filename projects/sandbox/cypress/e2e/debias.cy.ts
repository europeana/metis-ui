context('Sandbox', () => {
  describe('Debias', () => {
    const force = { force: true };
    const selDebiasLink = 'li .debias-link';
    const txtNoDetections = 'No Biases Found';
    const pollInterval = 2000;

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
