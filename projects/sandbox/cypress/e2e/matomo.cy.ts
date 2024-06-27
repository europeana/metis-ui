import {
  selectorLinkDatasetForm,
  selectorPatternProblemsDatasetOrb,
  selectorPatternProblemsRecordOrb,
  selectorProgressOrb,
  selectorReportOrb,
  selectorUploadOrb
} from '../support/selectors';

import { fillProgressForm, fillRecordForm } from '../support/helpers';

context('Sandbox', () => {
  describe('Matomo', () => {
    const checkLogLength = (length: number): void => {
      cy.window()
        .its('matomoLog')
        .should('have.length', length);
    };

    const expectedLogsPerNav = 4;
    const force = { force: true };

    it('should create the tracker (and a log when in ci mode)', () => {
      const url = '/';
      cy.visit(url);
      cy.window()
        .its('_paq')
        .should('exist');
      cy.window()
        .its('matomoLog')
        .then((log) => {
          expect(log.length).to.equal(1);
          expect(log[0]).to.includes(url);
        });
    });

    it('should append to the tracker log', () => {
      const appServer = 'http://localhost:4280';
      const url = 'dataset/1';
      cy.visit(url);
      cy.window()
        .its('matomoLog')
        .should('have.length', 1)
        .and('deep.include', `${appServer}/${url}`);

      fillProgressForm('1', true);
      cy.window()
        .its('matomoLog')
        .should('have.length', 1 + expectedLogsPerNav)
        .and('deep.include', ['setCustomUrl', '/dataset/1?view=problems'])
        .and('deep.include', ['setDocumentTitle', 'Problem Patterns (Dataset)'])
        .and('deep.include', ['trackPageView']);
    });

    it('should log all navigation', () => {
      let expected = 1;
      const bump = (override?: number): void => {
        expected += override ? override : expectedLogsPerNav;
      };

      // nav via forms

      cy.visit('/dataset');
      checkLogLength(expected);

      bump();
      fillProgressForm('1', false);
      checkLogLength(expected);

      bump(1);
      fillProgressForm('1', false);
      checkLogLength(expected);

      bump();
      fillProgressForm('1', true);
      checkLogLength(expected);

      bump();
      fillRecordForm('7');
      checkLogLength(expected);

      bump();
      fillRecordForm('7', true);
      checkLogLength(expected);

      // nav via links

      bump();
      cy.get(selectorLinkDatasetForm).click(force);
      checkLogLength(expected);

      // nav via orbs

      bump();
      cy.get(selectorProgressOrb).click(force);
      checkLogLength(expected);

      bump();
      cy.get(selectorReportOrb).click(force);
      checkLogLength(expected);

      bump();
      cy.get(selectorUploadOrb).click(force);
      checkLogLength(expected);

      bump();
      cy.get(selectorPatternProblemsDatasetOrb).click(force);
      checkLogLength(expected);

      bump();
      cy.get(selectorPatternProblemsRecordOrb).click(force);
      checkLogLength(expected);
    });
  });
});
