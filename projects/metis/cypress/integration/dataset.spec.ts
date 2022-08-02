import { checkAHref, cleanupUser, setupUser } from '../support/helpers';

function setupDatasetPage(name: string, index: number): void {
  cy.server();
  setupUser();
  cy.visit(`/dataset/${name}/${index}`);
}

function getHistoryRow(index: number): Cypress.Chainable {
  return cy.get('.table-grid.last-execution .table-grid-row-start').eq(index);
}

context('metis-ui', () => {
  describe('dataset page', () => {
    afterEach(() => {
      cleanupUser();
    });

    beforeEach(() => {
      setupDatasetPage('edit', 0);
      cy.wait(50);
    });

    const expectedId = '0';
    const lastPublished = '19/02/2019 - 08:49';

    it('should show the search form', () => {
      cy.get('.search-form').should('have.length', 1);
    });

    it('should show the dataset, general info, status, history and redirection ids', () => {
      cy.get('.dataset-name').contains('Dataset_1');
      cy.get('.depublication-status').should('have.length', 1);

      cy.get('.redirection-ids').contains('0');
      cy.get('.redirection-ids').contains('1');

      cy.get('.metis-dataset-info-block dd').as('dd');
      cy.get('@dd').contains('Europeana');
      cy.get('@dd').contains('865');
      cy.get('@dd').contains(lastPublished);

      cy.get('.dataset-actionbar .status').contains('Finished');
      cy.get('.unfit-to-publish').contains('This dataset is not fit for publication');

      cy.get('.dataset-actionbar .started-by').as('startedBy');
      cy.get('@startedBy').contains('Valentine');

      cy.get('.table-grid.last-execution .table-grid-row-start').should('have.length', 11);
      getHistoryRow(0).contains('Check Links');
      getHistoryRow(1).contains('Depublish');
      getHistoryRow(2).contains('Publish');
      getHistoryRow(3).contains('Preview');
      getHistoryRow(4).contains('Process Media');
    });

    it('should show the tabs', () => {
      cy.get('.tabs .pre-title').as('tabTitle');
      checkAHref(
        cy.get('@tabTitle').contains('Dataset Information'),
        '/dataset/edit/' + expectedId
      );
      checkAHref(cy.get('@tabTitle').contains('Workflow'), '/dataset/workflow/' + expectedId);
      checkAHref(cy.get('@tabTitle').contains('Mapping'), '/dataset/mapping/' + expectedId);
      checkAHref(cy.get('@tabTitle').contains('Raw XML'), '/dataset/preview/' + expectedId);
      checkAHref(cy.get('@tabTitle').contains('Processing history'), '/dataset/log/' + expectedId);
    });

    it('should (conditionally) show the links to the log tab', () => {
      const selLogLink = '[data-e2e=log-link]';
      cy.visit('/dataset/edit/0');
      cy.get(selLogLink).should('have.length', 1);
      cy.visit('/dataset/workflow/0');
      cy.get(selLogLink).should('have.length', 1);
      cy.visit('/dataset/depublication/0');
      cy.get(selLogLink).should('have.length', 1);
      cy.visit('/dataset/mapping/0');
      cy.get(selLogLink).should('have.length', 1);
      cy.visit('/dataset/preview/0');
      cy.get(selLogLink).should('have.length', 1);
      cy.visit('/dataset/log/0');
      cy.get(selLogLink).should('have.length', 0);
      cy.visit('/dataset/edit/0');
      cy.get(selLogLink).should('have.length', 1);
    });
  });

  describe('dataset edit', () => {
    afterEach(() => {
      cleanupUser();
    });

    beforeEach(() => {
      setupDatasetPage('edit', 3);
    });

    it('should show the indexing_deleted_records status', () => {
      getHistoryRow(2).contains('Transform');
      getHistoryRow(2)
        .get('.status-identifying_deleted_records')
        .should('have.length', 1);
    });
  });
});
