import { setupUser } from '../support/helpers';

context('metis-ui', () => {
  describe('depublication', () => {
    const force = { force: true };
    const selDialogClose = '.modal .btn-close';
    const selDialogFile = '.modal .file-upload';
    const selDialogInput = '.modal textarea';
    const selGrid = '.depublications-grid';
    const selCtrls = '.depublication-ctrls';
    const selCheckbox = `${selGrid} .checkbox [type="checkbox"]`;
    const selMenuContentAdd = '.dropdown-content.add';
    const selMenuContentDepublish = '.dropdown-content.depublish';
    const selMenuOpenAdd = '.dropdown-options.add > a';
    const selMenuOpenDepublish = '.dropdown-options.depublish > a';
    const selItemDRecords = `${selMenuContentDepublish} :first-child a`;
    const selItemDDataset = `${selMenuContentDepublish} :last-child a`;

    const selCheckboxes = '[data-e2e="depublication-delete"]';
    const selCheckAll = '.grid-header-underlined [type="checkbox"]';
    const selItemFile = `${selMenuContentAdd} :first-child a`;
    const selItemInput = `${selMenuContentAdd} :last-child a`;
    const selLoadMore = '.tab-content .load-more-btn';

    const submitEntries = (entries: string): void => {
      cy.get(selMenuOpenAdd).click(force);
      cy.get(selItemInput)
        .scrollIntoView()
        .click(force);
      cy.get('[name=recordIds]').type(entries);
      cy.get('.modal [type="button"]').click();
      cy.wait(100);
    };

    const deleteVisibleEntries = (): void => {
      cy.get(selCheckboxes).check(force);
      cy.get('.depublication-ctrls .btn-delete').click(force);
      cy.wait(100);
    };

    const openDepublishMenu = (): void => {
      cy.get(selCtrls).scrollIntoView();
      cy.get(selMenuContentDepublish).should('not.exist');
      cy.get(selMenuOpenDepublish).click(force);
      cy.get(selMenuContentDepublish).should('be.visible');
    };

    beforeEach(() => {
      cy.server();
      setupUser();
      cy.visit('/dataset/depublication/0');
    });

    describe('grid', () => {
      it('should show the grid and menus', () => {
        cy.get(selGrid).should('have.length', 1);
        cy.get('.depublication-ctrls').should('have.length', 1);
      });
    });

    describe('menus', () => {
      it('should open and close the "add" menu', () => {
        cy.wait(1000);
        cy.get(selCtrls).scrollIntoView();
        cy.get(selMenuContentAdd).should('not.exist');
        cy.get(selMenuOpenAdd).click(force);
        cy.get(selMenuContentAdd).should('be.visible');
        cy.get(selMenuOpenAdd).click(force);
        cy.get(selMenuContentAdd).should('not.exist');
      });

      it('should open and close the "depublish" menu', () => {
        cy.wait(1000);
        openDepublishMenu();
        cy.get(selMenuContentDepublish).should('be.visible');
        cy.get(selMenuOpenDepublish).click(force);
        cy.get(selMenuContentDepublish).should('not.exist');
      });
    });

    describe('forms', () => {
      describe('successful operations', () => {
        it('should open and close the file dialog form', () => {
          cy.get(selDialogFile).should('not.exist');
          cy.get(selMenuOpenAdd).click(force);
          cy.get(selItemFile)
            .scrollIntoView()
            .click(force);

          cy.get(selDialogFile).should('be.visible');
          cy.get(selDialogClose).click();
          cy.get(selDialogFile).should('not.exist');
        });

        it('should open and close the input dialog form', () => {
          cy.get(selDialogInput).should('not.exist');
          cy.get(selMenuOpenAdd).click(force);
          cy.get(selItemInput)
            .scrollIntoView()
            .click(force);

          cy.get(selDialogInput).should('be.visible');
          cy.get(selDialogClose).click();
          cy.get(selDialogInput).should('not.exist');
        });

        it('should submit new entries', () => {
          const testTexts = ['Test1', 'Test2'];
          submitEntries(testTexts.join('\n'));

          testTexts.forEach((txt) => {
            cy.get('.record-url')
              .contains(txt)
              .should('have.length', 1);
          });
          cy.get(selLoadMore).should('not.exist');
        });

        it('should check all checkboxes', () => {
          cy.wait(1000);
          cy.get(`${selCheckbox}`).should('have.length', 2);
          cy.get(`${selCheckbox}`).should('not.be.checked');
          cy.get(selCheckAll).check(force);
          cy.get(`${selCheckbox}`).should('be.checked');
          cy.get(selCheckAll).uncheck(force);
          cy.get(`${selCheckbox}`).should('not.be.checked');
        });

        it('should automatically check and uncheck the "check-all" checkbox', () => {
          cy.get(`${selCheckAll}`).should('not.be.checked');
          cy.get(selCheckbox).check(force);
          cy.get(`${selCheckAll}`).should('be.checked');
          cy.get(selCheckbox).uncheck(force);
          cy.get(`${selCheckAll}`).should('not.be.checked');
        });

        it('should delete entries', () => {
          cy.get(selCheckboxes).should('have.length', 2);
          deleteVisibleEntries();
          cy.get(selCheckboxes).should('have.length', 0);
        });

        it('should paginate entries', () => {
          const testMore = ['Test1', 'Test2', 'Test3', 'Test4'];

          cy.get(selLoadMore).should('not.exist');

          submitEntries(testMore.join('\n'));
          cy.wait(100);

          cy.get(selLoadMore).should('exist');
          cy.get(selLoadMore).click();

          cy.wait(100);
          cy.screenshot();

          testMore.slice(2).forEach((txt) => {
            cy.get('.record-url')
              .contains(txt)
              .should('have.length', 1);
          });

          deleteVisibleEntries();
        });
      });

      describe('errors', () => {
        it('should handle errors saving', () => {
          cy.get('.error-notification').should('not.exist');
          submitEntries('404');
          cy.wait(3000);
          cy.get('.error-notification').should('have.length', 1);
        });

        it('should handle errors deleting', () => {
          cy.get('.error-notification').should('not.exist');
          const recordText = 'ERROR_404';
          submitEntries(recordText);
          cy.wait(100);
          cy.get('.error-notification').should('not.exist');
          deleteVisibleEntries();
          cy.get('.error-notification').should('have.length', 1);
        });
      });
    });

    describe('confirmations', () => {
      const selDialogConfirm = '.modal-wrapper';
      const selDialogConfirmClose = selDialogConfirm + ' .btn-close';

      it('should ask confirmation for dataset depublication', () => {
        cy.get(selDialogConfirm).should('not.exist');
        cy.wait(1000);
        openDepublishMenu();
        cy.get(selItemDDataset).click(force);
        cy.get(selDialogConfirm).should('be.visible');
        cy.get(selDialogConfirmClose).click();
        cy.get(selDialogConfirm).should('not.exist');
      });

      it('should ask confirmation for record id depublication', () => {
        submitEntries('Test1\nTest2');
        cy.get(selDialogConfirm).should('not.exist');
        cy.wait(1000);
        cy.get(selCheckbox).check(force);
        openDepublishMenu();
        cy.get(selItemDRecords).click(force);
        cy.get(selDialogConfirm).should('be.visible');
        cy.get(selDialogConfirmClose).click();
        cy.get(selDialogConfirm).should('not.exist');
        deleteVisibleEntries();
      });
    });
  });
});
