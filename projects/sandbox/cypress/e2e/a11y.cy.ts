import 'cypress-axe';

context('Sandbox Accessibility', () => {
  const baseExclusions: string[] = ['.eu-cm-mini-mode-text'];

  const checkZone = (selector: string, pageExclusions: string[] = baseExclusions): void => {
    cy.get(selector).should('have.length', 1);
    cy.checkA11y({
      include: [selector],
      exclude: pageExclusions.map((item) => [item])
    });
  };

  const injectAxe = (): void => {
    cy.readFile('../../node_modules/axe-core/axe.min.js').then((source) => {
      return cy.window({ log: false }).then((window) => {
        window.eval(source);
      });
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

  describe('Upload Page', () => {
    runStandardSuite('/new', ['header', 'footer', 'main'], baseExclusions);
  });

  describe('Progress Page', () => {
    const colourContrastExclusions = ['.link-dataset-form', '.link-locked'];
    runStandardSuite(
      '/dataset',
      ['header', 'footer', 'main'],
      [...baseExclusions, ...colourContrastExclusions]
    );
  });

  describe('Problem Patterns (Dataset) Page', () => {
    const colourContrastExclusions = ['.title-record-occurences', '.link-locked'];
    runStandardSuite(
      '/dataset/1?view=problems',
      ['header', 'footer', 'main'],
      [...baseExclusions, ...colourContrastExclusions]
    );
  });

  describe('Record Report Pages', () => {
    const colourContrastExclusions = ['.link-locked'];
    runStandardSuite(
      '/dataset/1?recordId=1',
      ['header', 'footer', 'main'],
      [...baseExclusions, ...colourContrastExclusions]
    );
  });

  describe('Problem Patterns (Record) Page', () => {
    const colourContrastExclusions = ['.link-locked'];
    runStandardSuite(
      '/dataset/1?recordId=1&view=problems',
      ['header', 'footer', 'main'],
      [...baseExclusions, ...colourContrastExclusions]
    );
  });
});
