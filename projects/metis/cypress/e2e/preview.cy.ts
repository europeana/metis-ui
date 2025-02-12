export type FillMenuNumber = 1 | 2 | 3;

context('metis-ui', () => {
  const force = { force: true };
  const datasetId = '0';
  const urlLog = `/dataset/log/${datasetId}`;
  const urlPreview = `/dataset/preview/${datasetId}`;

  const selEditorCompare = '.view-sample-compared';
  const selEditorDefault = `.view-sample:not(${selEditorCompare}):not(.no-sample):not(.search-editor)`;
  const selEditorSearch = '.view-sample.search-editor';

  const selMenuCompare = '.dropdown-compare';
  const selMenuDate = '.dropdown-date';
  const selMenuPlugin = '.dropdown-plugin';

  const selNotificationError = '.error-notification';

  const selContent = '.dropdown-content';
  const selFirstItem = 'li:first-child a';
  const selSecondItem = 'li:nth-child(2) a';

  const selMenuCompareItems = `${selMenuCompare} ${selContent}`;
  const selMenuDateItems = `${selMenuDate} ${selContent}`;
  const selMenuPluginItems = `${selMenuPlugin} ${selContent}`;

  const selMenuCompareFirstItem = `${selMenuCompare} ${selFirstItem}`;
  const selMenuDateFirstItem = `${selMenuDateItems} ${selFirstItem}`;
  const selMenuPluginSecondItem = `${selMenuPluginItems} ${selSecondItem}`;

  const selEditorSearchContent = `${selEditorSearch} .view-sample-editor`;
  const selEditorSearchError = `${selEditorSearch} .error`;
  const selBtnSearch = `${selEditorSearch} .search`;
  const selInputSearch = `${selEditorSearch} .search-string`;

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
    cy.get(selMenuDateItems).should('not.exist');
    cy.get(selEditorDefault).should('not.exist');
    cy.get(selEditorCompare).should('not.exist');

    if (number === 1) {
      return;
    }
    cy.get(selMenuPlugin + ' a').click(force);
    cy.get(selMenuPluginItems).should('be.visible');

    cy.get(selMenuPluginSecondItem).click(force);
    cy.get(selMenuCompare).should('be.visible');

    cy.get(selEditorDefault).should('be.visible');
    cy.get(selEditorCompare).should('not.exist');

    if (number === 2) {
      return;
    }

    cy.get(selMenuCompare + ' a').click(force);
    cy.get(selMenuCompareFirstItem).click(force);

    cy.get(selEditorDefault).should('not.exist');
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
      cy.visit(urlPreview);
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
      const selEditorOps = '.editor-ctrl';
      const selIndicatorActiveBlack = '.editor-ctrl.black.active';
      const selIndicatorActiveWhite = '.editor-ctrl.active:not(.black)';

      const selLinkThemeBlack = '[data-e2e=set-theme-black]';
      const selLinkThemeWhite = '[data-e2e=set-theme-white]';

      cy.get(selEditorOps).should('have.length', 6);
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

    it('should search', () => {
      fillMenus(3);
      cy.get(selEditorSearchContent).should('not.exist');
      cy.get(selBtnSearch).click(force);
      cy.wait(500);
      cy.get(selInputSearch).type('ABC123');
      cy.get(selBtnSearch).click(force);
      cy.get(selEditorSearchContent).should('exist');
    });

    it('should warn of empty searches', () => {
      fillMenus(3);
      cy.get(selBtnSearch).click(force);
      cy.wait(500);
      cy.get(selEditorSearchError).should('not.exist');

      cy.get(selInputSearch).type('tiny');
      cy.get(selBtnSearch).click(force);
      cy.get(selEditorSearchContent).should('not.exist');
      cy.get(selEditorSearchError).should('exist');
    });

    it('should show search errors', () => {
      fillMenus(3);
      cy.get(selBtnSearch).click(force);
      cy.wait(500);
      cy.get(selEditorSearchError).should('not.exist');

      cy.get(selInputSearch).type('500');
      cy.get(selBtnSearch).click(force);
      cy.wait(3000);

      cy.get(selEditorSearchContent).should('not.exist');
      cy.get(selEditorSearchError).should('not.exist');
      cy.get(selNotificationError).should('exist');
    });

    it('should update the search result when the plugin changes', () => {
      fillMenus(3);
      cy.get(selBtnSearch).click(force);
      cy.wait(500);
      cy.get(selInputSearch).type('ABC123');
      cy.get(selBtnSearch).click(force);
      cy.contains(selEditorSearchContent, 'VALIDATION_EXTERNAL').should('exist');
      cy.get(selMenuPlugin + ' a').click(force);
      cy.get(`${selMenuPluginItems} li:nth-child(3) a`).click(force);
      cy.contains(selEditorSearchContent, 'TRANSFORMATION').should('exist');
    });

    it('should update the search result with a comparison', () => {
      const selInnerEditors = `${selEditorSearch} .view-sample-editor-codemirror`;
      console.log(selEditorSearchError);
      fillMenus(3);
      cy.get(selBtnSearch).click(force);
      cy.wait(500);
      cy.get(selInputSearch).type('ABC123');
      cy.get(selBtnSearch).click(force);
      cy.contains(selEditorSearchContent, 'VALIDATION_EXTERNAL').should('exist');
      cy.get(selInnerEditors).should('have.length', 1);

      cy.get(selMenuCompare + ' a').click(force);
      cy.get(selMenuCompareFirstItem).click(force);
      cy.get(selInnerEditors).should('have.length', 2);
    });

    it('should remember the search when the user switches tabs', () => {
      fillMenus(3);
      cy.get(selEditorSearchContent).should('not.exist');
      cy.get(selBtnSearch).click(force);
      cy.wait(500);
      cy.get(selInputSearch).type('ABC123');
      cy.get(selBtnSearch).click(force);
      cy.get(selEditorSearchContent).should('exist');
      leaveAndReturn();
      cy.wait(500);
      cy.get(selEditorSearchContent).should('exist');
    });

    it('should remember the compared search when the user switches tabs', () => {
      fillMenus(3);
      leaveAndReturn();
      cy.get(selEditorDefault).should('not.exist');
      cy.get(selEditorCompare).should('be.visible');
      cy.get(selEditorSearchContent).should('not.exist');

      cy.get(selBtnSearch).click(force);
      cy.wait(500);
      cy.get(selInputSearch).type('ABC123');
      cy.get(selBtnSearch).click(force);
      cy.get(selEditorSearchContent).should('exist');

      leaveAndReturn();
      cy.wait(500);
      cy.get(selEditorSearchContent).should('exist');
    });
  });
});
