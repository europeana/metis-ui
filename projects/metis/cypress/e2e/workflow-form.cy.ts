function setupDatasetPage(name: string, index: number): void {
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
    const fieldsBoth = ['lib-protocol-field-set .checkbox'];
    const fieldsOtherParameters = [
      '#check-all',
      '#check-sample',
      '.plugin[for="pluginTRANSFORMATION"] + * .checkbox',
      '#throttle-level-select'
    ];
    const selLinkCheckStep = '.workflow-header .steps .link_checking';
    const selIncrementalHarvest = '.plugin[for="pluginHARVEST"] + * .checkbox';

    beforeEach(() => {
      setupDatasetPage('workflow', 1);
    });

    const addLinkChecking = (): void => {
      const selFirstFieldHoverZone = '.form-fields-container > :first-child .link-check-ctrl';
      const selFirstFieldHoverLink = `${selFirstFieldHoverZone} .ctrl.add`;
      cy.get(selFirstFieldHoverZone).invoke('show');
      cy.get(selFirstFieldHoverLink).click(force);
    };

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

    it('should show the custom xslt as disabled if no mapping is set', () => {
      const selCustomXSLT = '[data-e2e="custom-xslt-container"] .checkbox';
      cy.get(selCustomXSLT).should('exist');
      cy.get(selCustomXSLT).should('have.class', 'disabled');
      setupDatasetPage('workflow', 0);
      cy.get(selCustomXSLT).should('exist');
      cy.get(selCustomXSLT).should('not.have.class', 'disabled');
    });

    it('should show the extra parameter fields', () => {
      addLinkChecking();
      fieldsOtherParameters.forEach((selector: string) => {
        cy.get(selector).should('exist');
      });
    });

    it('should disable the save button when there are gaps in the step-sequence', () => {
      cy.get('[data-e2e="save-workflow"] button').should('not.exist');
      cy.wait(500);
      cy.get('.steps .validation_internal').click(force);
      cy.get('[data-e2e="save-workflow"] button').should('be.disabled');
      cy.get('.notification').contains('Gaps are not allowed in the workflow sequence ');
      cy.get('.steps .validation_internal').click(force);
      cy.get('[data-e2e="save-workflow"] button').should('not.be.disabled');
    });

    it('should show link checking', () => {
      cy.get(selLinkCheckStep).should('not.exist');
      addLinkChecking();
      cy.get(selLinkCheckStep).should('exist');
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
          cy.get(selector).should('not.exist');
        });
        cy.get(selIncrementalHarvest).should('have.length', 1);
        cy.get(selIncrementalHarvest).should('have.class', 'disabled');
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
          cy.get(selector).should('not.exist');
        });
        cy.get(selIncrementalHarvest).should('have.length', 1);
        cy.get(selIncrementalHarvest).should('not.have.class', 'disabled');
      });
    });
  });
});
