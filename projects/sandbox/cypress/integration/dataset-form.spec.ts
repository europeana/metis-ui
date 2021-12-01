import { fillUploadForm, uploadFile } from '../support/helpers';
import {
  selectorBtnNext,
  selectorBtnSubmitData,
  selectorErrors,
  selectorInputCountry,
  selectorInputLanguage,
  selectorInputName,
  selectorInputTrackId,
  selectorInputZipFile,
  selectorLinkDatasetForm,
  selectorProgressTitle
} from '../support/selectors';

context('Sandbox', () => {
  const classActive = 'is-active';
  const classSet = 'is-set';

  const setStep = (step: number): void => {
    cy.get(`.wizard-status li:nth-child(${step}) a`).click();
    cy.get(`.wizard-status li:nth-child(${step}) a`).should('have.class', classActive);
    cy.get(`.wizard-status li:nth-child(${step}) a`).should('not.have.class', classSet);
  };

  describe('Dataset Form', () => {
    let currentStep = 1;

    const selectorBtnPrevious = '.previous';
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

    const navigateSteps = (
      fnFwd: () => void,
      fnBack: () => void,
      includeProgress = false
    ): void => {
      // Forwards
      cy.get(selectorBtnPrevious).should('not.be.visible');
      cy.get(selectorBtnNext).should('be.visible');
      cy.get(selectorInputName).should('be.visible');
      cy.get(selectorInputCountry).should('not.be.visible');
      cy.get(selectorInputLanguage).should('not.be.visible');

      fnFwd();

      cy.get(selectorBtnPrevious).should('be.visible');
      cy.get(selectorInputName).should('not.be.visible');
      cy.get(selectorInputCountry).should('be.visible');
      cy.get(selectorInputLanguage).should('be.visible');

      fnFwd();

      const notPrefixNext = includeProgress ? '' : 'not.';
      cy.get(selectorBtnNext).should(`${notPrefixNext}be.visible`);
      cy.get(selectorInputCountry).should('not.be.visible');
      cy.get(selectorInputLanguage).should('not.be.visible');
      cy.get(selectorInputZipFile).should('be.visible');

      if (includeProgress) {
        fnFwd();

        cy.get(selectorInputZipFile).should('not.be.visible');
        cy.get(selectorBtnNext).should('not.be.visible');

        // Backwards

        fnBack();

        cy.get(selectorBtnNext).should('be.visible');
        cy.get(selectorInputZipFile).should('be.visible');
      }

      fnBack();

      cy.get(selectorInputZipFile).should('not.be.visible');
      cy.get(selectorInputCountry).should('be.visible');
      cy.get(selectorInputLanguage).should('be.visible');

      fnBack();

      cy.get(selectorInputCountry).should('not.be.visible');
      cy.get(selectorInputLanguage).should('not.be.visible');
      cy.get(selectorBtnPrevious).should('not.be.visible');
      cy.get(selectorInputName).should('be.visible');
    };

    it('should navigate the steps with the buttons', () => {
      navigateSteps(
        () => {
          cy.get(selectorBtnNext).click();
        },
        () => {
          cy.get(selectorBtnPrevious).click();
        }
      );
    });

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
      cy.get(selectorInputName).type(testDatasetName);
      cy.get('.wizard-status li:nth-child(1) a').should('have.class', classSet);

      setStep(2);

      cy.get(selectorInputCountry).select('Greece');
      cy.get(selectorInputLanguage).select('Greek');
      cy.get('.wizard-status li:nth-child(2) a').should('have.class', classSet);

      setStep(3);

      uploadFile('Test_Sandbox.zip', 'zip', selectorInputZipFile);
      cy.get(selectorInputZipFile).trigger('change', { force: true });
      cy.get('.wizard-status li:nth-child(3) a').should('have.class', classSet);

      setStep(4);
      cy.get(selectorInputTrackId).type('1');
      cy.get('.wizard-status li:nth-child(4) a').should('have.class', classSet);
    });

    it('should flag when a step is invalid', () => {
      setStep(4);
      cy.get(selectorFieldErrors).should('have.length', 1);
      cy.get(selectorInputTrackId).type('1');
      cy.get(selectorFieldErrors).should('have.length', 0);
      setStep(1);
      cy.get(selectorInputName).type(' ');
      cy.get(selectorFieldErrors).should('have.length', 1);
    });

    it('should conditionally enable the XSLT field', () => {
      setStep(3);
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

    it('should allow full navigation of both forms after submit', () => {
      fillUploadForm(testDatasetName);
      cy.get(selectorBtnSubmitData).click();
      cy.get(`.wizard-status li:nth-child(1) a`).click();
      navigateSteps(
        () => {
          cy.get(selectorBtnNext).click();
        },
        () => {
          cy.get(selectorBtnPrevious).click({ force: true });
        },
        true
      );
    });

    it('should re-enable the disabled form after submit', () => {
      fillUploadForm(testDatasetName);
      cy.get(selectorBtnSubmitData).click();
      cy.get(`.wizard-status li:first-child a`).click();
      cy.get(selectorInputName).should('be.disabled');
      cy.get(`.wizard-status li:nth-child(2) a`).click();
      cy.get(selectorInputCountry).should('be.disabled');
      cy.get(selectorInputLanguage).should('be.disabled');
      cy.get(`.wizard-status li:nth-child(3) a`).click();
      cy.get(selectorInputZipFile).should('be.disabled');
      cy.get(`.wizard-status li:nth-child(4) a`).click();
      cy.get(selectorLinkDatasetForm).click({ force: true });
      cy.get(selectorInputName).should('not.be.disabled');
      cy.get(`.wizard-status li:nth-child(2) a`).click();
      cy.get(selectorInputCountry).should('not.be.disabled');
      cy.get(selectorInputLanguage).should('not.be.disabled');
      cy.get(`.wizard-status li:nth-child(3) a`).click();
      cy.get(selectorInputZipFile).should('not.be.disabled');
    });
  });
});
