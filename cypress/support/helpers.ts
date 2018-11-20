import { Results } from '../../src/app/_models/results';
import { WorkflowExecution } from '../../src/app/_models/workflow-execution';
import {
  countries,
  dataset,
  finishedExecutions,
  harvestData,
  languages,
  report,
  runningExecutions,
  user,
  workflow,
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

const allExecutions: Results<WorkflowExecution[]> = {
  results: runningExecutions.results.concat(finishedExecutions.results),
  listSize: 10,
  nextPage: -1
};

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
  cy.route('GET', '/orchestrator/workflows/executions/dataset/*?*orderField*', allExecutions)
    .as('getWorkflowExecutions');
  cy.route('DELETE', '/orchestrator/workflows/executions/*', {})
    .as('deleteExecution');
  cy.route('GET', '/orchestrator/proxies/*/task/*/report?*', report)
    .as('getReport');
  cy.route('GET', '/datasets/xslt/*', xslt)
    .as('getXslt');
  cy.route('PUT', '/datasets', '')
    .as('updateDataset');
}
