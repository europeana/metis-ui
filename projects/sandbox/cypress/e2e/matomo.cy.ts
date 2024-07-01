import {
  selectorLinkDatasetForm,
  selectorPatternProblemsDatasetOrb,
  selectorPatternProblemsRecordOrb,
  selectorProgressOrb,
  selectorReportOrb,
  selectorUploadOrb
} from '../support/selectors';

import { fillProgressForm, fillRecordForm, fillUploadForm } from '../support/helpers';

context('Sandbox', () => {
  describe('Matomo', () => {
    let expected = 1;
    const expectedLogsPerNav = 4;

    const bump = (override?: number): void => {
      expected += override ? override : expectedLogsPerNav;
    };

    const checkLogLength = (length: number): void => {
      cy.window()
        .its('matomoLog')
        .should('have.length', length);
    };

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

    it('should log dataset navigation', () => {
      // nav via forms

      cy.visit('/dataset');
      expected = 1;
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

    it('should log dataset navigation (creation)', () => {
      cy.visit('/');
      expected = 1;
      checkLogLength(expected);

      bump();
      cy.get(selectorUploadOrb).click(force);
      checkLogLength(expected);

      bump();
      fillUploadForm('MyThing', true);
      checkLogLength(expected);

      cy.window()
        .its('matomoLog')
        .should('deep.include', ['trackEvent', 'navigation', 'click', 'form']);
    });

    it('should track clicks on links from dataset problems to record problems', () => {
      const id = 101;
      const url = `/dataset/${id}?view=problems`;
      const urlRecord = `&recordId=/${id}/00/`;

      cy.visit(url);
      expected = 1;
      checkLogLength(expected);

      cy.wait(2500);
      cy.reload();
      cy.visit(url);
      checkLogLength(expected);

      cy.get('[href="' + (url + urlRecord) + '"]')
        .eq(0)
        .click();

      bump();
      checkLogLength(expected);

      cy.window()
        .its('matomoLog')
        .should('deep.include', ['trackEvent', 'navigation', 'click', 'link']);
    });

    it('should track clicks on the tier-zero warning pop-out links', () => {
      const selectorPopOutOpener = '.pop-out-opener .nav-orb';

      cy.visit('/dataset/3');
      expected = 1;
      checkLogLength(expected);

      bump();

      cy.get(selectorPopOutOpener)
        .eq(0)
        .click();

      cy.get('.warning-view-list .view-record-report')
        .eq(0)
        .click();
      checkLogLength(expected);
    });

    it('should track clicks from the tier statistics to the report', () => {
      const url = '/dataset/1';
      const urlLink = `${url}?recordId=/1/A_record-id_1_0`;
      const selectorOpenStats = '.nav-orb.pie-orb';

      cy.visit(url);
      expected = 1;
      checkLogLength(expected);

      bump();

      cy.get(selectorOpenStats)
        .eq(0)
        .click();
      cy.get('[href="' + urlLink + '"]')
        .eq(0)
        .click();
      checkLogLength(expected);
    });

    it('should track downloads (from dataset info)', () => {
      const url = 'dataset/4';
      const selViewPublished = '.hide-mobile .portal-links.available';
      cy.visit(url);
      checkLogLength(1);
      cy.get(selViewPublished).click();
      checkLogLength(2);
    });

    it('should track record downloads (from the report)', () => {
      const url = 'dataset/1?recordId=2';
      const selRecordLinks = '.report-value .external-link';
      cy.visit(url);
      checkLogLength(1);

      cy.get(selRecordLinks).should('have.length', 4);

      cy.get(selRecordLinks)
        .eq(0)
        .click();
      checkLogLength(2);

      cy.get(selRecordLinks)
        .eq(1)
        .click();
      checkLogLength(3);

      cy.get(selRecordLinks)
        .eq(2)
        .click();
      checkLogLength(4);

      cy.get(selRecordLinks)
        .eq(3)
        .click();
      checkLogLength(5);
    });

    it('should track downloads (from the record info)', () => {
      const url = 'dataset/7?recordId=3&view=problems';
      cy.visit(url);
      checkLogLength(1);
      cy.get('a')
        .contains('export as pdf')
        .click();
      checkLogLength(2);
    });
  });
});
