import { setupUser, setupWorkflowRoutes } from '../support/helpers';

function getHistoryRow(index: number, sel: string): Cypress.Chainable {
  return cy.get(`.history-table tbody tr:nth-child(${index + 1}) ${sel}`);
}

context('metis-ui', () => {
  describe('dataset', () => {
    beforeEach(() => {
      cy.server({ force404: true });
      setupUser();
      setupWorkflowRoutes();

      cy.visit('/dataset/edit/64');
      cy.wait([
        '@getCountries', '@getLanguages',
        '@getDataset', '@getWorkflow', '@getWorkflowExecutions', '@getHarvestData'
      ]);
    });

    it('should show the dataset, general info, status, history', () => {
      cy.get('.dataset-name').contains('datasetName');

      cy.get('.metis-dataset-info-block dd').contains('Europeana');
      cy.get('.metis-dataset-info-block dd').contains('760');
      cy.get('.metis-dataset-info-block dd').contains('06/11/2018 - 10:27');

      cy.get('.dataset-actionbar .status').contains('Preview');
      cy.get('.dataset-actionbar .status').contains('FAILED');

      cy.get('.history-table tbody tr').should('have.length', 9);
      getHistoryRow(1, 'td').contains('Preview');
      getHistoryRow(1, 'td').contains('CANCELLED');
      getHistoryRow(2, 'td').contains('Process Media');
      getHistoryRow(2, 'td').contains('CANCELLED');
      getHistoryRow(8, 'td').contains('Import OAI-PMH');
      getHistoryRow(8, 'td').contains('FINISHED');
    });
  });
});
