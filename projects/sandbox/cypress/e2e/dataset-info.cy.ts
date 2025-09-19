import { selectorBtnSubmitDatasetProblems } from '../support/selectors';

context('Sandbox', () => {
  describe('Dataset Info', () => {
    const selDatasetName = 'a.dataset-name';
    const selCountryLang = '.country-language';
    const selCreationDate = '.creation-date';

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
      const force = { force: true };
      cy.get('.full-info-view.open').should('have.length', 0);
      cy.get(selDatasetName).click(force);
      cy.get('.full-info-view.open').should('have.length', 1);
      cy.get(selDatasetName).click(force);
      cy.get('.full-info-view.open').should('have.length', 0);
    });
  });
});
