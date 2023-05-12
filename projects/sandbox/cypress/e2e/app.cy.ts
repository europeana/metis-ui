context('Sandbox', () => {
  describe('App', () => {
    beforeEach(() => {
      cy.server();
      cy.visit('/dataset');
    });

    const selHamburger = '.hamburger';
    const selectorLogo = '.metis-logo .logo';
    const selectorSandboxNavigation = '.sandbox-navigation';

    const selectorFeedback = '.links-external :nth-of-type(1) .external-link-left';
    const selectorUserGuide = '.links-external :nth-of-type(2) .external-link-left';
    const selectorDocumentation = '.links-external :nth-of-type(3) .external-link-left';

    const selectorsLinks = [selectorFeedback, selectorUserGuide, selectorDocumentation];

    const checkLinksHidden = (): void => {
      selectorsLinks.forEach((link: string) => {
        cy.get(link)
          .filter(':visible')
          .should('not.exist');
      });
    };

    const checkLinksVisible = (): void => {
      selectorsLinks.forEach((link: string) => {
        cy.get(link)
          .filter(':visible')
          .should('have.length', 1);
      });
    };

    it('should show the header and the sandbox navigation component', () => {
      cy.get(selectorLogo).should('have.length', 1);
      cy.get(selectorSandboxNavigation).should('have.length', 1);
    });

    it('should open and close the side panel', () => {
      checkLinksHidden();
      cy.get(selHamburger).click();
      checkLinksVisible();
      cy.get(selHamburger).click();
      checkLinksHidden();
    });

    it('should open and close the side panel (key enter)', () => {
      checkLinksHidden();
      cy.get(selHamburger).focus();
      cy.get(selHamburger).type('{enter}');
      checkLinksVisible();
      cy.get(selHamburger).type('{enter}');
      checkLinksHidden();
    });
  });
});
