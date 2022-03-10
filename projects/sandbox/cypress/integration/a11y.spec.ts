import 'cypress-axe';

context('Sandbox', () => {
  describe('Accessibility', () => {
    const injectAxe = () => {
      /*
       cy.injectAxe();
       cy.injectAxe is currently broken. https://github.com/component-driven/cypress-axe/issues/82
       (so use custom injection logic)
      */

      cy.readFile('../../node_modules/axe-core/axe.min.js').then((source) => {
        return cy.window({ log: false }).then((window) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).eval(source);
        });
      });
    };

    beforeEach(() => {
      cy.server();
    });

    it('Has no detectable a11y violations (upload page)', () => {
      cy.visit('/new');
      injectAxe();
      cy.checkA11y();
    });

    it('Has no detectable a11y violations (progress page)', () => {
      cy.visit('/');
      injectAxe();
      cy.checkA11y();
    });

    it('Has no detectable a11y violations (record report page)', () => {
      cy.visit('/dataset/1?recordId=1');
      injectAxe();
      cy.checkA11y();
    });
  });
});
