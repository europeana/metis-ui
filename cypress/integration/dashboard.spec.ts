import { setupUser, setupWorkflowRoutes } from '../helpers';

context('metis-ui', () => {
  describe('dashboard', () => {
    beforeEach(() => {
      cy.server({ force404: true });
      setupUser();
      setupWorkflowRoutes();

      cy.visit('/dashboard');
    });

    it('should show the dashboard screen', () => {
      cy.get('.metis-welcome-message').contains('Welcome');
    });
  });
});
