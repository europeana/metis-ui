import {
  selectorLinkDatasetForm,
  selectorProgressOrb,
  selectorReportOrb,
  selectorUploadOrb,
  selectorPatternProblemsDatasetOrb,
  selectorPatternProblemsRecordOrb
} from '../support/selectors';

import { fillProgressForm, fillRecordForm } from '../support/helpers';

context('Sandbox', () => {
  describe('Matomo', () => {
    const appServer = 'http://localhost:4280';

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
      const tracked = 'trackPageView';

      cy.visit(url);
      fillProgressForm('1', true);

      cy.window()
        .its('matomoLog')
        .should('have.length', 2)
        .and('deep.include', appServer + url)
        .and('deep.include', [tracked]);
    });

    it('should log navigation', () => {
      cy.visit('/dataset/1');

      fillProgressForm('1', true);

      cy.window()
        .its('matomoLog')
        .should('have.length', 2);

      fillRecordForm('7');
      fillRecordForm('7', true);

      cy.get(selectorLinkDatasetForm).click();

      cy.window()
        .its('matomoLog')
        .should('have.length', 5);

      // now use the nav orbs
      cy.get(selectorProgressOrb).click();
      cy.get(selectorReportOrb).click();
      cy.get(selectorUploadOrb).click();
      cy.get(selectorPatternProblemsDatasetOrb).click();
      cy.get(selectorPatternProblemsRecordOrb).click();

      cy.window()
        .its('matomoLog')
        .should('have.length', 10);
    });
  });
});
