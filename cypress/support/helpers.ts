import user from '../fixtures/user';
import dataset from '../fixtures/dataset';
import finishedExecutions from '../fixtures/executions-finished';
import runningExecutions from '../fixtures/executions-running';
import countries from '../fixtures/countries';
import languages from '../fixtures/languages';
import harvestData from '../fixtures/harvest-data';
import workflow from '../fixtures/workflow';

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
  cy.route('GET', /\/datasets\/\d+/, dataset);
  cy.route('GET', '/datasets/countries', countries);
  cy.route('GET', '/datasets/languages', languages);
  cy.route('GET', '/orchestrator/workflows/executions/*FINISHED*', finishedExecutions);
  cy.route('GET', '/orchestrator/workflows/executions/*RUNNING*', runningExecutions);
  cy.route('GET', /\/orchestrator\/workflows\/\d+/, workflow);
  cy.route('GET', '/orchestrator/workflows/executions/dataset/*/information', harvestData);
  cy.route('GET', '/orchestrator/workflows/executions/dataset/*?*orderField*', runningExecutions);
  cy.route('DELETE', '/orchestrator/workflows/executions/*', {}).as('deleteExecution');
}
