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
      cy.visit('/dataset');
    });
    const force = { force: true };

    const selectorProgressTitleTick = `${selectorProgressTitle} .tick`;
    const selectorProgressTitleCross = `${selectorProgressTitle} .cross`;
    const selReachedDataLimit = '[data-e2e="warn-limit-reached"]';
    const selectorWarnPresent = '.orb-status.labelled.warn';
    const selectorFailPresent = '.orb-status.labelled.fail';
    const selectorSuccessPresent = '.orb-status.labelled.success';

    const selectorErrorLink = '.open-error-detail';
    const selectorModalDisplay = '.modal';
    const selectorModalDisplayError = `${selectorModalDisplay} .modal-summary.error-icon`;
    const selectorModalDisplayWarning = `${selectorModalDisplay} .modal-summary.warning-icon`;

    const selPortalLinks = '.hide-mobile .portal-links';
    const selCountryLang = '[data-e2e="country-language"]';
    const selCreationDate = '[data-e2e="creation-date"]';

    const totalNumberOfSteps = 9;
    const msgErrors = 'The following errors were detected in your data:';
    const msgWarningAllErrors = 'Processing has completed but errors occurred on all records.';

    it('should show the input and submit button', () => {
      cy.get(selectorInputDatasetId).should('have.length', 1);
      cy.get(selectorBtnSubmitProgress).should('have.length', 1);
      cy.get(selectorBtnSubmitProgress).should('be.disabled');
    });

    it('should show the complete progress on submit', () => {
      cy.get(selectorProgressTitle).should('not.exist');
      cy.get(selectorProgressTitleTick).should('not.exist');
      cy.get(selCountryLang).should('not.exist');
      cy.get(selCreationDate).should('not.exist');
      cy.get(selPortalLinks).should('not.exist');

      fillProgressForm('100');

      cy.get(selectorProgressTitle).should('have.length', 1);
      cy.get(selectorProgressTitleTick).should('have.length', 1);
      cy.get(selectorProgressTitleCross).should('not.exist');
      cy.get(selCountryLang).should('have.length', 1);
      cy.get(selCreationDate).should('have.length', 1);
      cy.get(selPortalLinks).should('have.length', 1);
    });

    it('should show the complete progress on navigation', () => {
      cy.get(selectorProgressTitle).should('not.exist');
      cy.get(selectorProgressTitleTick).should('not.exist');
      cy.get(selCountryLang).should('not.exist');
      cy.get(selCreationDate).should('not.exist');
      cy.get(selPortalLinks).should('not.exist');

      cy.visit('/dataset/100');

      cy.get(selectorProgressTitle).should('have.length', 1);
      cy.get(selectorProgressTitleTick).should('have.length', 1);
      cy.get(selectorProgressTitleCross).should('not.exist');
      cy.get(selCountryLang).should('have.length', 1);
      cy.get(selCreationDate).should('have.length', 1);
      cy.get(selPortalLinks).should('have.length', 1);
    });

    it('should warn when the preview is unavailable', () => {
      const selectorPreviewUnavailable = '.preview-unavailable a';
      cy.get(selectorPreviewUnavailable).should('not.exist');
      cy.get(selectorModalDisplay).should('not.exist');

      fillProgressForm('13');
      cy.get(selectorPreviewUnavailable)
        .filter(':visible')
        .should('have.length', 1);

      cy.get(selectorPreviewUnavailable)
        .filter(':visible')
        .click(force);
      cy.get(selectorModalDisplay).should('be.visible');
    });

    it('should show network errors', () => {
      cy.get(selectorErrors).should('not.exist');
      fillProgressForm('404');
      cy.get(selectorErrors)
        .filter(':visible')
        .should('have.length', 1);
    });

    it('should show the progress success', () => {
      cy.get(selectorSuccessPresent).should('not.exist');
      fillProgressForm('100');
      cy.get(selectorSuccessPresent).should('have.length', totalNumberOfSteps);
    });

    it('should show the progress warn', () => {
      cy.get(selectorWarnPresent).should('not.exist');
      fillProgressForm('110');
      cy.get(selectorWarnPresent).should('have.length', totalNumberOfSteps);
    });

    it('should show the progress fail', () => {
      cy.get(selectorFailPresent).should('not.exist');
      fillProgressForm('101');
      cy.get(selectorFailPresent).should('have.length', totalNumberOfSteps);
    });

    it('should show the progress errors', () => {
      cy.get(selectorErrorLink).should('not.exist');
      cy.get(selectorModalDisplay).should('not.exist');
      fillProgressForm('10118');
      cy.get(selectorErrorLink).should('have.length', 1);
      cy.get(selectorErrorLink).click(force);
      cy.get(selectorModalDisplay).should('have.length', 1);
      cy.get(selectorModalDisplay).should('be.visible');
    });

    it('should show the data-limit reached', () => {
      cy.get(selectorLinkDatasetForm).click();
      cy.get(selReachedDataLimit).should('not.exist');
      fillUploadForm('Name_At_Least_Ten_Characters');
      cy.get(selectorBtnSubmitData).click();
      cy.get(selReachedDataLimit).should('have.length', 1);
    });

    it('should expand and collapse the data warning', () => {
      const selWarnDetail = '.warn-detail';
      cy.get(selectorLinkDatasetForm).click(force);
      fillUploadForm('Name_At_Least_Ten_Characters');
      cy.get(selectorBtnSubmitData).click(force);
      cy.get(selReachedDataLimit).should('have.length', 1);
      cy.get(selWarnDetail).should('not.exist');
      cy.get(`${selReachedDataLimit} a`).click(force);
      cy.get(selWarnDetail).should('have.length', 1);
      cy.get(`${selReachedDataLimit} a`).click(force);
      cy.get(selWarnDetail).should('not.exist');

      cy.get(selCreationDate).should('have.class', 'warning-icon');
      cy.get(selCreationDate)
        .find('a')
        .click(force);
      cy.get(selectorModalDisplay).should('have.length', 1);
      cy.get(selectorModalDisplayWarning).should('have.length', 1);
      cy.get(selectorModalDisplayError).should('not.exist');
    });

    it('should show a modal dialog for dataset errors', () => {
      fillProgressForm('201');
      cy.get(selCreationDate).should('have.class', 'error-icon');
      cy.get(selCreationDate).should('not.have.class', 'warning-icon');
      cy.get(selectorProgressTitleCross).should('have.length', 1);

      cy.get(selectorModalDisplay).should('not.exist');
      cy.get(`${selCreationDate} a`).click(force);
      cy.get(selectorModalDisplay).should('have.length', 1);
      cy.get(`${selectorModalDisplay} .explanation`)
        .contains(msgErrors)
        .should('have.length', 1);
      cy.get(selectorModalDisplayWarning).should('not.exist');
      cy.get(selectorModalDisplayError).should('have.length', 1);
    });

    it('should show a modal dialog for dataset warnings', () => {
      fillProgressForm('12');
      cy.get(selCreationDate).should('have.class', 'warning-icon');
      cy.get(selCreationDate).should('not.have.class', 'error-icon');
      cy.get(selectorProgressTitleCross).should('exist');

      cy.get(selectorModalDisplay).should('not.exist');
      cy.get(`${selCreationDate} a`).click(force);
      cy.get(selectorModalDisplay).should('have.length', 1);
      cy.get(`${selectorModalDisplay} .explanation`)
        .contains(msgWarningAllErrors)
        .should('have.length', 1);
      cy.get(selectorModalDisplayWarning).should('have.length', 1);
      cy.get(selectorModalDisplayError).should('not.exist');
    });

    it('should show a modal dialog for dataset warnings and errors combined', () => {
      fillProgressForm('213');
      cy.get(selCreationDate).should('have.class', 'error-icon');
      cy.get(selectorModalDisplay).should('not.exist');
      cy.get(`${selCreationDate} a`).click(force);
      cy.get(selectorModalDisplay).should('have.length', 1);
      cy.get(selectorModalDisplayWarning).should('have.length', 2);
      cy.get(selectorModalDisplayError).should('have.length', 1);
      cy.get(`${selectorModalDisplay} .explanation`)
        .contains(msgWarningAllErrors)
        .should('have.length', 1);
      cy.get(`${selectorModalDisplay} .explanation`)
        .contains(msgErrors)
        .should('have.length', 1);
    });
  });
});
