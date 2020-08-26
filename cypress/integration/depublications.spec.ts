import { setupUser } from '../support/helpers';

context('metis-ui', () => {
  describe('search results', () => {
    const selDialogClose = '.modal .btn-close';
    const selDialogFile = '.dialog-file';
    const selDialogInput = '.dialog-input';
    const selGrid = '.depublications-grid';
    const selCtrls = '.depublication-ctrls';
    const selMenuContentAdd = '.dropdown-content.add';
    const selMenuContentDepublish = '.dropdown-content.depublish';
    const selMenuOpenAdd = '.dropdown-options.add > a';
    const selMenuOpenDepublish = '.dropdown-options.depublish > a';
    let selMenuItemFile = '.dropdown-content :first-child a';
    let selMenuItemInput = '.dropdown-content :last-child a';

    beforeEach(() => {
      cy.server();
      setupUser();
      cy.visit('/dataset/depublication/0');
    });

    it('should show the grid and menus', () => {
      cy.get(selGrid).should('have.length', 1);
      cy.get('.depublication-ctrls').should('have.length', 1);
    });

    it('should open and close the "add" menu', () => {
      cy.wait(1000);
      cy.get(selCtrls).scrollIntoView();
      cy.get(selMenuContentAdd).should('not.be.visible');
      cy.get(selMenuOpenAdd).click({ force: true });
      cy.get(selMenuContentAdd).should('be.visible');
      cy.get(selMenuOpenAdd).click({ force: true });
      cy.get(selMenuContentAdd).should('not.be.visible');
    });

    it('should open and close the "depublish" menu', () => {
      cy.wait(1000);
      cy.get(selCtrls).scrollIntoView();
      cy.get(selMenuContentDepublish).should('not.be.visible');
      cy.get(selMenuOpenDepublish).click({ force: true });
      cy.get(selMenuContentDepublish).should('be.visible');
      cy.get(selMenuOpenDepublish).click({ force: true });
      cy.get(selMenuContentDepublish).should('not.be.visible');
    });

    it('should open and close the file dialog form', () => {
      cy.get(selDialogFile).should('not.be.visible');
      cy.get(selMenuOpenAdd).click({ force: true });
      cy.get(selMenuItemFile)
        .scrollIntoView()
        .click({ force: true });

      cy.get(selDialogFile).should('be.visible');
      cy.get(selDialogClose).click();
      cy.get(selDialogFile).should('not.be.visible');
    });

    it('should open and close the input dialog form', () => {
      cy.get(selDialogInput).should('not.be.visible');
      cy.get(selMenuOpenAdd).click({ force: true });
      cy.get(selMenuItemInput)
        .scrollIntoView()
        .click({ force: true });

      cy.get(selDialogInput).should('be.visible');
      cy.get(selDialogClose).click();
      cy.get(selDialogInput).should('not.be.visible');
    });

    it('should submit new entries', () => {
      const selLoadMore = '.tab-content .load-more-btn';
      const testTexts = ['Test1', 'Test2'];
      const testMore = ['Test3', 'Test4'];
      const submitEntries = (entries: string): void => {
        cy.get(selMenuOpenAdd).click({ force: true });
        cy.get(selMenuItemInput)
          .scrollIntoView()
          .click({ force: true });
        cy.get('[name=recordIds]').type(entries);
        cy.get('.submit-form').click();
      };

      submitEntries(testTexts.join('\n'));

      testTexts.forEach((txt) => {
        cy.get('.record-url')
          .contains(txt)
          .should('have.length', 1);
      });

      testMore.forEach((txt) => {
        cy.get('.record-url')
          .contains(txt)
          .should('not.exist');
      });

      cy.get(selLoadMore).should('not.exist');

      submitEntries(testMore.join('\n'));

      cy.get(selLoadMore).should('exist');

      cy.get(selLoadMore).click();

      testMore.forEach((txt) => {
        cy.get('.record-url')
          .contains(txt)
          .should('have.length', 1);
      });
    });
  });
});
