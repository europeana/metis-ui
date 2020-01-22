import { checkAHref, setupUser } from '../support/helpers';

context('metis-ui', () => {
  describe('search results', () => {
    const expectedRowCount = 2;
    const expectedRowCountMoreLoaded = 3;
    const expectedHeaderCount = 5;

    beforeEach(() => {
      cy.server();
      setupUser();
      cy.visit('/search');
    });

    it('should show the search form', () => {
      cy.get('.search-form').should('have.length', 1);
      cy.get('.search-string').should('have.length', 1);
      cy.get('.search').should('have.length', 1);
    });

    it('should show the reults', () => {
      cy.get('.grid-cell').should('have.length', 0);
      cy.get('.search-string').type('set');
      cy.get('.search').click();
      cy.get('.grid-cell').should('have.length', expectedHeaderCount * expectedRowCount);
    });

    it('should load more reults', () => {
      cy.get('.grid-cell').should('have.length', 0);
      cy.get('.search-string').type('set');
      cy.get('.search').click();
      cy.get('.grid-cell').should('have.length', expectedHeaderCount * expectedRowCount);
      cy.get('.load-more-btn').click();
      cy.get('.grid-cell').should('have.length', expectedHeaderCount * expectedRowCountMoreLoaded);
    });

    it('should link result items to dataset pages', () => {
      cy.get('.search-string').type('set');
      cy.get('.search').click();
      cy.wait(10);
      checkAHref(cy.get(`.grid-cell:nth-child(${expectedHeaderCount + 1}) a`), '/dataset/edit/0');
    });
  });
});
