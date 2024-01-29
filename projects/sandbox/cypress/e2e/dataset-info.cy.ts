import { selectorBtnSubmitDatasetProblems, selectorBtnSubmitProgress } from '../support/selectors';

context('Sandbox', () => {
  describe('Dataset Info', () => {
    const selDatasetName = 'a.dataset-name';
    const selCountryLang = '.country-language';
    const selCreationDate = '.creation-date a';

    beforeEach(() => {
      cy.visit('/dataset/1');
    });

    it('should show the dataset info', () => {
      cy.get(selDatasetName).should('be.visible');
      cy.get(selCountryLang).should('be.visible');
      cy.get(selCreationDate).should('be.visible');

      cy.get(selectorBtnSubmitDatasetProblems).click();

      cy.get(selDatasetName).should('be.visible');
      cy.get(selCountryLang).should('be.visible');
      cy.get(selCreationDate).should('be.visible');
    });

    it('should expand and collapse the dataset info', () => {
      cy.get('.full-info-view.open').should('have.length', 0);
      cy.get(selDatasetName).click();
      cy.get('.full-info-view.open').should('have.length', 1);
      cy.get(selDatasetName).click();
      cy.get('.full-info-view.open').should('have.length', 0);
    });

    it('should show and hide the warning dialog', () => {
      const selModal = '.modal';
      const selModalBtnClose = `${selModal} button`;

      cy.get(selModal).should('not.exist');
      cy.get(selCreationDate).click();
      cy.get(selModal).should('have.length', 1);
      cy.get(selModalBtnClose).click();
      cy.get(selModal).should('not.exist');

      // navigate to the problems tab and check it there

      cy.get(selectorBtnSubmitDatasetProblems).click();

      cy.get(selModal).should('not.exist');
      cy.get(selCreationDate)
        .filter(':visible')
        .click();
      cy.get(selModal).should('have.length', 1);
      cy.get(selModalBtnClose).click();
      cy.get(selModal).should('not.exist');

      // check the first modal still works after navigating back

      cy.get(selectorBtnSubmitProgress).click();

      cy.get(selModal).should('not.exist');
      cy.get(selCreationDate)
        .filter(':visible')
        .click();
      cy.get(selModal).should('have.length', 1);
      cy.get(selModalBtnClose).click();
      cy.get(selModal).should('not.exist');
    });
  });
});
