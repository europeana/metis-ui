import { fillProgressForm, fillRecordForm } from '../support/helpers';
import {
  selectorInputRecordId,
  selectorLinkDatasetForm,
  selectorLinkProgressForm,
  selectorProgressOrb,
  selectorReportOrb,
  selectorUploadOrb
} from '../support/selectors';

context('Sandbox', () => {
  describe('App Urls', () => {
    const clickFormLink = (selector: string): void => {
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
      cy.location('search').should('have.length', 0);
      fillRecordForm('2');
      cy.location('search').should('equal', '?recordId=2');
    });

    it('should remove a path section when the user clicks the track-dataset link', () => {
      cy.visit('/1?recordId=2');
      cy.location('pathname').should('equal', '/1');
      clickFormLink(selectorLinkProgressForm);
      cy.location('pathname').should('equal', '/1');
      cy.location('search').should('have.length', 0);
    });

    it('should add and remove path sections when the user clicks the orbs', () => {
      cy.visit('/1?recordId=2');

      cy.get(selectorProgressOrb)
        .filter(':visible')
        .should('have.length', 0);

      clickFormLink(selectorLinkProgressForm);

      cy.get(selectorProgressOrb)
        .filter(':visible')
        .should('have.length.gt', 0);

      cy.location('pathname').should('equal', '/1');
      cy.location('search').should('have.length', 0);

      cy.get(selectorReportOrb).click();

      cy.location('pathname').should('equal', '/1');
      cy.location('search').should('equal', '?recordId=2');

      cy.get(selectorProgressOrb).click();
      cy.location('pathname').should('equal', '/1');
      cy.location('search').should('have.length', 0);

      // expose dataset form orbs
      clickFormLink(selectorLinkDatasetForm);
      cy.location('pathname').should('equal', '/');
      cy.location('search').should('have.length', 0);

      cy.get(selectorUploadOrb)
        .scrollIntoView()
        .filter(':visible')
        .should('have.length.gt', 0);

      cy.get(selectorProgressOrb)
        .scrollIntoView()
        .filter(':visible')
        .click({ force: true });

      cy.location('pathname').should('equal', '/1');
      cy.location('search').should('have.length', 0);

      cy.get(selectorReportOrb).click({ force: true });
      cy.location('pathname').should('equal', '/1');
      cy.location('search').should('equal', '?recordId=2');

      cy.get(selectorUploadOrb).should('have.length', 1);
      cy.get(selectorUploadOrb).click({ force: true });

      cy.location('pathname').should('equal', '/');
      cy.location('search').should('have.length', 0);
    });

    it('should remember the history', () => {
      const originalRecordId = 'original';
      const otherRecordId = 'secondary';

      cy.visit(`/1?recordId=${originalRecordId}`);
      cy.get(selectorInputRecordId).should('have.value', originalRecordId);

      fillRecordForm(otherRecordId);
      cy.get(selectorInputRecordId).should('have.value', otherRecordId);

      cy.go('back');
      cy.get(selectorInputRecordId).should('have.value', originalRecordId);

      cy.go('back');
      cy.location('search').should('equal', '');

      const recordIds = ['the', 'correct', 'order'];

      fillProgressForm('1');

      recordIds.forEach((rId: string) => {
        fillRecordForm(rId);
        cy.location('search').should('equal', `?recordId=${rId}`);
      });

      cy.visit('/2');

      recordIds
        .slice()
        .reverse()
        .forEach((rId: string) => {
          cy.go('back');
          cy.location('search').should('equal', `?recordId=${rId}`);
          cy.get(selectorInputRecordId).should('have.value', rId);
        });

      cy.go('back');
      cy.location('search').should('equal', '');

      recordIds.forEach((rId: string) => {
        cy.go('forward');
        cy.location('search').should('equal', `?recordId=${rId}`);
        cy.get(selectorInputRecordId).should('have.value', rId);
      });
    });
  });
});
