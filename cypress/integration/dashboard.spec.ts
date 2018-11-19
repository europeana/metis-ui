import { setupUser, setupWorkflowRoutes } from '../support/helpers';

function runningByIndex(index: number): Cypress.Chainable {
  return cy.get(`.latest-ongoing:nth-child(${index + 1})`);
}

function executionByIndex(index: number): Cypress.Chainable {
  return cy.get(`.executions-table tbody tr:nth-child(${index + 1})`);
}

context('metis-ui', () => {
  describe('dashboard', () => {
    beforeEach(() => {
      cy.server({ force404: true });
      setupUser();
      setupWorkflowRoutes();

      cy.visit('/dashboard');
    });

    it('should show the dashboard screen and the executions', () => {
      cy.get('.metis-welcome-message').contains('Welcome');

      cy.get('.latest-ongoing').should('have.length', 2);
      runningByIndex(0).find('.progress').contains('64');
      runningByIndex(1).find('.progress').contains('194');

      cy.get('.executions-table tbody tr').should('have.length', 7);
      executionByIndex(0).find('td.nowrap').contains('64');
      executionByIndex(1).find('td.nowrap').contains('194');
      executionByIndex(2).find('td.nowrap').contains('58');
      executionByIndex(6).find('td.nowrap').contains('80');
    });

    it('should have action buttons', () => {
      cy.get('.btn').contains('New dataset').click();
      cy.url().should('contain', '/dataset/new');
      cy.go('back');

      cy.get('.btn').contains('New organization')
        .closest('a').should('have.attr', 'href', 'https://www.zoho.com');
    });

    it('should view a dataset when the user clicks on its name', () => {
      runningByIndex(0).contains('datasetName').click();
      cy.url().should('contain', '/dataset/edit/64');
      cy.go('back');

      runningByIndex(1).contains('datasetName').click();
      cy.url().should('contain', '/dataset/edit/194');
      cy.go('back');

      executionByIndex(0).contains('datasetName').click();
      cy.url().should('contain', '/dataset/edit/64');
      cy.go('back');

      executionByIndex(4).contains('datasetName').click();
      cy.url().should('contain', '/dataset/edit/58');
      cy.go('back');

      executionByIndex(6).contains('datasetName').click();
      cy.url().should('contain', '/dataset/edit/80');
      cy.go('back');
    });

    it('should have cancel, log and history buttons for running executions', () => {
      runningByIndex(0).find('.svg-icon-cancel').click();
      cy.get('.modal .head').contains('Cancel');
      cy.get('.modal .button').contains('Yes').click();
      cy.wait('@deleteExecution');

      runningByIndex(0).find('.svg-icon-log').click();
      cy.get('.modal .head').contains('Log OAIPMH_HARVEST');
      cy.get('.modal .btn-close').click();
      cy.should('not.exist', '.modal');

      runningByIndex(0).find('.svg-icon-history').click();
      cy.url().should('contain', '/dataset/log/64');
      cy.go('back');

      executionByIndex(1).find('.svg-icon-history').click();
      cy.url().should('contain', '/dataset/log/194');
      cy.go('back');
    });

    it('should have a "load more" button', () => {
      cy.get('.load-more-btn').contains('Load more').click();
      cy.get('.executions-table tbody tr', { timeout: 10000 })
        .should('have.length', 12);
    });
  });
});
