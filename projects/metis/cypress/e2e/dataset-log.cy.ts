import { cleanupUser, setupUser } from '../support/helpers';

context('metis-ui', () => {
  describe('log', () => {
    const force = { force: true };
    const selectorModal = '.modal';
    const selectorOpener = '[data-e2e="open-log"]';

    beforeEach(() => {
      cy.server();
      setupUser();
      cy.visit('/dataset/edit/0');
      cy.wait(1000);
    });

    afterEach(() => {
      cleanupUser();
    });

    it('should open the log', () => {
      cy.get(selectorModal).should('not.exist');
      cy.get(selectorOpener)
        .eq(0)
        .click(force);
      cy.get(selectorModal).should('have.length', 1);
    });
  });
});
