import { checkAHref } from '../support/helpers';

context('metis-ui', () => {
  describe('search results', () => {
    const expectedRowCount = 2;
    const expectedRowCountMoreLoaded = 4;
    const expectedHeaderCount = 5;
    const selBtnClose = '.close-and-return';
    const selCel = '.executions-grid .grid-cell';
    const selDefaultTitle = '2 search results for "12"';
    const selHeader = '.search-header';
    const selSearch = '.search';
    const selSearchString = '.search-string';

    beforeEach(() => {
      cy.visit('/search');
    });

    it('should show the search form', () => {
      cy.get('.search-form').should('have.length', 1);
      cy.get(selSearchString).should('have.length', 1);
      cy.get(selSearch).should('have.length', 1);
    });

    it('should show the results', () => {
      cy.get(selCel).should('not.exist');
      cy.get(selSearchString).type('set');
      cy.get(selSearch).click();
      cy.get(selCel).should('have.length', expectedHeaderCount * expectedRowCount);
    });

    it('should load more results', () => {
      cy.get(selCel).should('not.exist');
      cy.get(selSearchString).type('set');
      cy.get(selSearch).click();
      cy.get(selCel).should('have.length', expectedHeaderCount * expectedRowCount);
      cy.get('.load-more-btn').click();
      cy.get(selCel).should('have.length', expectedHeaderCount * expectedRowCountMoreLoaded);
    });

    it('should link result items to dataset pages', () => {
      cy.get(selSearchString).type('set');
      cy.get(selSearch).click();
      cy.wait(10);
      checkAHref(cy.get(`.grid-cell:nth-child(${expectedHeaderCount + 1}) a`), '/dataset/edit/0');
    });

    it('should return to the previous page when closed (dashboard)', () => {
      cy.visit('/search?searchString=12');
      cy.get(selHeader)
        .contains(selDefaultTitle)
        .should('exist');
      cy.get(selBtnClose)
        .should('exist')
        .click();
      cy.url().should('contain', 'dashboard');
    });

    it('should return to the previous page when closed (dataset)', () => {
      const baseUrl = '/dataset/edit/0';
      cy.visit(baseUrl);
      cy.get(selSearchString).type('12');
      cy.get(selSearch).click();
      cy.url().should('contain', 'search');
      cy.get(selHeader)
        .contains(selDefaultTitle)
        .should('exist');
      cy.get(selBtnClose)
        .should('exist')
        .click();
      cy.url().should('contain', baseUrl);
    });
  });
});
