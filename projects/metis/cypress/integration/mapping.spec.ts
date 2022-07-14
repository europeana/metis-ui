import { cleanupUser, setupUser } from '../support/helpers';

context('metis-ui', () => {
  describe('mapping', () => {
    afterEach(() => {
      cleanupUser();
    });

    beforeEach(() => {
      cy.server();
      setupUser();
      cy.visit('/dataset/mapping/0');
    });

    const selBtnInitDefault = '[data-e2e=xslt-init-default]';
    const selBtnTryDefaultXSLT = '[data-e2e=xslt-try-default]';
    const selEditors = '.view-sample';
    const selStatistics = '.view-statistics';

    it('should show the statistics', () => {
      cy.get(selStatistics).should('have.length', 1);
      cy.get(selEditors).should('have.length', 1);
    });

    it('should show try out XSLT', () => {
      const btnLabel = 'Go back to Mapping';

      cy.get('button')
        .contains(btnLabel)
        .should('not.exist');
      cy.url().should('not.contain', '/preview');
      cy.url().should('contain', '/mapping');

      cy.get(selBtnTryDefaultXSLT).click();

      cy.url().should('contain', '/preview');
      cy.url().should('not.contain', '/mapping');

      cy.get('button')
        .contains(btnLabel)
        .should('have.length', 1);
      cy.get('button').click();

      cy.url().should('not.contain', '/preview');
      cy.url().should('contain', '/mapping');
    });

    it('should initialise an editor with the default XSLT', () => {
      cy.get(selBtnInitDefault).should('have.length', 0);
      cy.visit('/dataset/mapping/1');
      cy.get(selBtnInitDefault).should('have.length', 1);

      cy.get(selEditors).should('have.length', 1);
      cy.get(selBtnInitDefault).click();
      cy.get(selEditors).should('have.length', 2);

      cy.get('button')
        .contains('Cancel')
        .should('have.length', 1);
      cy.get('button')
        .contains('Reset to default XSLT')
        .should('have.length', 1);
      cy.get('button')
        .contains('Save')
        .should('have.length', 1);
      cy.get('button')
        .contains('Save XSLT & Try it out')
        .should('have.length', 1);
    });
  });
});
