import { fillProgressForm, fillUploadForm } from '../support/helpers';
import {
  selectorBtnSubmitData,
  selectorBtnSubmitProgress,
  selectorErrors,
  selectorInputDatasetId,
  selectorLinkDatasetForm,
  selectorProgressTitle
} from '../support/selectors';

context('Sandbox', () => {
  describe('Progress Form', () => {
    beforeEach(() => {
      cy.server();
      cy.visit('/');
    });

    const selectorProgressTitleComplete = selectorProgressTitle + ' .tick';
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
      cy.get(selectorInputDatasetId).should('have.length', 1);
      cy.get(selectorBtnSubmitProgress).should('have.length', 1);
      cy.get(selectorBtnSubmitProgress).should('be.disabled');
    });

    it('should show the complete progress on submit', () => {
      cy.get(selectorProgressTitle).should('have.length', 0);
      cy.get(selectorProgressTitleComplete).should('have.length', 0);
      cy.get(selCountryLang).should('have.length', 0);
      cy.get(selCreationDate).should('have.length', 0);
      cy.get(selPortalLinks).should('have.length', 0);

      fillProgressForm('1');

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
      cy.get(selectorErrors)
        .filter(':visible')
        .should('have.length', 0);
      fillProgressForm('404');
      cy.get(selectorBtnSubmitProgress)
        .filter(':visible')
        .should('have.length', 1);
      cy.get(selectorInputDatasetId).clear();
      cy.get(selectorErrors)
        .filter(':visible')
        .should('have.length', 0);
      fillProgressForm('500');
      cy.get(selectorErrors)
        .filter(':visible')
        .should('have.length', 1);
    });

    it('should show the progress success', () => {
      cy.get(selectorSuccessPresent).should('have.length', 0);
      fillProgressForm('100');
      cy.get(selectorSuccessPresent).should('have.length', 10);
    });

    it('should show the progress warn', () => {
      cy.get(selectorWarnPresent).should('have.length', 0);
      fillProgressForm('1010');
      cy.get(selectorWarnPresent).should('have.length', 10);
    });

    it('should show the progress fail', () => {
      cy.get(selectorFailPresent).should('have.length', 0);
      fillProgressForm('101');
      cy.get(selectorFailPresent).should('have.length', 10);
    });

    it('should show the progress errors', () => {
      cy.get(selectorErrorLink).should('have.length', 0);
      cy.get(selectorModalDisplay).should('not.be.visible');
      fillProgressForm('10118');
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

    it('should expand and collapse the data warning', () => {
      const selWarnDetail = '.warn-detail';
      cy.get(selectorLinkDatasetForm).click();
      fillUploadForm('Name_At_Least_Ten_Characters');
      cy.get(selectorBtnSubmitData).click();
      cy.get(selReachedDataLimit).should('have.length', 1);
      cy.get(selWarnDetail).should('have.length', 0);
      cy.get(`${selReachedDataLimit} a`).click();
      cy.get(selWarnDetail).should('have.length', 1);
      cy.get(`${selReachedDataLimit} a`).click();
      cy.get(selWarnDetail).should('have.length', 0);
    });
  });
});
