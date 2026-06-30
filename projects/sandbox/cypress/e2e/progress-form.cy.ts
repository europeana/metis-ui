import { fillProgressForm, fillUploadForm, login } from '../support/helpers';
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

    const selectorProgressTitleTick = `${selectorProgressTitle} .tick`;
    const selectorProgressTitleCross = `${selectorProgressTitle} .cross`;
    const selReachedDataLimit = '[data-e2e="warn-limit-reached"]';

    const elRoot = '.sandbox-navigation-content';
    const selectorWarnPresent = `${elRoot} .orb-status.labelled.warn`;
    const selectorFailPresent = `${elRoot} .orb-status.labelled.fail`;
    const selectorSuccessPresent = `${elRoot} .orb-status.labelled.success`;

    const selectorErrorLink = '[data-e2e="open-error-detail"]';
    const selectorModalDisplay = '.modal';
    const selectorModalDisplayError = `${selectorModalDisplay} .modal-summary.error-icon`;
    const selectorModalDisplayWarning = `${selectorModalDisplay} .modal-summary.warning-icon`;

    const selPortalLinks = '.hide-mobile .portal-links';
    const selCountryLang = '[data-e2e="country-language"]';
    const selCreationDate = '[data-e2e="creation-date"]';

    const totalNumberOfSteps = 9;

    const datasetIdSuccess = '100';
    const urlDatasetSuccess = `/dataset/${datasetIdSuccess}`;

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

      fillProgressForm(datasetIdSuccess);

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

      cy.visit(urlDatasetSuccess);

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
        .click();
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
      fillProgressForm(datasetIdSuccess);
      cy.get(selectorSuccessPresent).should('have.length', totalNumberOfSteps);
      cy.get(selectorFailPresent).should('not.exist');
    });

    it('should show the progress warn', () => {
      fillProgressForm(datasetIdSuccess);
      cy.get(selectorWarnPresent).should('not.exist');
      fillProgressForm('110');
      cy.get(selectorWarnPresent).should('have.length', 1);
    });

    it('should show the progress fail', () => {
      cy.visit(urlDatasetSuccess);
      cy.get(selectorFailPresent).should('not.exist');
      cy.get(selectorInputDatasetId)
        .eq(0)
        .clear()
        .type('101')
        .trigger('input');
      cy.get(selectorBtnSubmitProgress)
        .should('not.be.disabled')
        .click();
      cy.get('.title-id')
        .contains('101')
        .should('exist');
      cy.get(selectorFailPresent).should('have.length', 1);
    });

    it('should show the progress errors (as warning)', () => {
      const selectorWarningOnly = '.flag.warning-only';
      cy.get(selectorWarningOnly).should('not.exist');
      fillProgressForm('1201');
      cy.get(selectorWarningOnly).should('have.length', 1);
      cy.get(selectorErrorLink).should('have.length', 1);
    });

    it('should show the progress errors', () => {
      fillProgressForm(datasetIdSuccess);
      cy.get(selectorErrorLink).should('not.exist');
      cy.get(selectorModalDisplay).should('not.exist');

      fillProgressForm('1018');

      // wait for load to complete
      cy.get('.orb-status.pending.publish').should('exist');

      cy.get(selectorErrorLink).should('have.length', 1);
      cy.get(selectorErrorLink).click();
      cy.get(selectorModalDisplay).should('have.length', 1);
      cy.get(selectorModalDisplay).should('be.visible');
    });

    it('should pluralise error labels', () => {
      const selErrorLabel = '.glass.clickable';
      const msgErrorSingle = 'view detail of';
      const msgErrorPlural = 'view details of';

      fillProgressForm('105');

      cy.get(selectorErrorLink).should('be.visible');

      cy.get(selErrorLabel)
        .should('have.attr', 'title')
        .and('match', new RegExp(msgErrorSingle));
      cy.get(selErrorLabel)
        .should('have.attr', 'title')
        .and('not.match', new RegExp(msgErrorPlural));

      // clear and manually type to reset the validation tree before switching datasets
      cy.get(selectorInputDatasetId)
        .eq(0)
        .clear();
      cy.get(selectorInputDatasetId)
        .eq(0)
        .type('2025')
        .trigger('input');

      cy.get(selectorBtnSubmitProgress)
        .should('not.be.disabled')
        .click();

      cy.get('.title-id')
        .contains('2025')
        .should('exist');
      cy.get('.open-error-detail-label').should('exist');

      cy.get(selErrorLabel)
        .should('have.attr', 'title')
        .and('match', new RegExp(msgErrorPlural));
      cy.get(selErrorLabel)
        .should('have.attr', 'title')
        .and('not.match', new RegExp(msgErrorSingle));
    });

    it('should show the data-limit reached warning', () => {
      login();
      cy.get(selectorLinkDatasetForm).click();
      cy.get(selReachedDataLimit).should('not.exist');
      fillUploadForm('Name_At_Least_Ten_Characters');
      cy.get(selectorBtnSubmitData).click();
      cy.get(selReachedDataLimit).should('have.length', 1);
    });

    it('should expand and collapse the data warning', () => {
      const selWarnDetail = '.warn-detail';
      login();
      cy.get(selectorLinkDatasetForm).click();
      fillUploadForm('Name_At_Least_Ten_Characters');
      cy.get(selectorBtnSubmitData).click();
      cy.get(selReachedDataLimit).should('have.length', 1);
      cy.get(selWarnDetail).should('not.exist');
      cy.get(`${selReachedDataLimit} a`).click();
      cy.get(selWarnDetail).should('have.length', 1);
      cy.get(`${selReachedDataLimit} a`).click();
      cy.get(selWarnDetail).should('not.exist');

      cy.get(selCreationDate).should('have.class', 'warning-icon');
      cy.get(selCreationDate)
        .find('a')
        .click();
      cy.get(selectorModalDisplay).should('have.length', 1);
      cy.get(selectorModalDisplayWarning).should('have.length', 1);
      cy.get(selectorModalDisplayError).should('not.exist');
    });

    it('should show a modal dialog for dataset errors', () => {
      fillProgressForm('201');

      // update the class name target to match what the component actually renders!
      cy.get('[data-e2e="creation-date"]').should('have.class', 'warning-icon');

      // trigger the click event pass to launch the overlay layout container
      cy.get('[data-e2e="creation-date"]').click();

      // verify that the modal window mounts over the UI workspace
      cy.get('.modal .head')
        .contains('Dataset Issues Detected')
        .should('be.visible');
    });
  });
});
