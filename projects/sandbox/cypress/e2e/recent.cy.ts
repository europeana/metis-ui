import { login } from '../support/helpers';
import { selectorInputDatasetId, selectorInputRecordId } from '../support/selectors';

context('Sandbox', () => {
  const allSuggestionCount = 24;
  const selRecentOpener = '[data-e2e="opener-links-recent"]';
  const selRecent = '.links-recent';
  const selAllRecent = '.link-recent-all';
  const selDropIn = '.drop-in.active.view-pinned';
  const selDropInSuggestion = `${selDropIn} .item-identifier`;

  const setupUserData = (count = allSuggestionCount): void => {
    cy.visit(`/dataset/${count}`);
    login();
  };

  const setupUserHome = (count = allSuggestionCount): void => {
    setupUserData(count);
    cy.get('.logo').click();
  };

  describe('Recent (home)', () => {
    it('should display if logged in', () => {
      cy.visit('/');
      cy.get(selRecent).should('not.exist');
      setupUserHome();
      cy.get(selRecent)
        .filter(':visible')
        .should('exist');
    });

    it('should not display if no data is available', () => {
      cy.visit('/');
      cy.get(selRecent).should('not.exist');
      setupUserHome(0);
      cy.get(selRecent).should('not.exist');
    });

    it('should open the datasets', () => {
      setupUserHome();
      cy.url().should('not.contain', 'dataset');
      cy.get(`${selRecent} li:first-child a`).click({ force: true });
      cy.url().should('contain', 'dataset');
    });

    it('should redirect and open the drop-in', () => {
      setupUserHome();
      cy.url().should('not.contain', 'dataset');
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

    it('should not display if no data is available', () => {
      cy.get(selRecentOpener).should('not.exist');
      setupUserData(0);
      cy.get(selRecentOpener).should('not.exist');
    });

    it('should display pre-opened if there is no dataset in the url', () => {
      setupUserData();
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
      cy.get(selRecentOpener).click();
      cy.get(selAllRecent)
        .filter(':visible')
        .click();

      cy.get(selDropIn).should('exist');
    });

    it('should override the drop-in filter', () => {
      setupUserData();

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

    it('should open the datasets', () => {
      const newId = 5;
      setupUserData();
      cy.url().should('contain', allSuggestionCount);
      cy.url().should('not.contain', newId);

      cy.get(selRecentOpener).click();
      cy.get(`${selRecent} li`)
        .last()
        .prev('li')
        .find('.link-recent')
        .click({ force: true });

      cy.url().should('not.contain', allSuggestionCount);
      cy.url().should('contain', newId);
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

    it('should open the datasets', () => {
      setupUserHome();
      cy.url().should('not.contain', 'dataset');
      cy.get(`${selRecent} li:last-child a`)
        .focus()
        .type('{enter}');
      cy.url().should('contain', 'dataset');
    });

    it('should toggle the drop-in', () => {
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

    it('should close the list', () => {
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

      cy.get(`${selRecent} li`)
        .last()
        .prev('li')
        .find('.link-recent')
        .focus()
        .type('{esc}', { force: true });

      cy.get(selRecent)
        .filter(':visible')
        .should('not.exist');
    });
  });
});
