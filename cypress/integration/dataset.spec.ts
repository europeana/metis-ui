import { setupUser, setupWorkflowRoutes, checkAHref } from '../support/helpers';

function setupDatasetPage(name: string): void {
    cy.server({ force404: true });
    setupUser();
    setupWorkflowRoutes();

    cy.visit(`/dataset/${name}/64`);
    cy.wait(['@getDataset', '@getWorkflow', '@getWorkflowExecutions', '@getHarvestData']);
}

function getHistoryRow(index: number, sel: string): Cypress.Chainable {
  return cy.get(`.history-table tbody tr:nth-child(${index + 1}) ${sel}`);
}

function checkFormGroup(name: string, value: string): void {
  const label = cy.get('.form-group label').contains(name);
  const input = label.closest('.form-group').find('input');
  input.should('have.value', value);
}

function checkPluginStatus(name: string, enabled: boolean): void {
  cy.get(enabled ? '.predefined-steps li' : '.predefined-steps li.inactive')
    .contains(name);

  const input = cy.get('.plugin').contains(name).closest('.plugin').find('input');
  input.should(enabled ? 'be.checked' : 'not.be.checked');
}

context('metis-ui', () => {
  describe('dataset page', () => {
    beforeEach(() => {
      setupDatasetPage('edit');
      cy.wait(['@getCountries', '@getLanguages']);
    });

    it('should show the dataset, general info, status, history', () => {
      cy.get('.dataset-name').contains('datasetName');

      cy.get('.metis-dataset-info-block dd').as('dd');
      cy.get('@dd').contains('Europeana');
      cy.get('@dd').contains('760');
      cy.get('@dd').contains('06/11/2018');

      cy.get('.dataset-actionbar .status').as('status');
      cy.get('@status').contains('Preview');
      cy.get('@status').contains('FAILED');

      cy.get('.history-table tbody tr').should('have.length', 9);
      getHistoryRow(1, 'td').contains('Preview');
      getHistoryRow(1, 'td').contains('CANCELLED');
      getHistoryRow(2, 'td').contains('Process Media');
      getHistoryRow(2, 'td').contains('CANCELLED');
      getHistoryRow(8, 'td').contains('Import OAI-PMH');
      getHistoryRow(8, 'td').contains('FINISHED');
    });

    it('should show the tabs', () => {
      cy.get('.tabs .tab-title').as('tabTitle');
      checkAHref(cy.get('@tabTitle').contains('Dataset Information'), '/dataset/new/64');
      checkAHref(cy.get('@tabTitle').contains('Workflow'), '/dataset/workflow/64');
      checkAHref(cy.get('@tabTitle').contains('Mapping'), '/dataset/mapping/64');
      checkAHref(cy.get('@tabTitle').contains('Raw XML'), '/dataset/preview/64');
      checkAHref(cy.get('@tabTitle').contains('Processing history'), '/dataset/log/64');
    });
  });

  describe('dataset infomation', () => {
    beforeEach(() => {
      setupDatasetPage('new');
      cy.wait(['@getCountries', '@getLanguages']);
    });

    it('should show the fields', () => {
      checkFormGroup('Identifier', '58');
      checkFormGroup('Dataset Name *', 'datasetName');
      checkFormGroup('Provider *', 'Europeana');
      checkFormGroup('Created by', '1482250000003948017');
      checkFormGroup('Number of items published', '760');
      checkFormGroup('Number of items harvested', '760');
    });

    // TODO: edit
  });

  describe('dataset workflow', () => {
    beforeEach(() => {
      setupDatasetPage('workflow');
    });

    it('should show the workflow', () => {
      checkPluginStatus('Import', true);
      checkPluginStatus('Validate (EDM external)', false);
      checkPluginStatus('Transform', true);
      checkPluginStatus('Validate (EDM internal)', false);
      checkPluginStatus('Normalise', false);
      checkPluginStatus('Enrich', false);
      checkPluginStatus('Process Media', true);
      checkPluginStatus('Preview', false);
      checkPluginStatus('Publish', false);
      checkPluginStatus('Check Links', true);
    });

    // TODO: check and update fields
  });

  // TODO: mapping

  // TODO: preview

  describe('dataset log', () => {
    beforeEach(() => {
      setupDatasetPage('log');
    });

    it('should show the log', () => {
      cy.get('.workflow-head')
        .contains('Workflow created on 12/11/2018')
        .closest('tr')
        .as('headRow');

      cy.get('@headRow').next().as('row');
      cy.get('@row').find('td').contains('Validate (EDM external)');
      cy.get('@row').find('td').contains('0 (760)');
      cy.get('@row').find('td').contains('FINISHED');

      cy.get('@row').next().as('row');
      cy.get('@row').find('td').contains('Import OAI-PMH');
      cy.get('@row').find('td').contains('760');
      cy.get('@row').find('td').contains('FINISHED');
    });
  });
});
