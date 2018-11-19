import user from '../fixtures/user';
import dataset from '../fixtures/dataset';
import executions from '../fixtures/workflow-executions';

context('metis-ui', () => {
  describe('dashboard', () => {
    beforeEach(() => {
      cy.window().then((w) => {
        w.localStorage.setItem('currentUser', JSON.stringify({
          user,
          email: user.email,
          token: user.metisUserAccessToken.accessToken
        }));
      });

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
