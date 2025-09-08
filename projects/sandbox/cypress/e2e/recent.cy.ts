import { fillUploadForm, login } from '../support/helpers';
import {
  selectorBtnSubmitData,
  selectorInputDatasetId,
  selectorInputRecordId,
  selectorLinkDatasetForm,
  selectorUploadOrb
} from '../support/selectors';

context('Sandbox', () => {
  const optionsThreshold = 5;
  const allSuggestionCount = 24;
  const selRecentOpener = '[data-e2e="opener-links-recent"]';
  const selRecent = '.links-recent';
  const selAllRecent = '.link-recent-all';
  const selDropIn = '.drop-in.active.view-pinned';
  const selDropInSuggestion = `${selDropIn} .item-identifier`;
  const selLinkHome = '.logo';

  const setupUserData = (count = allSuggestionCount): void => {
    cy.visit(`/dataset/${count}`);
    login();
  };

  const setupUserHome = (count = allSuggestionCount): void => {
    setupUserData(count);
    cy.get(selLinkHome).click();
  };

  describe('Recent (home)', () => {
    const selLinkExpand = `${selRecent} +.link-expand`;

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

    it('should expand', () => {
      const selLinkExpanded = `${selLinkExpand}.expanded`;
      setupUserHome(optionsThreshold + 2);
      cy.get(selLinkExpand).should('exist');
      cy.get(selLinkExpanded).should('not.exist');

      cy.get(selLinkExpand).click();
      cy.get(selLinkExpanded).should('exist');

      cy.get(selLinkExpand).click();
      cy.get(selLinkExpanded).should('not.exist');

      cy.get(selLinkExpand).click();
      cy.get(selLinkExpanded).should('exist');
    });

    it('should not be expandable if less than the limit', () => {
      setupUserHome(optionsThreshold - 2);
      cy.get(selLinkExpand).should('not.exist');
    });

    it('should show the most recent', () => {
      const newName1 = 'Most_Recent_1';
      const newName2 = 'Most_Recent_2';
      const newName3 = 'Most_Recent_3';

      const createNewDataset = (datasetName: string): void => {
        fillUploadForm(datasetName);
        cy.get(selectorBtnSubmitData).click();
        cy.get(selLinkHome).click();
      };

      setupUserHome(10);
      cy.get(selectorUploadOrb).click();

      [newName1, newName2, newName3].forEach((newName: string) => {
        createNewDataset(newName);
        cy.get(`${selRecent} li:first-child .ellipsis`)
          .contains(newName)
          .should('exist')
          .click();
        cy.get(selectorLinkDatasetForm).click();
      });
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
      const userId = 23;
      setupUserData(userId);

      cy.get(selRecentOpener).click();
      cy.get(selAllRecent)
        .filter(':visible')
        .click();
      cy.get(selDropIn).should('exist');
      cy.get(selDropInSuggestion).should('have.length.gte', userId);

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
      cy.get(selDropInSuggestion).should('have.length.gte', userId);
    });

    it('should open the datasets', () => {
      setupUserData();
      cy.url().should('contain', allSuggestionCount);

      cy.get(selRecentOpener).click();
      cy.get(`${selRecent} li`)
        .last()
        .prev('li')
        .find('.focus-highlight')
        .invoke('text')
        .then((idRaw) => {
          const id = idRaw.replace(/\D/g, '');
          cy.get(`${selRecent} .focus-highlight`)
            .contains(id)
            .click({ force: true });
          cy.url().should('not.contain', allSuggestionCount);
          cy.url().should('contain', id);
        });
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

      cy.get(`${selRecent} li:has(.link-recent)`)
        .last()
        .find('[tabindex]')
        .focus()
        .type('{esc}');

      cy.get(selRecent)
        .filter(':visible')
        .should('not.exist');
    });
  });
});
