import { cleanupUser, setupUser } from '../support/helpers';

export type FillMenuNumber = 1 | 2 | 3;

context('metis-ui', () => {
  const datasetId = '0';
  const urlLog = `/dataset/log/${datasetId}`;
  const urlPreview = `/dataset/preview/${datasetId}`;

  const selEditorCompare = '.view-sample-compared';
  const selEditorDefault = `.view-sample:not(${selEditorCompare}):not(.no-sample)`;

  const selMenuCompare = '.dropdown-compare';
  const selMenuDate = '.dropdown-date';
  const selMenuPlugin = '.dropdown-plugin';

  const selContent = '.dropdown-content';
  const selFirstItem = 'li:first-child a';
  const selSecondItem = 'li:nth-child(2) a';

  const selMenuCompareItems = `${selMenuCompare} ${selContent}`;
  const selMenuDateItems = `${selMenuDate} ${selContent}`;
  const selMenuPluginItems = `${selMenuPlugin} ${selContent}`;

  const selMenuCompareFirstItem = `${selMenuCompare} ${selFirstItem}`;
  const selMenuDateFirstItem = `${selMenuDateItems} ${selFirstItem}`;
  const selMenuPluginSecondItem = `${selMenuPluginItems} ${selSecondItem}`;

  const checkMenusVisible = () => {
    cy.get(selMenuDate).should('be.visible');
    cy.get(selMenuPlugin).should('be.visible');
    cy.get(selMenuCompare).should('be.visible');
    cy.get(selEditorCompare).should('be.visible');
  };

  const fillMenus = (number: FillMenuNumber) => {
    cy.scrollTo(0, 100000);

    cy.get(selMenuDate + ' a').click({ force: true });
    cy.get(selMenuDateItems).should('be.visible');

    cy.get(selMenuDateFirstItem).click({ force: true });
    cy.get(selMenuPlugin).should('be.visible');
    cy.get(selMenuDateItems).should('not.be.visible');
    cy.get(selEditorDefault).should('not.be.visible');
    cy.get(selEditorCompare).should('not.be.visible');

    if (number === 1) {
      return;
    }
    cy.get(selMenuPlugin + ' a').click({ force: true });
    cy.get(selMenuPluginItems).should('be.visible');

    cy.get(selMenuPluginSecondItem).click({ force: true });
    cy.get(selMenuCompare).should('be.visible');

    cy.get(selEditorDefault).should('be.visible');
    cy.get(selEditorCompare).should('not.be.visible');

    if (number === 2) {
      return;
    }

    cy.get(selMenuCompare + ' a').click({ force: true });
    cy.get(selMenuCompareFirstItem).click({ force: true });

    cy.get(selEditorDefault).should('not.be.visible');
    cy.get(selEditorCompare).should('be.visible');
  };

  const leaveAndReturn = () => {
    cy.get(`.tabs a[href="${urlLog}"]`).click({ force: true });
    cy.wait(1000);
    cy.get(`.tabs a[href="${urlPreview}"]`).click({ force: true });
    cy.wait(1000);
  };

  describe('Preview', () => {
    beforeEach(() => {
      cy.server();
      setupUser();
      cy.visit(urlPreview);
    });

    afterEach(() => {
      cleanupUser();
    });

    it('should show a single menu on initialisation', () => {
      cy.get(selMenuDate).should('have.length', 1);
      cy.get(selMenuPlugin).should('have.length', 0);
      cy.get(selMenuCompare).should('have.length', 0);
      cy.get(selMenuDateItems).should('not.be.visible');
      cy.get(selMenuPluginItems).should('not.be.visible');
      cy.get(selMenuCompareItems).should('not.be.visible');
    });

    it('should open the menus successively', () => {
      cy.scrollTo(0, 100000);
      cy.get(selMenuDateItems).should('not.be.visible');
      cy.get(selMenuPluginItems).should('not.be.visible');
      cy.get(selMenuCompareItems).should('not.be.visible');
      fillMenus(3);
      checkMenusVisible();
    });

    it('should restore the selection when the user leaves then returns', () => {
      fillMenus(3);
      leaveAndReturn();
      cy.get(selEditorDefault).should('not.be.visible');
      cy.get(selEditorCompare).should('be.visible');
      checkMenusVisible();
    });

    it('should clear the editors when the user changes the date', () => {
      const checkEditorsHidden = () => {
        cy.get(selEditorCompare).should('not.be.visible');
        cy.get(selEditorDefault).should('not.be.visible');
      };

      checkEditorsHidden();
      fillMenus(2);
      cy.get(selEditorDefault).should('be.visible');
      leaveAndReturn();
      cy.get(selEditorDefault).should('be.visible');

      fillMenus(1);
      checkEditorsHidden();

      fillMenus(3);
      cy.get(selEditorCompare).should('be.visible');
      leaveAndReturn();
      cy.get(selEditorCompare).should('be.visible');

      fillMenus(1);
      cy.get(selEditorCompare).should('not.be.visible');
      leaveAndReturn();
      cy.get(selEditorCompare).should('not.be.visible');
      fillMenus(3);
      cy.get(selEditorCompare).should('be.visible');
      leaveAndReturn();
      cy.get(selEditorCompare).should('be.visible');

      fillMenus(2);
      cy.get(selEditorCompare).should('not.be.visible');
      leaveAndReturn();
      cy.get(selEditorCompare).should('not.be.visible');
    });
  });
});
