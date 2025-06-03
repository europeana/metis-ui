import { selectorInputDatasetId } from '../support/selectors';

context('Sandbox', () => {
  const selDropIn = '.drop-in .item-list';

  describe('Drop-In (selection)', () => {
    const selFirstSuggestion = '.item-identifier:first-child';

    it('should set the value', () => {
      cy.visit('/dataset');
      cy.get(selectorInputDatasetId).should('have.value', '');
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selFirstSuggestion).click();
      cy.get(selectorInputDatasetId).should('have.value', '0');
    });

    it('should hide when the value is set (keyboard)', () => {
      cy.visit('/dataset');
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selFirstSuggestion).focus();
      cy.get(selFirstSuggestion).type('{enter}');

      cy.get(selDropIn).should('not.exist');
    });

    it('should hide when the value is set (click)', () => {
      cy.visit('/dataset');
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selFirstSuggestion).click();
      cy.get(selDropIn).should('not.exist');
    });

    it('should hide when the input is blurred', () => {
      cy.visit('/dataset');
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selDropIn).should('exist');
      cy.press(Cypress.Keyboard.Keys.TAB);
      cy.get(selDropIn).should('not.exist');
    });

    it('should set the correct caret position', () => {
      // open
      cy.visit('/dataset');
      cy.get(selectorInputDatasetId).should('have.value', '');
      cy.get(selectorInputDatasetId).type('{esc}');

      // set
      cy.get(selFirstSuggestion).click();
      cy.get(selectorInputDatasetId).should('have.value', '0');
      cy.get(selectorInputDatasetId).type('0');

      // confirm typng overwrites
      cy.get(selectorInputDatasetId).should('have.value', '0');

      // re-open and close
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selectorInputDatasetId).type('{esc}');

      // confirm typng appends
      cy.get(selectorInputDatasetId).type('0');
      cy.get(selectorInputDatasetId).should('have.value', '00');
    });
  });

  describe('Drop-In (display)', () => {
    it('should be hidden by default', () => {
      cy.visit('/dataset');
      cy.get(selDropIn).should('not.exist');
    });

    it('should show (all) when the "Escape" key is pressed', () => {
      cy.visit('/dataset');
      cy.get(selDropIn).should('not.exist');
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selDropIn).should('exist');
    });

    it('should toggle when the "Escape" key is pressed', () => {
      cy.visit('/dataset');
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selDropIn).should('exist');
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selDropIn).should('not.exist');
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selDropIn).should('exist');
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selDropIn).should('not.exist');
    });

    it('should show when the field is filled (auto-suggest)', () => {
      cy.visit('/dataset');
      cy.get(selDropIn).should('not.exist');
      cy.get(selectorInputDatasetId).type('11');
      cy.get(selDropIn).should('exist');
    });

    it('should not auto-suggest (again) once closed', () => {
      cy.visit('/dataset');
      cy.get(selectorInputDatasetId).type('11');
      cy.get(selDropIn).should('exist');
      cy.get(selectorInputDatasetId).type('{esc}');
      cy.get(selDropIn).should('not.exist');
      cy.get(selectorInputDatasetId).type('11');
      cy.get(selDropIn).should('not.exist');
    });
  });
});
