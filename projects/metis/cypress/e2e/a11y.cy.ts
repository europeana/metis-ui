import 'cypress-axe';

context('metis-ui', () => {
  describe('Accessibility', () => {
    const injectAxe = (): void => {
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

    it('Has no detectable a11y violations on load (custom configuration)', () => {
      cy.visit('/');
      injectAxe();
      cy.checkA11y();
    });
  });
});
