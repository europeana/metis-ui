import {
  countries,
  dataset,
  finishedExecutions,
  harvestData,
  languages,
  records,
  report,
  runningExecutions,
  statistics,
  user,
  workflow,
  workflowExecutions,
  xslt
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
  cy.route('PUT', '/datasets', '')
    .as('updateDataset');
  cy.route('GET', '/datasets/countries', countries)
    .as('getCountries');
  cy.route('GET', '/datasets/languages', languages)
    .as('getLanguages');
  cy.route('GET', '/datasets/xslt/*', xslt)
    .as('getXslt');

  cy.route('GET', /\/orchestrator\/workflows\/\d+/, workflow)
    .as('getWorkflow');
  cy.route('GET', '/orchestrator/workflows/executions/*FINISHED*', finishedExecutions)
    .as('getFinishedExecutions');
  cy.route('GET', '/orchestrator/workflows/executions/*RUNNING*', runningExecutions)
    .as('getRunningExecutions');
  cy.route('DELETE', '/orchestrator/workflows/executions/*', {})
    .as('deleteExecution');
  cy.route('GET', '/orchestrator/workflows/executions/dataset/*?*orderField*', workflowExecutions)
    .as('getWorkflowExecutions');
  cy.route('GET', '/orchestrator/workflows/executions/dataset/*/information', harvestData)
    .as('getHarvestData');

  cy.route('GET', '/orchestrator/proxies/*/task/*/report?*', report)
    .as('getReport');
  cy.route('GET', '/orchestrator/proxies/records?*', records);
  cy.route('GET', '/orchestrator/proxies/validation/task/*/statistic', statistics);
}
