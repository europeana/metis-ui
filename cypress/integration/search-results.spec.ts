import { setupUser } from '../support/helpers';

context('metis-ui', () => {
  describe('search results', () => {
    beforeEach(() => {
      cy.server();
      setupUser();
      cy.visit('/search');
    });

    it('should show the search form', () => {
      cy.get('.search-form').should('have.length', 1);
    });
  });
});
