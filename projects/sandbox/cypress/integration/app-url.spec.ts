import { fillProgressForm, fillRecordForm } from '../support/helpers';
import {
  selectorLinkDatasetForm,
  selectorLinkProgressForm,
  selectorProgressOrb,
  selectorReportOrb
} from '../support/selectors';

context('Sandbox', () => {
  describe('App Urls', () => {
    const clickFormLink = (progressForm = true): void => {
      const selector = progressForm ? selectorLinkProgressForm : selectorLinkDatasetForm;
      cy.get(selector)
        .scrollIntoView()
        .should('be.visible');
      cy.wait(500);
      cy.get(selector).click({ force: true });
    };

    beforeEach(() => {
      cy.server();
      cy.visit('/');
    });

    it('should add a path section when the progress form is submitted', () => {
      cy.location('pathname').should('equal', '/');
      fillProgressForm('1');
      cy.location('pathname').should('equal', '/1');
    });

    it('should add a path section when the record form is submitted', () => {
      fillProgressForm('1');
      cy.location('pathname').should('equal', '/1');
      fillRecordForm('2');
      cy.location('pathname').should('equal', '/1/2');
    });

    it('should remove a path section when the user clicks the track-dataset link', () => {
      cy.visit('/1/2');
      clickFormLink();
      cy.location('pathname').should('equal', '/1');
    });

    it('should add and remove path sections when the user clicks the orbs', () => {
      cy.visit('/1/2');

      cy.get(selectorProgressOrb)
        .filter(':visible')
        .should('have.length', 0);

      clickFormLink();

      cy.get(selectorProgressOrb)
        .filter(':visible')
        .should('have.length.gt', 0);

      cy.location('pathname').should('equal', '/1');
      cy.get(selectorReportOrb).click();

      cy.location('pathname').should('equal', '/1/2');
      cy.get(selectorProgressOrb).click();
      cy.location('pathname').should('equal', '/1');

      // expose dataset form orbs
      clickFormLink(false);

      cy.location('pathname').should('equal', '/');

      cy.get(selectorProgressOrb).click();
      cy.location('pathname').should('equal', '/1');
      cy.get(selectorReportOrb).click();
      cy.location('pathname').should('equal', '/1/2');

      const selOrbDatasetStepOne = '.wizard-head .orb-container:first-child';
      cy.get(selOrbDatasetStepOne).should('have.length', 1);
      cy.get(selOrbDatasetStepOne).click();

      cy.location('pathname').should('equal', '/');
    });
  });
});