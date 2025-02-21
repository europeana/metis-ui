import 'cypress-axe';

context('Sandbox Accessibility', () => {
  const checkZone = (selector: string): void => {
    cy.get(selector).should('have.length', 1);
    cy.checkA11y(selector);
  };

  const injectAxe = (): void => {
    // cy.injectAxe();
    // cy.injectAxe is currently broken. https://github.com/component-driven/cypress-axe/issues/82
    // (so use custom injection logic)

    cy.readFile('../../node_modules/axe-core/axe.min.js').then((source) => {
      return cy.window({ log: false }).then((window) => {
        window.eval(source);
      });
    });
  };

  describe('Upload Page', () => {
    beforeEach(() => {
      cy.visit('/new');
      injectAxe();
    });

    it('Has an accessible header', () => {
      checkZone('header');
    });

    it('Has an accessible footer', () => {
      checkZone('footer');
    });

    it('Has an accessible main', () => {
      checkZone('main');
    });

    it('Has no detectable a11y violations', () => {
      cy.checkA11y();
    });
  });

  describe('Progress Page', () => {
    beforeEach(() => {
      cy.visit('/dataset');
      injectAxe();
    });

    it('Has an accessible header', () => {
      checkZone('header');
    });

    it('Has an accessible footer', () => {
      checkZone('footer');
    });

    it('Has an accessible main', () => {
      checkZone('main');
    });

    it('Has no detectable a11y violations', () => {
      cy.checkA11y();
    });
  });

  describe('Problem Patterns (Dataset) Page', () => {
    beforeEach(() => {
      cy.visit('/dataset/1?view=problems');
      injectAxe();
    });

    it('Has an accessible header', () => {
      checkZone('header');
    });

    it('Has an accessible footer', () => {
      checkZone('footer');
    });

    it('Has an accessible main', () => {
      checkZone('main');
    });

    it('Has no detectable a11y violations', () => {
      cy.checkA11y();
    });
  });

  describe('Record Report Pages', () => {
    beforeEach(() => {
      cy.visit('/dataset/1?recordId=1');
      injectAxe();
    });

    it('Has an accessible header', () => {
      checkZone('header');
    });

    it('Has an accessible footer', () => {
      checkZone('footer');
    });

    it('Has an accessible main', () => {
      checkZone('main');
    });

    it('Has no detectable a11y violations ( page)', () => {
      cy.checkA11y();
    });
  });

  describe('Problem Patterns (Record) Page', () => {
    beforeEach(() => {
      cy.visit('/dataset/1?recordId=1&view=problems');
      injectAxe();
    });

    it('Has an accessible header', () => {
      checkZone('header');
    });

    it('Has an accessible footer', () => {
      checkZone('footer');
    });

    it('Has an accessible main', () => {
      checkZone('main');
    });

    it('Has no detectable a11y violations', () => {
      cy.checkA11y();
    });
  });
});
