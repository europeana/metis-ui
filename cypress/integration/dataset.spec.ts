import { checkAHref, setupUser, setupWorkflowRoutes } from '../support/helpers';

function setupDatasetPage(name: string): void {
  cy.server({ force404: true });
  setupUser();
  setupWorkflowRoutes();

  cy.visit(`/dataset/${name}/64`);
  cy.wait(['@getDataset', '@getWorkflow', '@getHarvestData']);
}

function getHistoryRow(index: number): Cypress.Chainable {
  return cy.get('.table-grid.last-execution .table-grid-row-start').eq(index);
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

      cy.get('.table-grid.last-execution .table-grid-row-start').should('have.length', 8);
      getHistoryRow(0).contains('Preview');
      getHistoryRow(1).contains('Process Media');
      getHistoryRow(7).contains('Import OAI-PMH');
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

  describe('dataset information', () => {
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
    });

    // TODO: check and update fields
  });
  // TODO: mapping

  // TODO: preview

  describe('dataset log', () => {
    beforeEach(() => {
      setupDatasetPage('log');
    });

    it('should show the error bullets', () => {
      cy.get('.table-grid.history .table-grid-row-start .orb-status')
        .eq(5)
        .should('have.class', 'status-failed');
    });

    it('should show the log', () => {
      cy.get('.table-grid.history .plugin-name.desktop')
        .eq(0)
        .contains('Preview');
      cy.get('.table-grid.history .plugin-name.desktop')
        .eq(1)
        .contains('Process Media');
      cy.get('.table-grid.history .plugin-name.desktop')
        .eq(2)
        .contains('Enrich');
      cy.get('.table-grid.history .plugin-name.desktop')
        .eq(3)
        .contains('Normalise');
      cy.get('.table-grid.history .plugin-name.desktop')
        .eq(4)
        .contains('Validate (EDM internal)');
      cy.get('.table-grid.history .plugin-name.desktop')
        .eq(5)
        .contains('Transform');
      cy.get('.table-grid.history .plugin-name.desktop')
        .eq(6)
        .contains('Validate (EDM external)');
      cy.get('.table-grid.history .plugin-name.desktop')
        .eq(7)
        .contains('Import OAI-PMH');
    });

    it('should show the user who cancelled an execution', () => {
      cy.route({
        method: 'POST',
        url: '/authentication/user_by_user_id',
        status: 200,
        response: { firstName: 'Valentine', lastName: 'Charles' }
      });

      cy.get('.table-grid.history .head-right')
        .eq(0)
        .contains('Valentine');
    });
  });
});
