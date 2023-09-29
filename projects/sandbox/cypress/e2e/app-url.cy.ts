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
  const force = { force: true };

  describe('App Urls', () => {
    const clickFormLink = (selector: string): void => {
      cy.get(selector)
        .scrollIntoView()
        .should('be.visible');
      cy.wait(500);
      cy.get(selector).click(force);
    };

    beforeEach(() => {
      cy.visit('/dataset');
    });

    it('should add a path section when the progress form is submitted', () => {
      cy.location('pathname').should('equal', '/dataset');
      fillProgressForm('1');
      cy.location('pathname').should('equal', '/dataset/1');
    });

    it('should add a path section when the record form is submitted', () => {
      fillProgressForm('1');
      cy.location('pathname').should('equal', '/dataset/1');
      cy.location('search').should('have.length', 0);
      fillRecordForm('2');
      cy.location('search').should('equal', '?recordId=2');
    });

    it('should remove a path section when the user clicks the track-dataset link', () => {
      cy.visit('/dataset/1?recordId=2');
      cy.location('pathname').should('equal', '/dataset/1');
      clickFormLink(selectorLinkProgressForm);
      cy.location('pathname').should('equal', '/dataset/1');
      cy.location('search').should('have.length', 0);
    });

    it('should add and remove path sections when the user clicks the orbs', () => {
      cy.visit('/dataset/1?recordId=2');

      cy.get(selectorProgressOrb)
        .filter(':visible')
        .should('have.length', 0);

      clickFormLink(selectorLinkProgressForm);

      cy.get(selectorProgressOrb)
        .filter(':visible')
        .should('have.length.gt', 0);

      cy.location('pathname').should('equal', '/dataset/1');
      cy.location('search').should('have.length', 0);

      cy.get(selectorReportOrb).click(force);

      cy.location('pathname').should('equal', '/dataset/1');
      cy.location('search').should('equal', '?recordId=2');

      cy.get(selectorProgressOrb).click(force);
      cy.location('pathname').should('equal', '/dataset/1');
      cy.location('search').should('have.length', 0);

      // expose dataset form orbs
      clickFormLink(selectorLinkDatasetForm);
      cy.location('pathname').should('equal', '/new');
      cy.location('search').should('have.length', 0);

      cy.get(selectorUploadOrb)
        .scrollIntoView()
        .filter(':visible')
        .should('have.length.gt', 0);

      cy.get(selectorProgressOrb)
        .scrollIntoView()
        .filter(':visible')
        .click(force);

      cy.location('pathname').should('equal', '/dataset/1');
      cy.location('search').should('have.length', 0);

      cy.get(selectorReportOrb).click(force);
      cy.location('pathname').should('equal', '/dataset/1');
      cy.location('search').should('equal', '?recordId=2');

      cy.get(selectorUploadOrb).should('have.length', 1);
      cy.get(selectorUploadOrb).click(force);

      cy.location('pathname').should('equal', '/new');
      cy.location('search').should('have.length', 0);
    });

    it('should remember the history', () => {
      const lastRecordId = 'the-end';
      const originalRecordId = 'original';
      const otherRecordId = 'secondary';
      const selHomeLogo = '.logo';
      const txtGetStarted = 'GET STARTED';

      // create history ['/dataset/1?recordId=original', '/dataset/1?recordId=secondary']

      cy.visit(`/dataset/1?recordId=${originalRecordId}`);
      cy.get(selectorInputRecordId).should('have.value', originalRecordId);

      fillRecordForm(otherRecordId);
      cy.get(selectorInputRecordId).should('have.value', otherRecordId);

      // go back twice

      cy.go('back');
      cy.get(selectorInputRecordId).should('have.value', originalRecordId);

      cy.go('back');
      cy.location('search').should('equal', '');

      // create new history ['?recordId=the', '?recordId=correct', '?recordId=order']

      const recordIds = ['the', 'correct', 'order'];

      // utility to check ids ['the', 'correct', 'order'] appear in history sequence

      const checkInitialHistorySequence = (): void => {
        cy.get(selectorInputRecordId).should('have.value', '');
        recordIds.forEach((rId: string) => {
          cy.go('forward');
          cy.location('search').should('equal', `?recordId=${rId}`);
          cy.get(selectorInputRecordId).should('have.value', rId);
        });
        cy.get(selectorInputRecordId).should('have.value', 'order');
      };

      fillProgressForm('1');

      recordIds.forEach((rId: string) => {
        fillRecordForm(rId);
        cy.location('search').should('equal', `?recordId=${rId}`);
      });

      // append to new history [/dataset/2'] and go back through it

      cy.visit('/dataset/2');
      recordIds
        .slice()
        .reverse()
        .forEach((rId: string) => {
          cy.go('back');
          cy.location('search').should('equal', `?recordId=${rId}`);
          cy.get(selectorInputRecordId).should('have.value', rId);
        });

      cy.location('search').should('equal', '?recordId=the');
      cy.get(selectorInputRecordId).should('have.value', 'the');

      // go back again to absolute start

      cy.go('back');
      cy.location('search').should('equal', '');

      // check initial history

      checkInitialHistorySequence();

      // append to history 'new'...

      cy.get(selectorLinkDatasetForm)
        .scrollIntoView()
        .should('be.visible')
        .click(force);

      // ...and arrive at the 'new' page

      cy.location('pathname').should('equal', '/new');
      cy.get(selectorInputRecordId).should('not.exist');

      // go back to the last record id ('order')

      cy.go('back');
      cy.get(selectorInputRecordId).should('have.value', recordIds[2]);
      cy.get(selectorInputRecordId).should('have.value', 'order');

      // go forward to the 'new' page

      cy.go('forward');
      cy.location('pathname').should('equal', '/new');
      cy.get(selectorInputRecordId).should('not.exist');

      // go back to the last record id ('order')

      cy.go('back');
      cy.get(selectorInputRecordId).should('have.value', recordIds[2]);
      cy.get(selectorInputRecordId).should('have.value', 'order');

      // go home - (overwrite the 'new' page branch of history)

      cy.get(selHomeLogo).click();
      cy.location('pathname').should('equal', '/');

      // clicking "get started..." return us to exisitng data!

      cy.contains(txtGetStarted).click();
      cy.location('pathname').should('equal', '/dataset/1');

      // go back home and reload the page

      cy.go('back');
      cy.location('pathname').should('equal', '/');
      cy.reload();

      // add additional history ['/dataset', '/dataset/321', '/dataset/321?recordId=the-end']
      // note that clicking "get started" after the home reload has cleaned the forms

      cy.contains(txtGetStarted).click();
      cy.location('pathname').should('equal', '/dataset');

      // add final dataset and record

      fillProgressForm('321');
      cy.location('pathname').should('equal', '/dataset/321');
      fillRecordForm(lastRecordId);
      cy.location('search').should('equal', `?recordId=${lastRecordId}`);

      // go to the absolute beginning and re-check initial history

      cy.go(-7);
      checkInitialHistorySequence();

      // check final history

      cy.go('forward');
      cy.location('pathname').should('equal', '/');
      cy.location('search').should('have.length', 0);

      cy.go('forward');
      cy.location('pathname').should('equal', '/dataset');
      cy.location('search').should('have.length', 0);

      cy.go('forward');
      cy.location('pathname').should('equal', '/dataset/321');
      cy.location('search').should('have.length', 0);
      cy.get(selectorInputRecordId).should('have.value', '');

      cy.go('forward');
      cy.location('pathname').should('equal', '/dataset/321');
      cy.location('search').should('equal', `?recordId=${lastRecordId}`);
      cy.get(selectorInputRecordId).should('have.value', lastRecordId);
    });
  });
});
