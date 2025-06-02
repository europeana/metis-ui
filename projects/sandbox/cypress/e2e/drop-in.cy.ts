import { selectorInputDatasetId } from '../support/selectors';

context('Sandbox', () => {
  const selDropIn = '.drop-in .item-list';

  describe('Drop-In (selection)', () => {});

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
