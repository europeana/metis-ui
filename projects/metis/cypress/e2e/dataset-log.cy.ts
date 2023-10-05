import { cleanupUser, setupUser } from '../support/helpers';

context('metis-ui', () => {
  describe('log', () => {
    const force = { force: true };
    const selectorModal = '.modal';
    const selectorOpener = '[data-e2e="open-log"]';

    beforeEach(() => {
      setupUser();
    });

    afterEach(() => {
      cleanupUser();
    });

    it('should open the log', () => {
      cy.visit('/dataset/edit/0');
      cy.get(selectorModal).should('not.exist');
      cy.get(selectorOpener)
        .eq(0)
        .click(force);
      cy.get(selectorModal).should('have.length', 1);
    });

    it('should report empty logs', () => {
      cy.visit('/dataset/edit/1');
      cy.get(selectorOpener)
        .eq(0)
        .click(force);
      cy.get(selectorModal).contains('No logs found (yet)');
    });

    it('should report unprocessed records', () => {
      cy.visit('/dataset/edit/3');
      cy.get(selectorOpener)
        .eq(0)
        .click(force);
      cy.get(selectorModal).contains('No records have been processed (yet)');
    });
  });
});
