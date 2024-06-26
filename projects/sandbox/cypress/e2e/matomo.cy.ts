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
    const appServer = 'http://localhost:4280';

    const checkLogLength = (length: number) => {
      cy.window()
        .its('matomoLog')
        .should('have.length', length);
    };

    const force = { force: true };

    it('should create the tracker / log', () => {
      cy.visit('/');
      cy.window()
        .its('_paq')
        .should('exist');
      cy.window()
        .its('matomoLog')
        .then((log) => {
          expect(log.length).to.equal(1);
          expect(log[0]).to.includes('/');
        });
    });

    it('should append to the tracker log', () => {
      const url = '/dataset/1';
      cy.visit(url);
      cy.window()
        .its('matomoLog')
        .should('have.length', 1)
        .and('deep.include', appServer + url);

      fillProgressForm('1', true);
      cy.window()
        .its('matomoLog')
        .should('have.length', 4)
        .and('deep.include', ['setCustomUrl', '/dataset/1?view=problems'])
        .and('deep.include', ['setDocumentTitle', 'Problem Patterns (Dataset)'])
        .and('deep.include', ['trackPageView']);
    });

    it('should log all navigation', () => {
      // nav via forms

      cy.visit('/dataset');
      checkLogLength(1);

      fillProgressForm('1', false);
      checkLogLength(4);

      fillProgressForm('1', false);
      checkLogLength(4);

      fillProgressForm('1', true);
      checkLogLength(7);

      fillRecordForm('7');
      checkLogLength(10);

      fillRecordForm('7', true);
      checkLogLength(13);

      // nav via links

      cy.get(selectorLinkDatasetForm).click(force);
      checkLogLength(16);

      // nav via orbs

      cy.get(selectorProgressOrb).click(force);
      checkLogLength(19);

      cy.get(selectorReportOrb).click(force);
      checkLogLength(22);

      cy.get(selectorUploadOrb).click(force);
      checkLogLength(25);

      cy.get(selectorPatternProblemsDatasetOrb).click(force);
      checkLogLength(28);

      cy.get(selectorPatternProblemsRecordOrb).click(force);
      checkLogLength(31);
    });
  });
});
