import { fillProgressForm, fillRecordForm, fillUploadForm } from '../support/helpers';
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
      cy.server();
      cy.visit('/');
    });

    it('should show an error when the data upload fails', () => {
      const code = '404';
      cy.get(selectorLinkDatasetForm).click();
      fillUploadForm(code);
      cy.get(selectorBtnSubmitData).click();
      cy.get(selectorErrors)
        .contains(code)
        .should('have.length', 1);
    });

    it('should show an error when the progress data load fails', () => {
      const code = '400';
      fillProgressForm(code);
      cy.location('pathname').should('equal', `/dataset/${code}`);
      cy.get(selectorErrors)
        .contains(code)
        .should('have.length', 1);
    });

    it('should show an error when the (dateset) problem-pattern load fails', () => {
      const code = '401';
      fillProgressForm(code, true);
      cy.location('pathname').should('equal', `/dataset/${code}`);
      cy.location('search').should('equal', '?view=problems');
      cy.get(selectorErrors)
        .contains(code)
        .should('have.length', 1);
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
    });

    it('should remember the errors for each step', () => {
      console.log(
        selectorReportOrb +
          '' +
          selectorPatternProblemsRecordOrb +
          '' +
          selectorPatternProblemsDatasetOrb
      );
      const force = { force: true };
      cy.get(selectorLinkDatasetForm).click(force);
      fillUploadForm('404');
      cy.get(selectorBtnSubmitData).click(force);

      cy.get(selectorProgressOrb).click(force);
      fillProgressForm('400');
      fillProgressForm('401', true);
      fillRecordForm('402');
      fillRecordForm('403', true);

      cy.wait(500);

      const checkErrorLength = (err: string, len: number): void => {
        cy.get(selectorErrors)
          .filter(':visible')
          .contains(err)
          .should('have.length', len);
      };

      checkErrorLength('404 Not Found', 0);
      cy.get(selectorUploadOrb).click(force);
      checkErrorLength('404 Not Found', 1);

      checkErrorLength('400 Bad Request', 0);
      cy.get(selectorProgressOrb).click(force);
      checkErrorLength('400 Bad Request', 1);

      checkErrorLength('401 Unauthorized', 0);
      cy.get(selectorPatternProblemsDatasetOrb).click(force);
      checkErrorLength('401 Unauthorized', 1);

      checkErrorLength('402 Payment Required', 0);
      cy.get(selectorReportOrb).click(force);
      checkErrorLength('402 Payment Required', 1);

      checkErrorLength('403 Forbidden', 0);
      cy.get(selectorPatternProblemsRecordOrb).click(force);
      checkErrorLength('403 Forbidden', 1);
    });
  });
});
