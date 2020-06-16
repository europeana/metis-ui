import { setupUser } from '../support/helpers';

context('metis-ui', () => {
  describe('search results', () => {
    const selDialogClose = '.modal .btn-close';
    const selDialogFile = '.dialog-file';
    const selDialogInput = '.dialog-input';
    const selGrid = '.depublications-grid';
    const selMenuContent = '.dropdown-content';
    const selMenuOpen = '.dropdown-options > a';
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

    it('should open and close the menu', () => {
      cy.get(selMenuContent).should('not.be.visible');
      cy.get(selMenuOpen).click();
      cy.get(selMenuContent).should('be.visible');
      cy.get(selMenuOpen).click();
      cy.get(selMenuContent).should('not.be.visible');
    });

    it('should open and close the file dialog form', () => {
      cy.get(selDialogFile).should('not.be.visible');
      cy.get(selMenuOpen).click();
      cy.get(selMenuItemFile)
        .scrollIntoView()
        .click({ force: true });

      cy.get(selDialogFile).should('be.visible');
      cy.get(selDialogClose).click();
      cy.get(selDialogFile).should('not.be.visible');
    });

    it('should open and close the input dialog form', () => {
      cy.get(selDialogInput).should('not.be.visible');
      cy.get(selMenuOpen).click();
      cy.get(selMenuItemInput)
        .scrollIntoView()
        .click({ force: true });

      cy.get(selDialogInput).should('be.visible');
      cy.get(selDialogClose).click();
      cy.get(selDialogInput).should('not.be.visible');
    });

    it('should submit new entries', () => {
      const testTexts = ['Test1', 'Test2', 'Test3'];

      cy.get(selMenuOpen).click();
      cy.get(selMenuItemInput)
        .scrollIntoView()
        .click({ force: true });

      testTexts.forEach((txt) => {
        cy.get('.record-url')
          .contains(txt)
          .should('have.length', 0);
      });

      cy.get('[name=recordIds]').type(testTexts.join(' '));
      cy.get('.submit-form').click();

      testTexts.forEach((txt) => {
        cy.get('.record-url')
          .contains(txt)
          .should('have.length', 1);
      });
    });
  });
});
