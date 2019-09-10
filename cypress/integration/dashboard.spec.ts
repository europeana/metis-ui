import { checkAHref, setupUser, setEmptyDataResult } from '../support/helpers';

function allRunning(): Cypress.Chainable {
  return cy.get('.ongoing-executions .status');
}

function runningByIndex(index: number): Cypress.Chainable {
  return cy.get(`.ongoing-executions :nth-child(${index})`);
}

context('metis-ui', () => {
  describe('dashboard no ongoing', () => {
    beforeEach(() => {
      cy.server();
      setupUser();
      cy.request(Cypress.env('dataServer') + '/METIS_UI_CLEAR');
      setEmptyDataResult(
        '/orchestrator/workflows/executions/?orderField=CREATED_DATE&ascending=false&nextPage=0&workflowStatus=INQUEUE&workflowStatus=RUNNING'
      );
      cy.visit('/dashboard');
    });

    it('should show a message when there are no running executions', () => {
      cy.get('.ongoing-executions .no-content-message').should('have.length', 1);
    });
  });

  describe('dashboard no filter results', () => {
    beforeEach(() => {
      cy.server();
      setupUser();
      cy.request(Cypress.env('dataServer') + '/METIS_UI_CLEAR');
      setEmptyDataResult(
        '/orchestrator/workflows/executions/overview?nextPage=0&pluginType=HTTP_HARVEST'
      );
      cy.visit('/dashboard');
    });

    it('should show a message when there are no filtered results', () => {
      cy.get('.filter a')
        .first()
        .click();
      cy.get('.filter-cell a')
        .first()
        .click();
      cy.get('.filter a')
        .first()
        .click();
      cy.get('.executions-grid .no-content-message').should('have.length', 1);
    });
  });

  describe('dashboard', () => {
    beforeEach(() => {
      cy.server();
      setupUser();
      cy.request(Cypress.env('dataServer') + '/METIS_UI_CLEAR');
      cy.visit('/dashboard');
    });

    it('should show the welcome message', () => {
      cy.get('.metis-welcome-message').contains('Welcome');
    });

    it('should show the currently running executions', () => {
      allRunning().should('have.length', 2);
      runningByIndex(6).contains('129');
      runningByIndex(3).contains('126');
    });

    it('should show the last executions to have run', () => {
      cy.get('.executions-grid .grid-header').should('have.length', 5);
      cy.get('.executions-grid .row-start').contains('Dataset 1');
      cy.get('.executions-grid .row-start').should('have.length', 2);
      cy.get('.executions-grid .grid-cell').should('have.length', 10);
    });

    it('should have action buttons', () => {
      checkAHref(cy.get('.btn').contains('New dataset'), '/dataset/new');
      checkAHref(cy.get('.btn').contains('New organization'), 'https://www.zoho.com');
    });

    it('the dataset name should link to the dataset page', () => {
      checkAHref(cy.get('.executions-grid .row-start:nth-child(7) a'), '/dataset/edit/129');
      checkAHref(cy.get('.executions-grid .row-start:nth-child(13) a'), '/dataset/edit/123');
    });

    it('should have a "load more" button', () => {
      cy.get('.executions-grid .row-start').should('have.length', 2);
      cy.get('.executions-grid .grid-cell').should('have.length', 10);
      cy.get('.load-more-btn').contains('Load more');
    });
  });
});
