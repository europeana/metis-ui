import { fillUploadForm } from '../support/helpers';
import {
  selectorBtnSubmitData,
  selectorErrors,
  selectorInputCountry,
  selectorInputDatasetId,
  selectorInputLanguage,
  selectorInputName,
  selectorInputZipFile,
  selectorLinkDatasetForm,
  selectorProgressOrb,
  selectorProgressTitle,
  selectorUploadOrb
} from '../support/selectors';

context('Sandbox', () => {
  const classActive = 'is-active';

  const setStep = (step: number): void => {
    cy.get(`.wizard-status li:nth-child(${step}) a`).click({ force: true });
    cy.get(`.wizard-status li:nth-child(${step}) a`).should('have.class', classActive);
  };

  describe('Dataset Form', () => {
    let currentStep = 1;
    const force = { force: true };
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
          cy.get(`.wizard-status li:nth-child(${currentStep}) a`).click(force);
        },
        () => {
          currentStep--;
          cy.get(`.wizard-status li:nth-child(${currentStep}) a`).click(force);
        }
      );
    });

    it('should flag when a step is invalid', () => {
      setStep(2);
      cy.get(selectorFieldErrors).should('have.length', 0);

      cy.get(selectorInputDatasetId).type('1');
      cy.get(selectorFieldErrors).should('have.length', 0);

      setStep(1);
      cy.get(selectorInputName).type(' ', { scrollBehavior: false });
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
      cy.get(`.wizard-status li:first-child() a`).click(force);

      navigateSteps(
        () => {
          currentStep++;
          cy.get(`.wizard-status li:nth-child(${currentStep}) a`).click(force);
        },
        () => {
          currentStep--;
          cy.get(`.wizard-status li:nth-child(${currentStep}) a`).click(force);
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

      cy.get(selectorUploadOrb).should('have.length', 1);
      cy.get(selectorUploadOrb)
        .scrollIntoView()
        .click(force);
      cy.get(selectorInputName).should('be.disabled');
      cy.get(selectorProgressOrb).click(force);
      cy.get(selectorInputCountry).should('be.disabled');
      cy.get(selectorInputLanguage).should('be.disabled');
      cy.get(selectorUploadOrb).click(force);
      cy.get(selectorInputZipFile).should('be.disabled');
      cy.get(selectorProgressOrb).click(force);

      // create a new dataset

      cy.get(selectorLinkDatasetForm)
        .scrollIntoView()
        .click(force);

      // confirm the form is not disabled

      cy.get(selectorInputName).should('not.be.disabled');
      cy.get(selectorInputCountry).should('not.be.disabled');
      cy.get(selectorInputLanguage).should('not.be.disabled');
      cy.get(selectorInputZipFile).should('not.be.disabled');
    });
  });
});
