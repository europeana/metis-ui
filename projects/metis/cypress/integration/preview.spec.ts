import { cleanupUser, setupUser } from '../support/helpers';

export type FillMenuNumber = 1 | 2 | 3;

context('metis-ui', () => {
  const force = { force: true };
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

  const checkMenusVisible = (): void => {
    cy.get(selMenuDate).should('be.visible');
    cy.get(selMenuPlugin).should('be.visible');
    cy.get(selMenuCompare).should('be.visible');
    cy.get(selEditorCompare).should('be.visible');
  };

  const fillMenus = (number: FillMenuNumber): void => {
    cy.scrollTo(0, 100000);

    cy.get(selMenuDate + ' a').click(force);
    cy.get(selMenuDateItems).should('be.visible');

    cy.get(selMenuDateFirstItem).click(force);
    cy.get(selMenuPlugin).should('be.visible');
    cy.get(selMenuDateItems).should('have.length', 0);
    cy.get(selEditorDefault).should('have.length', 0);
    cy.get(selEditorCompare).should('have.length', 0);

    if (number === 1) {
      return;
    }
    cy.get(selMenuPlugin + ' a').click(force);
    cy.get(selMenuPluginItems).should('be.visible');

    cy.get(selMenuPluginSecondItem).click(force);
    cy.get(selMenuCompare).should('be.visible');

    cy.get(selEditorDefault).should('be.visible');
    cy.get(selEditorCompare).should('have.length', 0);

    if (number === 2) {
      return;
    }

    cy.get(selMenuCompare + ' a').click(force);
    cy.get(selMenuCompareFirstItem).click(force);

    cy.get(selEditorDefault).should('have.length', 0);
    cy.get(selEditorCompare).should('be.visible');
  };

  const leaveAndReturn = (): void => {
    cy.get(`.tabs a[href="${urlLog}"]`).click(force);
    cy.wait(1000);
    cy.get(`.tabs a[href="${urlPreview}"]`).click(force);
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
      cy.get(selMenuDate).should('not.exist');
      cy.get(selMenuPlugin).should('not.exist');
      cy.get(selMenuCompare).should('not.exist');
      cy.get(selMenuDateItems).should('not.exist');
      cy.get(selMenuPluginItems).should('not.exist');
      cy.get(selMenuCompareItems).should('not.exist');
    });

    it('should open the menus successively', () => {
      cy.scrollTo(0, 100000);
      cy.get(selMenuDateItems).should('not.exist');
      cy.get(selMenuPluginItems).should('not.exist');
      cy.get(selMenuCompareItems).should('not.exist');
      fillMenus(3);
      checkMenusVisible();
    });

    it('should restore the selection when the user leaves then returns', () => {
      fillMenus(3);
      leaveAndReturn();
      cy.get(selEditorDefault).should('not.exist');
      cy.get(selEditorCompare).should('be.visible');
      checkMenusVisible();
    });

    it('should maintain themed editors', () => {
      fillMenus(3);
      const selEditorOps = '.theme-ctrl';
      const selIndicatorActiveBlack = '.theme-ctrl.black.active';
      const selIndicatorActiveWhite = '.theme-ctrl.active:not(.black)';

      const selLinkThemeBlack = '[data-e2e=set-theme-white]';
      const selLinkThemeWhite = '[data-e2e=set-theme-white]';
      console.log(selLinkThemeBlack + selLinkThemeWhite + selIndicatorActiveWhite);

      cy.get(selEditorOps).should('have.length', 5);
      cy.get(selLinkThemeBlack).should('not.exist', 1);
      cy.get(selLinkThemeWhite).should('not.exist', 1);

      cy.get(selEditorOps)
        .first()
        .click(force);

      cy.get(selLinkThemeBlack).should('have.length', 1);
      cy.get(selLinkThemeWhite).should('have.length', 1);
      cy.get(selIndicatorActiveBlack).should('not.exist');
      cy.get(selIndicatorActiveWhite).should('have.length', 1);

      cy.get(selLinkThemeBlack).click(force);

      // re-open the menu, check switched
      cy.get(selEditorOps)
        .first()
        .click(force);

      cy.get(selLinkThemeBlack).should('have.length', 1);
      cy.get(selLinkThemeWhite).should('have.length', 1);
      cy.get(selIndicatorActiveBlack).should('have.length', 1);
      cy.get(selIndicatorActiveWhite).should('not.exist');

      // check the last item is switched too
      cy.get(selEditorOps)
        .first()
        .click(force);
      cy.get(selEditorOps)
        .last()
        .click(force);

      cy.get(selLinkThemeBlack).should('have.length', 1);
      cy.get(selLinkThemeWhite).should('have.length', 1);
      cy.get(selIndicatorActiveBlack).should('have.length', 1);
      cy.get(selIndicatorActiveWhite).should('not.exist');
    });

    it('should clear the editors when the user changes the date', () => {
      const checkEditorsHidden = (): void => {
        cy.get(selEditorCompare).should('not.exist');
        cy.get(selEditorDefault).should('not.exist');
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
      cy.get(selEditorCompare).should('not.exist');
      leaveAndReturn();
      cy.get(selEditorCompare).should('not.exist');
      fillMenus(3);
      cy.get(selEditorCompare).should('be.visible');
      leaveAndReturn();
      cy.get(selEditorCompare).should('be.visible');

      fillMenus(2);
      cy.get(selEditorCompare).should('not.exist');
      leaveAndReturn();
      cy.get(selEditorCompare).should('not.exist');
    });
  });
});
