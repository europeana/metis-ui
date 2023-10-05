import { UrlManipulation } from '../../test-data/_models/test-models';
import { cleanupUser, fillLoginFieldsAndSubmit, setupUser } from '../support/helpers';

context('metis-ui', () => {
  describe('retries', () => {
    const localDataServer = 'http://localhost:3000';

    afterEach(() => {
      cleanupUser();
    });

    beforeEach(() => {
      setupUser();
      cy.request(`${localDataServer}/${UrlManipulation.METIS_UI_CLEAR}`);
    });

    it('Retries', () => {
      let count = 0;
      const url = `${localDataServer}/orchestrator/workflows/executions/overview?nextPage=0`;

      // track hits to valid url
      cy.intercept('GET', url, (_) => {
        count = count + 1;
      });

      // confirm it takes 1 attempt to load
      cy.visit('/dashboard').then(() => {
        cy.wait(1500).then(() => {
          expect(count, 'Number of times intercepted').to.equal(1);
        });
      });

      // Reset count
      count = 0;

      // set up a 404 response
      cy.request({
        method: 'GET',
        url: url + UrlManipulation.RETURN_404,
        failOnStatusCode: false
      });

      // confirm it's made 3 load attempts
      cy.visit('/dashboard').then(() => {
        cy.wait(1500).then(() => {
          expect(count, 'Number of times intercepted').to.equal(3);
        });
      });

      const url404 = `${localDataServer}/datasets/404`;
      let count404 = 0;

      // track hits to url404
      cy.intercept('GET', url404, (_) => {
        count404 = count404 + 1;
      });

      // confirm it's made 3 load attempts
      cy.visit('/datasets/edit/404').then(() => {
        cy.wait(1500).then(() => {
          expect(count, 'Number of times intercepted').to.equal(3);
        });
      });
    });

    it('should redirect to the original url after an expired session', () => {
      const datasetId = 2;
      const pageUrl = `/dataset/edit/${datasetId}`;
      const dataUrl = `/orchestrator/workflows/executions/dataset/${datasetId}/information`;

      cy.visit(pageUrl);
      cy.url().should('not.contain', '/signin');

      // set up 401 response
      cy.request(`${localDataServer}${dataUrl}${UrlManipulation.RETURN_401}`);
      cy.wait(3000);

      cy.url().should('contain', '/signin');
      console.log(!!fillLoginFieldsAndSubmit);

      // login and expect redirection
      fillLoginFieldsAndSubmit();
      cy.url().should('contain', pageUrl);
    });
  });
});
