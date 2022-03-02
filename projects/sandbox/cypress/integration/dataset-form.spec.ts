import { fillUploadForm, uploadFile } from '../support/helpers';
import {
  selectorBtnSubmitData,
  selectorErrors,
  selectorInputCountry,
  selectorInputDatasetId,
  selectorInputLanguage,
  selectorInputName,
  selectorInputZipFile,
  selectorLinkDatasetForm,
  selectorProgressTitle
} from '../support/selectors';

context('Sandbox', () => {
  const classActive = 'is-active';
  const classSet = 'is-set';
  const force = { force: true };

  const setStep = (step: number): void => {
    cy.get(`.wizard-status li:nth-child(${step}) a`).click();
    cy.get(`.wizard-status li:nth-child(${step}) a`).should('have.class', classActive);
    cy.get(`.wizard-status li:nth-child(${step}) a`).should('not.have.class', classSet);
  };

  describe('Dataset Form', () => {
    let currentStep = 1;

    const selectorFieldErrors = '.field-errors';
    const selectorInputXSLFile = '[type="file"][accept=".xsl"]';
    const selectorSendXSLT = '[formControlName="sendXSLT"]';
    const testDatasetName = 'Test_dataset_1';

    beforeEach(() => {
      cy.server();
      cy.visit('/');
      cy.get(selectorLinkDatasetForm).should('have.length', 1);
      cy.get(selectorInputName).should('not.be.visible');

      cy.get(selectorLinkDatasetForm).click();
      cy.get(selectorLinkDatasetForm).should('have.length', 0);
      cy.get(selectorInputName).should('be.visible');
    });

    const navigateSteps = (fnFwd: () => void, fnBack: () => void): void => {
      // Forwards
      cy.get(selectorInputName).should('be.visible');
      cy.get(selectorInputCountry).should('be.visible');
      cy.get(selectorInputLanguage).should('be.visible');
      cy.get(selectorInputZipFile).should('be.visible');

      fnFwd();
      cy.get(selectorInputName).should('not.be.visible');
      cy.get(selectorInputCountry).should('not.be.visible');
      cy.get(selectorInputLanguage).should('not.be.visible');
      cy.get(selectorInputZipFile).should('not.be.visible');

      fnBack();
      cy.get(selectorInputName).should('be.visible');
      cy.get(selectorInputCountry).should('be.visible');
      cy.get(selectorInputLanguage).should('be.visible');
      cy.get(selectorInputZipFile).should('be.visible');
    };

    it('should navigate the steps with the orbs', () => {
      currentStep = 1;
      navigateSteps(
        () => {
          currentStep++;
          cy.get(`.wizard-status li:nth-child(${currentStep}) a`).click();
        },
        () => {
          currentStep--;
          cy.get(`.wizard-status li:nth-child(${currentStep}) a`).click();
        }
      );
    });

    it('should flag when a step is complete', () => {
      cy.get('.wizard-status li:nth-child(1) a').should('not.have.class', classSet);
      cy.get(selectorInputName).type(testDatasetName);
      cy.get(selectorInputCountry).select('Greece');
      cy.get(selectorInputLanguage).select('Greek');
      uploadFile('Test_Sandbox.zip', 'zip', selectorInputZipFile);
      cy.get(selectorInputZipFile).trigger('change', force);
      cy.get('.wizard-status li:nth-child(1) a').should('have.class', classSet);

      setStep(2);
      cy.get('.wizard-status li:nth-child(2) a').should('not.have.class', classSet);
      cy.get(selectorInputDatasetId).type('1');
      cy.get('.wizard-status li:nth-child(2) a').should('have.class', classSet);
    });

    it('should flag when a step is invalid', () => {
      setStep(2);
      cy.get(selectorFieldErrors).should('have.length', 0);

      cy.get(selectorInputDatasetId).type('1');
      cy.get(selectorFieldErrors).should('have.length', 0);

      setStep(1);
      cy.get(selectorInputName).type(' ');
      cy.get(selectorFieldErrors)
        .filter(':visible')
        .should('have.length', 1);
    });

    it('should conditionally enable the XSLT field', () => {
      cy.get(selectorInputXSLFile).should('have.length', 1);
      cy.get(selectorInputXSLFile).should('not.be.visible');
      cy.get(selectorSendXSLT).click();
      cy.get(selectorInputXSLFile).should('be.visible');
    });

    it('should track the progress on submit', () => {
      cy.get(selectorProgressTitle).should('have.length', 0);
      fillUploadForm(testDatasetName);
      cy.get(selectorBtnSubmitData).click();
      cy.get(selectorProgressTitle).should('have.length', 1);
      cy.get(selectorErrors).should('have.length', 0);
    });

    it('should update the page url on submit', () => {
      cy.location('pathname').should('not.match', /\d/);
      fillUploadForm(testDatasetName);
      cy.get(selectorBtnSubmitData).click();
      cy.location('pathname').should('match', /\d/);
    });

    it('should allow full navigation of both forms after submit', () => {
      // submit a dataset
      fillUploadForm(testDatasetName);
      cy.get(selectorBtnSubmitData).click();

      // confirm the redirect
      cy.url().should('match', /\d+\/\S+\d+/);

      // confirm the form is navigable
      cy.get(`.wizard-status li:first-child() a`).click();

      navigateSteps(
        () => {
          currentStep++;
          cy.get(`.wizard-status li:nth-child(${currentStep}) a`).click();
        },
        () => {
          currentStep--;
          cy.get(`.wizard-status li:nth-child(${currentStep}) a`).click();
        }
      );
    });

    it('should re-enable the disabled form after submit', () => {
      // submit a dataset
      fillUploadForm(testDatasetName);
      cy.get(selectorBtnSubmitData).click();

      // confirm the redirect
      cy.url().should('match', /\d+\/\S+\/\d+/);

      // confirm the form is disabled
      cy.get(`.wizard-status li:first-child a`).should('have.length', 1);

      cy.get(`.wizard-status li:first-child a`).click();
      cy.get(selectorInputName).should('be.disabled');
      cy.get(`.wizard-status li:nth-child(2) a`).click();
      cy.get(selectorInputCountry).should('be.disabled');
      cy.get(selectorInputLanguage).should('be.disabled');
      cy.get(`.wizard-status li:nth-child(1) a`).click();
      cy.get(selectorInputZipFile).should('be.disabled');
      cy.get(`.wizard-status li:nth-child(2) a`).click();

      // create a new dataset

      // we cant use "force" after a redirect: cypress error (reading 'parent') so scroll down
      cy.get(selectorLinkDatasetForm)
        .scrollIntoView()
        .should('be.visible');
      cy.wait(500);
      cy.get(selectorLinkDatasetForm).click();

      // confirm the form is not disabled

      cy.get(selectorInputName).should('not.be.disabled');
      cy.get(selectorInputCountry).should('not.be.disabled');
      cy.get(selectorInputLanguage).should('not.be.disabled');
      cy.get(selectorInputZipFile).should('not.be.disabled');
    });
  });
});
