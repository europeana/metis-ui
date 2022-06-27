import { cleanupUser, setupUser } from '../support/helpers';

context('metis-ui', () => {
  describe('history', () => {
    const selectorHistoryGrid = '.table-grid.history';
    const userName = 'Valentine Charles';

    beforeEach(() => {
      cy.server();
      setupUser();
      cy.visit('/dataset/log/2');
    });

    afterEach(() => {
      cleanupUser();
    });

    it('should show the error bullets', () => {
      cy.get(`${selectorHistoryGrid} .table-grid-row-start .orb-status`)
        .eq(5)
        .should('have.class', 'status-finished');
    });

    it('should show the log', () => {
      const selectorHistoryGridDesktop = `${selectorHistoryGrid} .plugin-name.desktop`;

      cy.get(selectorHistoryGridDesktop)
        .eq(0)
        .contains('Process Media');
      cy.get(selectorHistoryGridDesktop)
        .eq(1)
        .contains('Enrich');
      cy.get(selectorHistoryGridDesktop)
        .eq(2)
        .contains('Normalise');
      cy.get(selectorHistoryGridDesktop)
        .eq(3)
        .contains('Validate (EDM internal)');
      cy.get(selectorHistoryGridDesktop)
        .eq(4)
        .contains('Transform');
      cy.get(selectorHistoryGridDesktop)
        .eq(5)
        .contains('Validate (EDM external)');
      cy.get(selectorHistoryGridDesktop)
        .eq(6)
        .contains('Import OAI-PMH');
    });

    it('should show the user who cancelled an execution', () => {
      cy.get(`${selectorHistoryGrid} .head-text.workflow .user`)
        .eq(1)
        .contains('Cancelled by');
      cy.get(`${selectorHistoryGrid} .head-text.workflow`)
        .eq(0)
        .contains(userName);
    });

    it('should show the user who started an execution', () => {
      cy.get(`${selectorHistoryGrid} .head-text.workflow .user`)
        .eq(0)
        .contains('Started by');
      cy.get(`${selectorHistoryGrid} .head-text.workflow`)
        .eq(0)
        .contains(userName);
    });
  });
});
