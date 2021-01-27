import { setupUser } from '../support/helpers';

context('metis-ui', () => {
  describe('depublication', () => {
    const selDialogClose = '.modal .btn-close';
    const selDialogFile = '.dialog-file';
    const selDialogInput = '.dialog-input';
    const selGrid = '.depublications-grid';
    const selCtrls = '.depublication-ctrls';
    const selCheckbox = `${selGrid} .checkbox [type="checkbox"]`;
    const selMenuContentAdd = '.dropdown-content.add';
    const selMenuContentDepublish = '.dropdown-content.depublish';
    const selMenuOpenAdd = '.dropdown-options.add > a';
    const selMenuOpenDepublish = '.dropdown-options.depublish > a';
    const selItemDRecords = `${selMenuContentDepublish} :first-child a`;
    const selItemDDataset = `${selMenuContentDepublish} :last-child a`;

    const openDepublishMenu = (): void => {
      cy.get(selCtrls).scrollIntoView();
      cy.get(selMenuContentDepublish).should('not.be.visible');
      cy.get(selMenuOpenDepublish).click({ force: true });
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
        cy.get(selMenuContentAdd).should('not.be.visible');
        cy.get(selMenuOpenAdd).click({ force: true });
        cy.get(selMenuContentAdd).should('be.visible');
        cy.get(selMenuOpenAdd).click({ force: true });
        cy.get(selMenuContentAdd).should('not.be.visible');
      });

      it('should open and close the "depublish" menu', () => {
        cy.wait(1000);
        openDepublishMenu();
        cy.get(selMenuContentDepublish).should('be.visible');
        cy.get(selMenuOpenDepublish).click({ force: true });
        cy.get(selMenuContentDepublish).should('not.be.visible');
      });
    });

    describe('forms', () => {
      const selItemFile = `${selMenuContentAdd} :first-child a`;
      const selItemInput = `${selMenuContentAdd} :last-child a`;
      const selLoadMore = '.tab-content .load-more-btn';

      const submitEntries = (entries: string): void => {
        cy.get(selMenuOpenAdd).click({ force: true });
        cy.get(selItemInput)
          .scrollIntoView()
          .click({ force: true });
        cy.get('[name=recordIds]').type(entries);
        cy.get('.submit-form').click();
      };

      it('should open and close the file dialog form', () => {
        cy.get(selDialogFile).should('not.be.visible');
        cy.get(selMenuOpenAdd).click({ force: true });
        cy.get(selItemFile)
          .scrollIntoView()
          .click({ force: true });

        cy.get(selDialogFile).should('be.visible');
        cy.get(selDialogClose).click();
        cy.get(selDialogFile).should('not.be.visible');
      });

      it('should open and close the input dialog form', () => {
        cy.get(selDialogInput).should('not.be.visible');
        cy.get(selMenuOpenAdd).click({ force: true });
        cy.get(selItemInput)
          .scrollIntoView()
          .click({ force: true });

        cy.get(selDialogInput).should('be.visible');
        cy.get(selDialogClose).click();
        cy.get(selDialogInput).should('not.be.visible');
      });

      it('should submit new entries', () => {
        const testTexts = ['Test1', 'Test2'];
        //        const testMore = ['Test3', 'Test4'];

        submitEntries(testTexts.join('\n'));
        cy.wait(100);

        testTexts.forEach((txt) => {
          cy.get('.record-url')
            .contains(txt)
            .should('have.length', 1);
        });
        cy.get(selLoadMore).should('not.exist');

        /*
        testMore.forEach((txt) => {
          cy.get('.record-url')
            .contains(txt)
            .should('not.exist');
        });

        cy.get(selLoadMore).should('not.exist');

        submitEntries(testMore.join('\n'));
        cy.wait(100);

        cy.get(selLoadMore).should('exist');
        cy.get(selLoadMore).click();

        cy.wait(1000);
        cy.screenshot();

        testMore.forEach((txt) => {
          cy.get('.record-url')
            .contains(txt)
            .should('have.length', 1);
        });
        */
      });

      it('should paginate entries', () => {
        //        const selLoadMore = '.tab-content .load-more-btn';
        //        const testTexts = ['Test1', 'Test2'];
        const testMore = ['Test3', 'Test4'];

        testMore.forEach((txt) => {
          cy.get('.record-url')
            .contains(txt)
            .should('not.exist');
        });

        submitEntries(testMore.join('\n'));
        cy.wait(100);

        cy.get(selLoadMore).should('exist');
        cy.get(selLoadMore).click();

        cy.wait(1000);
        cy.screenshot();

        testMore.forEach((txt) => {
          cy.get('.record-url')
            .contains(txt)
            .should('have.length', 1);
        });
      });
    });

    describe('confirmations', () => {
      const selDialogConfirm = '.modal-wrapper';
      const selDialogConfirmClose = selDialogConfirm + ' .btn-close';

      it('should ask confirmation for dataset depublication', () => {
        cy.get(selDialogConfirm).should('not.be.visible');
        cy.wait(1000);
        openDepublishMenu();
        cy.get(selItemDDataset).click({ force: true });
        cy.get(selDialogConfirm).should('be.visible');
        cy.get(selDialogConfirmClose).click();
        cy.get(selDialogConfirm).should('not.be.visible');
      });

      it('should ask confirmation for record id depublication', () => {
        cy.get(selDialogConfirm).should('not.be.visible');
        cy.wait(1000);
        cy.get(selCheckbox).check({ force: true });
        openDepublishMenu();
        cy.get(selItemDRecords).click({ force: true });
        cy.get(selDialogConfirm).should('be.visible');
        cy.get(selDialogConfirmClose).click();
        cy.get(selDialogConfirm).should('not.be.visible');
      });
    });

    describe('checkboxes', () => {
      const selCheckAll = '.grid-header [type="checkbox"]';

      it('should check all checkboxes', () => {
        cy.wait(1000);
        cy.get(`${selCheckbox}`).should('have.length', 2);
        cy.get(`${selCheckbox}`).should('not.be.checked');
        cy.get(selCheckAll).check({ force: true });
        cy.get(`${selCheckbox}`).should('be.checked');
        cy.get(selCheckAll).uncheck({ force: true });
        cy.get(`${selCheckbox}`).should('not.be.checked');
      });

      it('should automaticallly check and uncheck the "check-all" checkbox', () => {
        cy.get(`${selCheckAll}`).should('not.be.checked');
        cy.get(selCheckbox).check({ force: true });
        cy.get(`${selCheckAll}`).should('be.checked');
        cy.get(selCheckbox).uncheck({ force: true });
        cy.get(`${selCheckAll}`).should('not.be.checked');
      });
    });
  });
});
