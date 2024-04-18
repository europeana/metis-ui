import { UrlManipulation } from '../../test-data/_models/test-models';
import { checkAHref, cleanupUser, setEmptyDataResult, setupUser } from '../support/helpers';

function allRunning(): Cypress.Chainable {
  return cy.get('.ongoing-executions .status');
}

function runningByIndex(index: number): Cypress.Chainable {
  return cy.get(`.ongoing-executions :nth-child(${index})`);
}

context('metis-ui', () => {
  describe('dashboard no ongoing', () => {
    afterEach(() => {
      cleanupUser();
    });

    beforeEach(() => {
      setupUser();
      cy.request(Cypress.env('dataServer') + '/' + UrlManipulation.METIS_UI_CLEAR);
      setEmptyDataResult(
        '/orchestrator/workflows/executions?orderField=CREATED_DATE&ascending=false' +
          '&nextPage=0&workflowStatus=INQUEUE&workflowStatus=RUNNING'
      );
      cy.visit('/dashboard');
    });

    it('should show a message when there are no running executions', () => {
      cy.get('.ongoing-executions .no-content-message').should('have.length', 1);
    });
  });

  describe('dashboard no filter results', () => {
    afterEach(() => {
      cleanupUser();
    });

    beforeEach(() => {
      setupUser();
      cy.request(Cypress.env('dataServer') + '/' + UrlManipulation.METIS_UI_CLEAR);
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
    afterEach(() => {
      cleanupUser();
    });

    beforeEach(() => {
      setupUser();
      cy.request(Cypress.env('dataServer') + '/' + UrlManipulation.METIS_UI_CLEAR);
      cy.visit('/dashboard');
    });

    const expectedRowCount = 2;
    const expectedHeaderCount = 5;

    it('should show the search form', () => {
      cy.get('.search-form').should('have.length', 1);
    });

    it('should show the welcome message', () => {
      cy.get('.metis-welcome-message').contains('Welcome');
    });

    it('should show the currently running executions', () => {
      allRunning().should('have.length', 3);
      runningByIndex(6).contains('0');
      runningByIndex(3).contains('0');
      runningByIndex(9).contains('1');
    });

    it('should show the last executions to have run', () => {
      cy.get('.executions-grid .grid-header-underlined').should('have.length', expectedHeaderCount);
      cy.get('.executions-grid .row-start').contains('Dataset_1');
      cy.get('.executions-grid .row-start').should('have.length', expectedRowCount);
      cy.get('.executions-grid .grid-cell').should(
        'have.length',
        expectedHeaderCount * expectedRowCount
      );
    });

    it('should have action buttons', () => {
      checkAHref(cy.get('.btn').contains('New dataset'), '/dataset/new');
      checkAHref(cy.get('.btn').contains('New organization'), 'https://www.zoho.com');
    });

    it('the dataset name should link to the dataset page', () => {
      checkAHref(cy.get('.executions-grid .row-start:nth-child(7) a'), '/dataset/edit/0');
      checkAHref(cy.get('.executions-grid .row-start:nth-child(13) a'), '/dataset/edit/0');
    });

    it('should have a "load more" button', () => {
      cy.get('.executions-grid .row-start').should('have.length', expectedRowCount);
      cy.get('.executions-grid .grid-cell').should(
        'have.length',
        expectedHeaderCount * expectedRowCount
      );
      cy.get('.load-more-btn').contains('Load more');
    });
  });
});
