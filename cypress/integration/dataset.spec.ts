import { checkAHref, cleanupUser, setupUser } from '../support/helpers';

function setupDatasetPage(name: string, index: number): void {
  cy.server();
  setupUser();
  cy.visit(`/dataset/${name}/${index}`);
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
    afterEach(() => {
      cleanupUser();
    });

    beforeEach(() => {
      setupDatasetPage('edit', 0);
    });

    const expectedId = '0';
    const lastPublished = '19/02/2019 - 08:49';

    it('should show the dataset, general info, status, history', () => {
      cy.get('.dataset-name').contains('Dataset 1');

      cy.get('.metis-dataset-info-block dd').as('dd');
      cy.get('@dd').contains('Europeana');
      cy.get('@dd').contains('865');
      cy.get('@dd').contains(lastPublished);

      cy.get('.dataset-actionbar .status').as('status');
      cy.get('@status').contains('FINISHED');

      cy.get('.table-grid.last-execution .table-grid-row-start').should('have.length', 10);
      getHistoryRow(0).contains('Check Links');
      getHistoryRow(1).contains('Publish');
      getHistoryRow(2).contains('Preview');
      getHistoryRow(3).contains('Process Media');
    });

    it('should show the tabs', () => {
      cy.get('.tabs .tab-title').as('tabTitle');
      checkAHref(
        cy.get('@tabTitle').contains('Dataset Information'),
        '/dataset/edit/' + expectedId
      );
      checkAHref(cy.get('@tabTitle').contains('Workflow'), '/dataset/workflow/' + expectedId);
      checkAHref(cy.get('@tabTitle').contains('Mapping'), '/dataset/mapping/' + expectedId);
      checkAHref(cy.get('@tabTitle').contains('Raw XML'), '/dataset/preview/' + expectedId);
      checkAHref(cy.get('@tabTitle').contains('Processing history'), '/dataset/log/' + expectedId);
    });
  });

  describe('dataset information', () => {
    afterEach(() => {
      cleanupUser();
    });

    beforeEach(() => {
      setupDatasetPage('edit', 0);
    });

    it('should show the fields', () => {
      checkFormField('Dataset Name', 'Dataset 1');
      checkFormField('Provider', 'Europeana Provider');
      checkStaticField('Date Created', '19/02/2019 - 08:36');
      checkStaticField('Created by', '123');
      checkStaticField('Last published', '19/02/2019 - 08:49');
      checkStaticField('Number of items published', '865');
      checkStaticField('Last date of harvest', '19/02/2019 - 08:41');
      checkStaticField('Number of items harvested', '879');
    });

    // TODO: edit
  });

  describe('dataset workflow', () => {
    afterEach(() => {
      cleanupUser();
    });

    beforeEach(() => {
      setupDatasetPage('workflow', 1);
    });

    it('should show the workflow', () => {
      checkPluginStatus('Import', true);
      checkPluginStatus('Validate (EDM external)', true);
      checkPluginStatus('Transform', true);
      checkPluginStatus('Validate (EDM internal)', true);
      checkPluginStatus('Normalise', true);
      checkPluginStatus('Enrich', false);
      checkPluginStatus('Process Media', false);
      checkPluginStatus('Preview', false);
      checkPluginStatus('Publish', false);
    });

    // TODO: check and update fields
  });
  // TODO: mapping

  // TODO: preview
  describe('dataset log', () => {
    afterEach(() => {
      cleanupUser();
    });

    beforeEach(() => {
      setupDatasetPage('log', 2);
    });

    it('should show the error bullets', () => {
      cy.get('.table-grid.history .table-grid-row-start .orb-status')
        .eq(5)
        .should('have.class', 'status-finished');
    });

    it('should show the log', () => {
      cy.get('.table-grid.history .plugin-name.desktop')
        .eq(0)
        .contains('Process Media');
      cy.get('.table-grid.history .plugin-name.desktop')
        .eq(1)
        .contains('Enrich');
      cy.get('.table-grid.history .plugin-name.desktop')
        .eq(2)
        .contains('Normalise');
      cy.get('.table-grid.history .plugin-name.desktop')
        .eq(3)
        .contains('Validate (EDM internal)');
      cy.get('.table-grid.history .plugin-name.desktop')
        .eq(4)
        .contains('Transform');
      cy.get('.table-grid.history .plugin-name.desktop')
        .eq(5)
        .contains('Validate (EDM external)');
      cy.get('.table-grid.history .plugin-name.desktop')
        .eq(6)
        .contains('Import HTTP');
    });

    it('should show the user who cancelled an execution', () => {
      cy.get('.table-grid.history .head-right')
        .eq(0)
        .contains('Valentine');
    });
  });
});
