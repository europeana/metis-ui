import { login } from '../support/helpers';
import { selectorInputDatasetId } from '../support/selectors';

context('Sandbox', () => {
  const selRecentOpener = '[data-e2e="opener-links-recent"]';
  const selRecent = '.links-recent';
  const selAllRecent = '.link-recent-all';
  const selDropIn = '.drop-in.active.view-pinned';
  const selDropInSuggestion = `${selDropIn} .item-identifier`;

  const setupUserData = (): void => {
    cy.visit('/dataset');
    login();
  };

  describe('Recent', () => {
    it('should not display if not logged in', () => {
      cy.visit('/dataset');
      cy.get(selRecentOpener).should('not.exist');
      login();
      cy.get(selRecentOpener).should('exist');
    });

    it('should open and close', () => {
      setupUserData();
      cy.get(selRecent).should('not.exist');
      cy.get(selRecentOpener).click();
      cy.get(selRecent).should('exist');
    });

    it('should open the drop-in', () => {
      setupUserData();
      cy.get(selDropIn).should('not.exist');
      cy.get(selRecentOpener).click();
      cy.get(selAllRecent).click();
      cy.get(selDropIn).should('exist');
    });

    it('should override the drop-in filter', () => {
      const allSuggestionCount = 24;
      setupUserData();

      cy.get(selectorInputDatasetId)
        .focus()
        .type('22');
      cy.get(selRecentOpener).click();
      cy.get(selAllRecent).click();
      cy.get(selDropIn).should('exist');
      cy.get(selDropInSuggestion).should('have.length', allSuggestionCount);

      // reactive filter
      cy.get(selectorInputDatasetId)
        .focus()
        .clear()
        .type('22');
      cy.get(selDropInSuggestion).should('have.length', 1);

      // remove filter text
      cy.get(selectorInputDatasetId)
        .focus()
        .clear();
      cy.get(selDropInSuggestion).should('have.length', allSuggestionCount);
    });
  });

  describe('Recent (keyboard)', () => {
    it('should open and close', () => {
      setupUserData();
      cy.get(selRecent).should('not.exist');
      cy.get(selRecentOpener)
        .focus()
        .type('{enter}');
      cy.get(selRecent).should('exist');
    });

    it('should open the drop-in', () => {
      setupUserData();
      cy.get(selDropIn).should('not.exist');
      cy.get(selRecentOpener)
        .focus()
        .type('{enter}');
      cy.get(selAllRecent)
        .focus()
        .type('{enter}');
      cy.get(selDropIn).should('exist');
    });
  });
});
