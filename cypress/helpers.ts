import user from './fixtures/user';
import dataset from './fixtures/dataset';
import finishedExecutions from './fixtures/executions-finished';
import runningExecutions from './fixtures/executions-running';

export function setupUser(): void {
  cy.window().then((w) => {
    w.localStorage.setItem('currentUser', JSON.stringify({
      user,
      email: user.email,
      token: user.metisUserAccessToken.accessToken
    }));
  });
}

export function setupWorkflowRoutes(): void {
  cy.route('GET', '/datasets/*', dataset);
  cy.route('GET', '/orchestrator/workflows/executions/*FINISHED*', finishedExecutions);
  cy.route('GET', '/orchestrator/workflows/executions/*RUNNING*', runningExecutions);
}
