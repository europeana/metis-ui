import { cleanupUser, setupUser } from '../support/helpers';

function setupDatasetPage(name: string, index: number): void {
  cy.server();
  setupUser();
  cy.visit(`/dataset/${name}/${index}`);
}

function checkPluginStatus(name: string, enabled: boolean): void {
  const input = cy
    .get('.plugin')
    .contains(name)
    .closest('.plugin')
    .find('input');
  input.should(enabled ? 'be.checked' : 'not.be.checked');
}

context('metis-ui', () => {
  describe('Workflow Form', () => {
    const force = { force: true };
    const fieldsOnlyHTTP = ['#url'];
    const fieldsOnlyOAI = ['#harvest-url', '#setspec', '#metadata-format'];
    const fieldsBoth = ['#incremental-harvest'];

    beforeEach(() => {
      setupDatasetPage('workflow', 1);
    });

    afterEach(() => {
      cleanupUser();
    });

    it('should show the workflow', () => {
      checkPluginStatus('Import', true);
      checkPluginStatus('Validate (EDM external)', true);
      checkPluginStatus('Transform', true);
      checkPluginStatus('Validate (EDM internal)', true);
      checkPluginStatus('Normalise', true);
      checkPluginStatus('Enrich', false);
      checkPluginStatus('Process Media', false);
      checkPluginStatus('Preview', false);
      checkPluginStatus('Publish', false);
    });

    it('should disable the save button when there are gaps in the step-sequence', () => {
      cy.get('[data-e2e="save-workflow"] button').should('have.length', 0);
      cy.wait(500);
      cy.get('.steps .validation_internal').click(force);
      cy.get('[data-e2e="save-workflow"] button').should('be.disabled');
      cy.get('.notification').contains('Gaps are not allowed in the workflow sequence ');
      cy.get('.steps .validation_internal').click(force);
      cy.get('[data-e2e="save-workflow"] button').should('not.be.disabled');
    });

    describe('HTTP Harvest', () => {
      beforeEach(() => {
        setupDatasetPage('workflow', 1);
      });

      it('should show the appropriate fields', () => {
        fieldsBoth.forEach((selector: string) => {
          cy.get(selector).should('have.length', 1);
        });
        fieldsOnlyHTTP.forEach((selector: string) => {
          cy.get(selector).should('have.length', 1);
        });
        fieldsOnlyOAI.forEach((selector: string) => {
          cy.get(selector).should('have.length', 0);
        });
      });
    });

    describe('OAI Harvest', () => {
      beforeEach(() => {
        setupDatasetPage('workflow', 0);
      });

      it('should show the appropriate fields', () => {
        fieldsBoth.forEach((selector: string) => {
          cy.get(selector).should('have.length', 1);
        });
        fieldsOnlyOAI.forEach((selector: string) => {
          cy.get(selector).should('have.length', 1);
        });
        fieldsOnlyHTTP.forEach((selector: string) => {
          cy.get(selector).should('have.length', 0);
        });
      });
    });
  });
});
