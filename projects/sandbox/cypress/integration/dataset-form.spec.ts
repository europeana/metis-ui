context('Sandbox', () => {
  const uploadFile = (fileName: string, fileType = '', selector: string): void => {
    cy.get(selector).then((subject) => {
      cy.fixture(fileName, 'base64')
        .then(Cypress.Blob.base64StringToBlob)
        .then((blob) => {
          const el = subject[0] as HTMLInputElement;
          const testFile = new File([blob], fileName, { type: fileType });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(testFile);
          el.files = dataTransfer.files;
          console.log(el.files);
        });
    });
  };

  describe('Dataset Form', () => {
    let currentStep = 1;

    const selectorInputTrackId = '[data-e2e="idToTrack"]';
    const selectorInputCountry = '#country';
    const selectorInputLanguage = '#language';
    const selectorInputZipFile = '[type="file"]';

    const selectorBtnPrevious = '.previous';
    const selectorBtnNext = '.next';
    const selectorInputName = '#name';

    beforeEach(() => {
      cy.server();
      cy.visit('/');

      const selectorLinkDatasetForm = '[data-e2e="link-dataset-form"]';
      cy.get(selectorLinkDatasetForm).should('have.length', 1);
      cy.get(selectorInputName).should('not.be.visible');

      cy.get(selectorLinkDatasetForm).click();
      cy.get(selectorLinkDatasetForm).should('have.length', 0);
      cy.get(selectorInputName).should('be.visible');
    });

    const navigateSteps = (fnFwd: () => void, fnBack: () => void): void => {
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

      cy.get(selectorInputCountry).should('not.be.visible');
      cy.get(selectorInputLanguage).should('not.be.visible');
      cy.get(selectorInputZipFile).should('be.visible');

      fnFwd();

      cy.get(selectorInputZipFile).should('not.be.visible');
      cy.get(selectorBtnNext).should('not.be.visible');

      // Backwards

      fnBack();

      cy.get(selectorBtnNext).should('be.visible');
      cy.get(selectorInputZipFile).should('be.visible');

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
      const setStep = (step: number): void => {
        cy.get(`.wizard-status li:nth-child(${step}) a`).click();
        cy.get(`.wizard-status li:nth-child(${step}) a`).should('have.class', 'active');
        cy.get(`.wizard-status li:nth-child(${step}) a`).should('not.have.class', 'is-set');
      };

      setStep(1);

      cy.get(selectorInputName).type('Test-dataset');
      cy.get('.wizard-status li:nth-child(1) a').should('have.class', 'is-set');

      setStep(2);

      cy.get(selectorInputCountry).select('Greece');
      cy.get(selectorInputLanguage).select('Greek');
      cy.get('.wizard-status li:nth-child(2) a').should('have.class', 'is-set');

      setStep(3);

      uploadFile('Test_Sandbox.zip', 'zip', selectorInputZipFile);
      cy.get(selectorInputZipFile).trigger('change', { force: true });
      cy.get('.wizard-status li:nth-child(3) a').should('have.class', 'is-set');

      setStep(4);
      cy.get(selectorInputTrackId).type('1');
      cy.get('.wizard-status li:nth-child(4) a').should('have.class', 'is-set');
    });
  });
});
