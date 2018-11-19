import {
  countries,
  dataset,
  finishedExecutions,
  harvestData,
  languages,
  runningExecutions,
  user,
  workflow
} from '../fixtures';

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
  cy.route('GET', /\/datasets\/\d+/, dataset)
    .as('getDataset');
  cy.route('GET', '/datasets/countries', countries)
    .as('getCountries');
  cy.route('GET', '/datasets/languages', languages)
    .as('getLanguages');
  cy.route('GET', '/orchestrator/workflows/executions/*FINISHED*', finishedExecutions)
    .as('getFinishedExecutions');
  cy.route('GET', '/orchestrator/workflows/executions/*RUNNING*', runningExecutions)
    .as('getRunningExecutions');
  cy.route('GET', /\/orchestrator\/workflows\/\d+/, workflow)
    .as('getWorkflow');
  cy.route('GET', '/orchestrator/workflows/executions/dataset/*/information', harvestData)
    .as('getHarvestData');
  cy.route('GET', '/orchestrator/workflows/executions/dataset/*?*orderField*', runningExecutions)
    .as('getWorkflowExecutions');
  cy.route('DELETE', '/orchestrator/workflows/executions/*', {})
    .as('deleteExecution');
}
