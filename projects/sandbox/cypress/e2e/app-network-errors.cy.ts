import { fillProgressForm, fillRecordForm, fillUploadForm, login } from '../support/helpers';
import {
  selectorBtnSubmitData,
  selectorErrors,
  selectorLinkDatasetForm,
  selectorPatternProblemsDatasetOrb,
  selectorPatternProblemsRecordOrb,
  selectorProgressOrb,
  selectorReportOrb,
  selectorUploadOrb
} from '../support/selectors';

context('Sandbox', () => {
  describe('App Network Errors', () => {
    beforeEach(() => {
      cy.visit('/dataset');
      login();
    });

    const closeErrors = (): void => {
      const selCloseErrors = '.close-errors';
      cy.get(selCloseErrors).should('exist');
      cy.get(selCloseErrors)
        .filter(':visible')
        .click();
      cy.get(selCloseErrors).should('not.exist');
    };

    it('should show an error when the data upload fails (404)', () => {
      const code = '404';
      cy.get(selectorLinkDatasetForm).click();
      fillUploadForm(code, true);
      cy.get(selectorErrors)
        .contains(code)
        .should('have.length', 1);
      closeErrors();
    });

    it('should show an error when the data upload fails (413)', () => {
      const code = '413';
      cy.get(selectorLinkDatasetForm).click();
      fillUploadForm(code);
      cy.get(selectorBtnSubmitData).click();
      cy.get(selectorErrors)
        .contains(code)
        .should('have.length', 1);
      cy.get(`${selectorErrors} .heading`)
        .contains('413 PAYLOAD_TOO_LARGE')
        .should('have.length', 1);
      closeErrors();
    });

    it('should show an error when the progress data load fails', () => {
      const code = '400';
      fillProgressForm(code);
      cy.location('pathname').should('equal', `/dataset/${code}`);
      cy.get(selectorErrors)
        .contains(code)
        .should('have.length', 1);
      closeErrors();
    });

    it('should show an error when the (dateset) problem-pattern load fails', () => {
      const code = '401';
      fillProgressForm(code, true);
      cy.location('pathname').should('equal', `/dataset/${code}`);
      cy.location('search').should('equal', '?view=problems');
      cy.get(selectorErrors)
        .contains(code)
        .should('have.length', 1);
      closeErrors();
    });

    it('should show an error when the record report load fails', () => {
      const code = '402';
      fillProgressForm('1');
      fillRecordForm(code);
      cy.location('pathname').should('equal', '/dataset/1');
      cy.location('search').should('equal', `?recordId=${code}`);
      cy.get(selectorErrors)
        .contains(code)
        .should('have.length', 1);
      closeErrors();
    });

    it('should show an error when the (record) problem-pattern load fails', () => {
      const code = '403';
      fillProgressForm('1');
      fillRecordForm(code, true);
      cy.location('pathname').should('equal', '/dataset/1');
      cy.location('search').should('equal', `?recordId=${code}&view=problems`);
      cy.get(selectorErrors)
        .contains(code)
        .should('have.length', 1);
      closeErrors();
    });

    it('should clear the file field after an error', () => {
      const noFileChosen = 'No file chosen';
      const selFileUpload = '.file-upload';
      cy.get(selectorLinkDatasetForm).click();
      fillUploadForm('404');
      cy.get(selectorBtnSubmitData).click();
      cy.get(selFileUpload)
        .contains(noFileChosen)
        .filter(':visible')
        .should('not.exist');
      closeErrors();
      cy.get(selFileUpload)
        .contains(noFileChosen)
        .filter(':visible')
        .should('exist');
    });

    it('should remember the errors for each step', () => {
      cy.get(selectorLinkDatasetForm).click();
      fillUploadForm('404');
      cy.get(selectorBtnSubmitData).click();

      cy.get(selectorErrors).should('have.length', 1);
      cy.get(selectorProgressOrb).click();
      fillProgressForm('400');
      fillProgressForm('401', true);
      fillRecordForm('402');
      fillRecordForm('403', true);

      cy.get(selectorErrors)
        .filter(':visible')
        .should('have.length', 1);

      const checkErrorLength = (err: string, len: number): void => {
        cy.get(selectorErrors)
          .filter(':visible')
          .contains(err)
          .should('have.length', len);
      };

      checkErrorLength('404 Not Found', 0);
      cy.get(selectorUploadOrb).click();
      checkErrorLength('404 Not Found', 1);

      checkErrorLength('400 Bad Request', 0);
      cy.get(selectorProgressOrb).click();
      checkErrorLength('400 Bad Request', 1);

      checkErrorLength('401 Unauthorized', 0);
      cy.get(selectorPatternProblemsDatasetOrb).click();
      checkErrorLength('401 Unauthorized', 1);

      checkErrorLength('402 Payment Required', 0);
      cy.get(selectorReportOrb).click();
      checkErrorLength('402 Payment Required', 1);

      checkErrorLength('403 Forbidden', 0);
      cy.get(selectorPatternProblemsRecordOrb).click();
      checkErrorLength('403 Forbidden', 1);
    });
  });
});
