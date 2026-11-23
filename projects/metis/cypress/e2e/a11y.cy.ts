import 'cypress-axe';
import { UrlManipulation } from '../../test-data/_models/url-manipulation.mts';

context('metis-ui Accessibility', () => {
  const baseExclusions: string[] = [
    // Add shared exclusions here (e.g., '.eu-cm-mini-mode-text')
  ];

  const injectAxe = (): void => {
    cy.readFile('../../node_modules/axe-core/axe.min.js').then((source) => {
      return cy.window({ log: false }).then((window) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).eval(source);
      });
    });
  };

  const checkZone = (selector: string, pageExclusions: string[] = baseExclusions): void => {
    cy.get(selector).should('have.length', 1);
    cy.checkA11y({
      include: [[selector]],
      exclude: pageExclusions.map((item) => [item])
    });
  };

  const runStandardSuite = (
    url: string,
    zones: string[] = ['header', 'footer', 'main'],
    pageExclusions: string[] = baseExclusions
  ): void => {
    beforeEach(() => {
      cy.visit(url);
      injectAxe();
    });

    zones.forEach((zone) => {
      it(`Has an accessible ${zone}`, () => {
        checkZone(zone, pageExclusions);
      });
    });

    it('Has no detectable a11y violations', () => {
      cy.checkA11y({ exclude: pageExclusions });
    });
  };

  beforeEach(() => {
    cy.request(Cypress.env('dataServer') + '/' + UrlManipulation.METIS_UI_CLEAR);
  });

  describe('Landing Page', () => {
    runStandardSuite('/', ['header', 'footer', 'main'], baseExclusions);
  });

  describe('Dashboard', () => {
    const colourContrastExceptions = [
      '.progress-percentage',
      '.grid-header',
      '.grid-header-underlined',
      '.grid-row',
      '.pill-harvest',
      '.grid-cell',
      '.load-more-btn',
      '.dropdown > a'
    ];

    const dashboardeExclusions = [...baseExclusions, ...colourContrastExceptions];

    runStandardSuite('/dashboard', ['header', 'main'], dashboardeExclusions);
  });
});
