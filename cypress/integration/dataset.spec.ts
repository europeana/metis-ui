import { checkAHref, setupUser } from '../support/helpers';

function setupDatasetPage(name: string): void {
  cy.server();
  setupUser();
  cy.visit(`/dataset/${name}/123`);
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
    });

    it('should show the dataset, general info, status, history', () => {
      cy.get('.dataset-name').contains('Handling of Color Spaces');

      cy.get('.metis-dataset-info-block dd').as('dd');
      cy.get('@dd').contains('Europeana');
      cy.get('@dd').contains('234');
      cy.get('@dd').contains('18/02/2019 - 08:36 ');

      cy.get('.dataset-actionbar .status').as('status');
      cy.get('@status').contains('Validate');

      cy.get('.table-grid.last-execution .table-grid-row-start').should('have.length', 2);
      getHistoryRow(0).contains('Validate (EDM external)');
      getHistoryRow(1).contains('Process Media');
    });

    it('should show the tabs', () => {
      cy.get('.tabs .tab-title').as('tabTitle');
      checkAHref(cy.get('@tabTitle').contains('Dataset Information'), '/dataset/edit/123');
      checkAHref(cy.get('@tabTitle').contains('Workflow'), '/dataset/workflow/123');
      checkAHref(cy.get('@tabTitle').contains('Mapping'), '/dataset/mapping/123');
      checkAHref(cy.get('@tabTitle').contains('Raw XML'), '/dataset/preview/123');
      checkAHref(cy.get('@tabTitle').contains('Processing history'), '/dataset/log/123');
    });
  });

  describe('dataset information', () => {
    beforeEach(() => {
      setupDatasetPage('edit');
    });

    it('should show the fields', () => {
      checkFormField('Dataset Name', 'Handling of Color Spaces');
      checkFormField('Provider', 'Europeana');
      checkStaticField('Date Created', '11/02/2019 - 11:08');
      checkStaticField('Created by', '1482250000003948001');
      checkStaticField('Last published', '18/02/2019 - 08:36');
      checkStaticField('Number of items published', '234');
      checkStaticField('Last date of harvest', '21/02/2019 - 14:20');
      checkStaticField('Number of items harvested', '234');
    });

    // TODO: edit
  });

  describe('dataset workflow', () => {
    beforeEach(() => {
      setupDatasetPage('workflow');
    });

    it('should show the workflow', () => {
      checkPluginStatus('Import', true);
      checkPluginStatus('Validate (EDM external)', true);
      checkPluginStatus('Transform', true);
      checkPluginStatus('Validate (EDM internal)', true);
      checkPluginStatus('Normalise', true);
      checkPluginStatus('Enrich', true);
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
        .should('have.class', 'status-finished');
    });

    it('should show the log', () => {
      cy.get('.table-grid.history .plugin-name.desktop')
        .eq(0)
        .contains('Validate (EDM external)');
      cy.get('.table-grid.history .plugin-name.desktop')
        .eq(1)
        .contains('Process Media');
      cy.get('.table-grid.history .plugin-name.desktop')
        .eq(3)
        .contains('Enrich');
      cy.get('.table-grid.history .plugin-name.desktop')
        .eq(4)
        .contains('Normalise');
      cy.get('.table-grid.history .plugin-name.desktop')
        .eq(5)
        .contains('Validate (EDM internal)');
      cy.get('.table-grid.history .plugin-name.desktop')
        .eq(6)
        .contains('Transform');
      cy.get('.table-grid.history .plugin-name.desktop')
        .eq(7)
        .contains('Validate (EDM external)');
      cy.get('.table-grid.history .plugin-name.desktop')
        .eq(8)
        .contains('Import OAI-PMH');
    });

    it('should show the user who cancelled an execution', () => {
      cy.get('.table-grid.history .head-right')
        .eq(0)
        .contains('Valentine');
    });
  });
});
