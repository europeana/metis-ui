import {
  selectorBtnNext,
  selectorBtnSubmitProgress,
  selectorBtnSubmitRecord,
  selectorInputCountry,
  selectorInputLanguage,
  selectorInputName,
  selectorInputRecordId,
  selectorInputDatasetId,
  selectorInputZipFile
} from '../support/selectors';

export const uploadFile = (fileName: string, fileType = '', selector: string): void => {
  cy.get(selector).then((subject) => {
    cy.fixture(fileName, 'base64')
      .then(Cypress.Blob.base64StringToBlob)
      .then((blob) => {
        const el = subject[0] as HTMLInputElement;
        const testFile = new File([blob], fileName, { type: fileType });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(testFile);
        el.files = dataTransfer.files;
        cy.wrap(subject).trigger('change', { force: true });
        console.log(el.files);
      });
  });
};

export const fillUploadForm = (testDatasetName: string): void => {
  cy.get(selectorInputName).type(testDatasetName);
  cy.get(selectorBtnNext).click();
  cy.get(selectorInputCountry).select('Greece');
  cy.get(selectorInputLanguage).select('Greek');
  cy.get(selectorBtnNext).click();
  uploadFile('Test_Sandbox.zip', 'zip', selectorInputZipFile);
};

export const fillProgressForm = (id: string): void => {
  cy.get(selectorInputDatasetId)
    .clear()
    .type(id);
  cy.get(selectorBtnSubmitProgress).click();
};

export const fillRecordForm = (id: string): void => {
  cy.scrollTo('bottom');
  cy.wait(500);
  cy.get(selectorInputRecordId)
    .should('be.visible')
    .clear()
    .type(id);
  cy.get(selectorBtnSubmitRecord).click();
};
