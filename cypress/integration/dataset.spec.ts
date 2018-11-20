import { setupUser, setupWorkflowRoutes } from '../support/helpers';

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

    it('should show the dataset, general info, status', () => {
      cy.get('.dataset-name').contains('datasetName');

      cy.get('.metis-dataset-info-block dd').contains('Europeana');
      cy.get('.metis-dataset-info-block dd').contains('760');
      cy.get('.metis-dataset-info-block dd').contains('06/11/2018 - 10:27');

      cy.get('.dataset-actionbar .status').contains('Preview');
      cy.get('.dataset-actionbar .status').contains('FAILED');
    });
  });
});
