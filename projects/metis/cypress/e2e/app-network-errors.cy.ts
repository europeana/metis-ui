import { UrlManipulation } from '../../test-data/_models/test-models';

context('metis-ui', () => {
  describe('App Network Errors', () => {
    beforeEach(() => {
      cy.request(Cypress.env('dataServer') + '/' + UrlManipulation.METIS_UI_CLEAR);
    });

    const selErrors = '.error-notification';

    const closeErrors = (): void => {
      cy.get(selErrors).should('have.length', 1);
      cy.get(selErrors).click();
      cy.get(selErrors).should('not.exist');
    };

    const getUrl = (errorType: UrlManipulation): string => {
      return `${Cypress.env(
        'dataServer'
      )}/orchestrator/workflows/executions/dataset/0?orderField=CREATED_DATE${errorType}&ascending=false`;
    };

    const setupError = (errorType: UrlManipulation): void => {
      cy.request({
        method: 'GET',
        url: getUrl(errorType),
        failOnStatusCode: false
      });
    };

    it('should handle the 406 error', () => {
      setupError(UrlManipulation.RETURN_406);
      cy.visit('/dataset/edit/0');
      cy.get(selErrors)
        .contains('406 message')
        .should('exist');
      closeErrors();
    });

    it('should handle the 409 error', () => {
      setupError(UrlManipulation.RETURN_409);
      cy.visit('/dataset/edit/0');
      cy.get(selErrors)
        .contains('409 message')
        .should('exist');
      closeErrors();
    });
  });
});
