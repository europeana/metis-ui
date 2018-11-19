import dataset from '../fixtures/dataset';
import executions from '../fixtures/workflow-executions';
import { setupUser } from '../helpers';

context('metis-ui', () => {
  describe('dashboard', () => {
    beforeEach(() => {
      setupUser();

      cy.server({ force404: true });
      cy.route('GET', '/orchestrator/workflows/executions/*', executions);
      cy.route('GET', '/datasets/*', dataset);

      cy.visit('/dashboard');
    });

    it('should show the dashboard screen', () => {
      cy.get('.metis-welcome-message').contains('Welcome');
    });
  });
});
