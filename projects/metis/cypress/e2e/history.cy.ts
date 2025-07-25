import { DepublicationReasonHash } from '../../test-data/_data/depublication-reasons';

context('metis-ui', () => {
  describe('history', () => {
    const selectorHistoryGrid = '.table-grid.history';
    const userNameCancel = 'Jochen Vermeulen';
    const userNameStart = 'Valentine Charles';

    beforeEach(() => {
      cy.visit('/dataset/log/2');
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
      cy.contains(`Cancelled by ${userNameCancel}`).should('exist');
    });

    it('should show the user who started an execution', () => {
      cy.contains(`Started by ${userNameStart}`).should('exist');
    });

    it('should show the throttle level', () => {
      cy.get('.history')
        .contains(`Strong Throttle`)
        .should('exist');
    });

    it('should show the depublish reason', () => {
      cy.visit('/dataset/log/3');
      cy.get('.pill')
        .contains(DepublicationReasonHash['GDPR'])
        .should('exist');
    });
  });
});
