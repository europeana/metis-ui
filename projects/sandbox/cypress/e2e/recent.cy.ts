import { login } from '../support/helpers';
import { selectorInputDatasetId, selectorInputRecordId } from '../support/selectors';

context('Sandbox', () => {
  const selRecentOpener = '[data-e2e="opener-links-recent"]';
  const selRecent = '.links-recent';
  const selAllRecent = '.link-recent-all';
  const selDropIn = '.drop-in.active.view-pinned';
  const selDropInSuggestion = `${selDropIn} .item-identifier`;

  const setupUserData = (): void => {
    cy.visit('/dataset/1');
    login();
  };

  const setupUserHome = (): void => {
    cy.visit('/');
    login();
  };

  describe('Recent (home)', () => {
    it('should display if logged in', () => {
      cy.visit('/');
      cy.get(selRecent).should('not.exist');
      login();
      cy.get(selRecent)
        .filter(':visible')
        .should('exist');
    });

    it('should redirect and open the drop-in', () => {
      setupUserHome();
      cy.get(selDropIn).should('not.exist');
      cy.get(selAllRecent).click();
      cy.get(selDropIn).should('exist');
      cy.url().should('contain', 'dataset');
    });
  });

  describe('Recent (dataset)', () => {
    it('should not display if not logged in', () => {
      cy.visit('/dataset/1');
      cy.get(selRecentOpener).should('not.exist');
      login();
      cy.get(selRecentOpener).should('exist');
      cy.get(selRecent)
        .filter(':visible')
        .should('not.exist');
    });

    it('should display pre-opened if there is no dataset in the url', () => {
      cy.visit('/dataset');
      cy.get(selRecentOpener).should('not.exist');
      login();
      cy.get(selRecentOpener).should('exist');
      cy.get(selRecent)
        .filter(':visible')
        .should('exist');
    });

    it('should open and close', () => {
      setupUserData();
      cy.get(selRecent)
        .filter(':visible')
        .should('not.exist');
      cy.get(selRecentOpener).click();
      cy.get(selRecent)
        .filter(':visible')
        .should('exist');
    });

    it('should open the drop-in', () => {
      setupUserData();
      cy.get(selDropIn).should('not.exist');
      cy.get(selRecentOpener).click();
      cy.get(selAllRecent)
        .filter(':visible')
        .click();
      cy.get(selDropIn).should('exist');

      // close
      cy.get(selectorInputRecordId)
        .focus()
        .click();
      cy.get(selDropIn).should('not.exist');

      // re-open
      cy.get(selAllRecent)
        .filter(':visible')
        .click();

      cy.get(selDropIn).should('exist');
    });

    it('should override the drop-in filter', () => {
      const allSuggestionCount = 24;
      setupUserData();

      cy.get(selectorInputDatasetId)
        .focus()
        .type('22');
      cy.get(selRecentOpener).click();
      cy.get(selAllRecent)
        .filter(':visible')
        .click();
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
      cy.get(selRecent)
        .filter(':visible')
        .should('not.exist');
      cy.get(selRecentOpener)
        .filter(':visible')
        .focus()
        .type('{enter}');
      cy.get(selRecent)
        .filter(':visible')
        .should('exist');
    });

    it('should open the drop-in', () => {
      setupUserData();
      cy.get(selDropIn).should('not.exist');
      cy.get(selRecentOpener)
        .filter(':visible')
        .focus()
        .type('{enter}');
      cy.get(selAllRecent)
        .filter(':visible')
        .focus()
        .type('{enter}');
      cy.get(selDropIn)
        .filter(':visible')
        .should('exist');
    });
  });
});
