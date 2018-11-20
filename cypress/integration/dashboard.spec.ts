import { setupUser, setupWorkflowRoutes } from '../support/helpers';

function allRunning(): Cypress.Chainable {
  return cy.get('.latest-ongoing');
}

function runningByIndex(index: number, sel: string): Cypress.Chainable {
  return cy.get(`.latest-ongoing:nth-child(${index + 1}) ${sel}`);
}

function allExecutions(): Cypress.Chainable {
  return cy.get('.executions-table tbody tr');
}

function executionByIndex(index: number, sel: string): Cypress.Chainable {
  return cy.get(`.executions-table tbody tr:nth-child(${index + 1}) ${sel}`);
}

function checkAHref(subject: Cypress.Chainable, href: string): void {
  subject.closest('a').should('have.attr', 'href', href);
}

context('metis-ui', () => {
  describe('dashboard', () => {
    beforeEach(() => {
      cy.server({ force404: true });
      setupUser();
      setupWorkflowRoutes();

      cy.visit('/dashboard');
      cy.wait(['@getRunningExecutions', '@getFinishedExecutions', '@getDataset']);
    });

    it('should show the dashboard screen and the executions', () => {
      cy.get('.metis-welcome-message').contains('Welcome');

      allRunning().should('have.length', 2);
      runningByIndex(0, '.progress').contains('64');
      runningByIndex(1, '.progress').contains('194');

      cy.get('.executions-table tbody tr').should('have.length', 7);
      executionByIndex(0, 'td.nowrap').contains('64');
      executionByIndex(1, 'td.nowrap').contains('194');
      executionByIndex(2, 'td.nowrap').contains('58');
      executionByIndex(6, 'td.nowrap').contains('80');
    });

    it('should have action buttons', () => {
      checkAHref(cy.get('.btn').contains('New dataset'), '/dataset/new');
      checkAHref(cy.get('.btn').contains('New organization'), 'https://www.zoho.com');
    });

    it('the dataset name should link to the dataset page', () => {
      checkAHref(runningByIndex(0, '.workflowname'), '/dataset/edit/64');
      checkAHref(runningByIndex(1, '.workflowname'), '/dataset/edit/194');

      checkAHref(executionByIndex(0, '.datasetName'), '/dataset/edit/64');
      checkAHref(executionByIndex(4, '.datasetName'), '/dataset/edit/58');
      checkAHref(executionByIndex(6, '.datasetName'), '/dataset/edit/80');
    });

    it('should have cancel, log and history buttons for running executions', () => {
      runningByIndex(0, '.svg-icon-cancel').click();
      cy.get('.modal .head').contains('Cancel');
      cy.get('.modal .button').contains('Yes').click();
      cy.wait('@deleteExecution');

      runningByIndex(0, '.svg-icon-log').click();
      cy.get('.modal .head').contains('Log OAIPMH_HARVEST');
      cy.get('.modal .btn-close').click();
      cy.get('.modal').should('not.exist');

      checkAHref(runningByIndex(0, '.svg-icon-history'), '/dataset/log/64');
      checkAHref(executionByIndex(1, '.svg-icon-history'), '/dataset/log/194');
    });

    it('should have a "load more" button', () => {
      allExecutions().should('have.length', 7);
      cy.get('.load-more-btn').contains('Load more').click();
      allExecutions().should('have.length', 12);
    });
  });
});
