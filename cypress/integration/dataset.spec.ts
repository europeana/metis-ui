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

    it('should show the dataset', () => {
      cy.get('.dataset-name').contains('datasetName');
    });
  });
});
