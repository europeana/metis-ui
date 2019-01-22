import { checkAHref, setupUser, setupWorkflowRoutes } from '../support/helpers';

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

function checkFormField(name: string, value: string): void {
  const label = cy.get('.form-group label').contains(name);
  const input = label.closest('.form-group').find('input');
  input.should('have.value', value);
}

function checkStaticField(name: string, value: string): void {
  const label = cy.get('.form-group label').contains(name);
  const input = label.closest('.form-group').find('span');
  input.contains(value);
}

function checkPluginStatus(name: string, enabled: boolean): void {
  cy.get(enabled ? '.predefined-steps li' : '.predefined-steps li.inactive').contains(name);

  const input = cy
    .get('.plugin')
    .contains(name)
    .closest('.plugin')
    .find('input');
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
      cy.get('@dd').contains('06/11/2018 - 10:27');

      cy.get('.dataset-actionbar .status').as('status');
      cy.get('@status').contains('Preview');
      cy.get('@status').contains('FAILED');

      cy.get('.history-table tbody tr').should('have.length', 8);
      getHistoryRow(0, 'td').contains('Preview');
      getHistoryRow(0, 'td').contains('CANCELLED');
      getHistoryRow(1, 'td').contains('Process Media');
      getHistoryRow(1, 'td').contains('CANCELLED');
      getHistoryRow(7, 'td').contains('Import OAI-PMH');
      getHistoryRow(7, 'td').contains('FINISHED');
    });

    it('should show the tabs', () => {
      cy.get('.tabs .tab-title').as('tabTitle');
      checkAHref(cy.get('@tabTitle').contains('Dataset Information'), '/dataset/edit/64');
      checkAHref(cy.get('@tabTitle').contains('Workflow'), '/dataset/workflow/64');
      checkAHref(cy.get('@tabTitle').contains('Mapping'), '/dataset/mapping/64');
      checkAHref(cy.get('@tabTitle').contains('Raw XML'), '/dataset/preview/64');
      checkAHref(cy.get('@tabTitle').contains('Processing history'), '/dataset/log/64');
    });
  });

  describe('dataset infomation', () => {
    beforeEach(() => {
      setupDatasetPage('edit');
      cy.wait(['@getCountries', '@getLanguages']);
    });

    it('should show the fields', () => {
      checkFormField('Dataset Name', 'datasetName');
      checkFormField('Provider', 'Europeana');
      checkStaticField('Date Created', '06/09/2018 - 09:29');
      checkStaticField('Created by', '1482250000003948017');
      checkStaticField('First published', '05/11/2018 - 16:38');
      checkStaticField('Last published', '06/11/2018 - 10:27');
      checkStaticField('Number of items published', '760');
      checkStaticField('Last date of harvest', '19/11/2018 - 10:10');
      checkStaticField('Number of items harvested', '760');
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
        .contains('Workflow created on 19/11/2018 10:10')
        .closest('tr')
        .as('headRow');

      cy.get('@headRow')
        .next()
        .as('row');
      cy.get('@row')
        .find('td')
        .contains('Validate (EDM external)');
      cy.get('@row')
        .find('td')
        .contains('0 (760)');
      cy.get('@row')
        .find('td')
        .contains('FINISHED');

      cy.get('@row')
        .next()
        .as('row');
      cy.get('@row')
        .find('td')
        .contains('Import OAI-PMH');
      cy.get('@row')
        .find('td')
        .contains('760');
      cy.get('@row')
        .find('td')
        .contains('FINISHED');
    });
  });
});
