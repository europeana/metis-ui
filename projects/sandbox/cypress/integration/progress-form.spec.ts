import { fillUploadForm } from '../support/helpers';
import {
  selectorBtnSubmitData,
  selectorErrors,
  selectorInputTrackId,
  selectorLinkDatasetForm,
  selectorProgressTitle
} from '../support/selectors';

context('Sandbox', () => {
  describe('Progress Form', () => {
    beforeEach(() => {
      cy.server();
      cy.visit('/');
    });

    const selectorSubmit = '[data-e2e="submitProgress"]';
    const selectorProgressTitleComplete = selectorProgressTitle + '.complete';
    const selReachedDataLimit = '[data-e2e="warn-limit-reached"]';
    const selectorWarnPresent = '.orb-status.labelled.warn';
    const selectorFailPresent = '.orb-status.labelled.fail';
    const selectorSuccessPresent = '.orb-status.labelled.success';

    const selectorErrorLink = '.open-error-detail';
    const selectorModalDisplay = '.modal';

    const selPortalLinks = '.portal-links';
    const selCountryLang = '[data-e2e="country-language"]';
    const selCreationDate = '[data-e2e="creation-date"]';

    it('should show the input and submit button', () => {
      cy.get(selectorInputTrackId).should('have.length', 1);
      cy.get(selectorSubmit).should('have.length', 1);
      cy.get(selectorSubmit).should('be.disabled');
    });

    it('should show the complete progress on submit', () => {
      cy.get(selectorProgressTitle).should('have.length', 0);
      cy.get(selectorProgressTitleComplete).should('have.length', 0);
      cy.get(selCountryLang).should('have.length', 0);
      cy.get(selCreationDate).should('have.length', 0);
      cy.get(selPortalLinks).should('have.length', 0);
      cy.get(selectorInputTrackId)
        .clear()
        .type('1');
      cy.get(selectorSubmit).click();
      cy.get(selectorProgressTitle).should('have.length', 1);
      cy.get(selectorProgressTitleComplete).should('have.length', 1);
      cy.get(selCountryLang).should('have.length', 1);
      cy.get(selCreationDate).should('have.length', 1);
      cy.get(selPortalLinks).should('have.length', 1);
    });

    it('should show the complete progress on navigation', () => {
      cy.get(selectorProgressTitle).should('have.length', 0);
      cy.get(selectorProgressTitleComplete).should('have.length', 0);
      cy.get(selCountryLang).should('have.length', 0);
      cy.get(selCreationDate).should('have.length', 0);
      cy.get(selPortalLinks).should('have.length', 0);

      cy.visit('/1');

      cy.get(selectorProgressTitle).should('have.length', 1);
      cy.get(selectorProgressTitleComplete).should('have.length', 1);
      cy.get(selCountryLang).should('have.length', 1);
      cy.get(selCreationDate).should('have.length', 1);
      cy.get(selPortalLinks).should('have.length', 1);
    });

    it('should show network errors', () => {
      cy.get(selectorErrors).should('have.length', 0);
      cy.get(selectorInputTrackId)
        .clear()
        .type('404');
      cy.get(selectorSubmit).click();
      cy.get(selectorSubmit).should('have.length', 1);
      cy.get(selectorInputTrackId)
        .clear()
        .type('500');
      cy.get(selectorErrors).should('have.length', 0);
      cy.get(selectorSubmit).click();
      cy.get(selectorErrors).should('have.length', 1);
    });

    it('should show the progress success', () => {
      cy.get(selectorSuccessPresent).should('have.length', 0);
      cy.get(selectorInputTrackId)
        .clear()
        .type('100');
      cy.get(selectorSubmit).click();
      cy.get(selectorSuccessPresent).should('have.length', 9);
    });

    it('should show the progress warn', () => {
      cy.get(selectorWarnPresent).should('have.length', 0);
      cy.get(selectorInputTrackId)
        .clear()
        .type('910');
      cy.get(selectorSubmit).click();
      cy.get(selectorWarnPresent).should('have.length', 9);
    });

    it('should show the progress fail', () => {
      cy.get(selectorFailPresent).should('have.length', 0);
      cy.get(selectorInputTrackId)
        .clear()
        .type('101');
      cy.get(selectorSubmit).click();
      cy.get(selectorFailPresent).should('have.length', 9);
    });

    it('should show the progress errors', () => {
      cy.get(selectorErrorLink).should('have.length', 0);
      cy.get(selectorModalDisplay).should('not.be.visible');
      cy.get(selectorInputTrackId)
        .clear()
        .type('10118');
      cy.get(selectorSubmit).click();
      cy.get(selectorErrorLink).should('have.length', 1);
      cy.get(selectorErrorLink).click();
      cy.get(selectorModalDisplay).should('be.visible');
    });

    it('should show the input and submit button', () => {
      cy.get(selectorLinkDatasetForm).click();
      cy.get(selReachedDataLimit).should('have.length', 0);
      fillUploadForm('Name_At_Least_Ten_Characters');
      cy.get(selectorBtnSubmitData).click();
      cy.get(selReachedDataLimit).should('have.length', 1);
    });
  });
});
