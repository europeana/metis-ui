import {
  selectorBtnSubmitDatasetProblems,
  selectorBtnSubmitProgress,
  selectorBtnSubmitRecord,
  selectorBtnSubmitRecordProblems,
  selectorInputCountry,
  selectorInputDatasetId,
  selectorInputLanguage,
  selectorInputName,
  selectorInputRecordId,
  selectorInputZipFile
} from '../support/selectors';

const noScrollCheck = { ensureScrollable: false };
const force = { force: true };

export const getSelectorPublishedUrl = (datasetId: string, recordId: string): string => {
  return `[href="http://localhost:3000/dataset/${datasetId}/record?recordId=${recordId}-eu"]`;
};

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
        cy.wrap(subject).trigger('change', force);
        console.log(el.files);
      });
  });
};

export const fillUploadForm = (testDatasetName: string): void => {
  cy.get(selectorInputName).type(testDatasetName, { scrollBehavior: false });
  cy.get(selectorInputCountry).scrollIntoView();
  cy.get(selectorInputCountry).select('Greece', force);
  cy.get(selectorInputLanguage).select('Greek', force);
  uploadFile('Test_Sandbox.zip', 'zip', selectorInputZipFile);
};

export const fillProgressForm = (id: string, problems = false): void => {
  cy.get(selectorInputDatasetId)
    .clear(force)
    .type(id);
  if (problems) {
    cy.get(selectorBtnSubmitDatasetProblems).click(force);
  } else {
    cy.get(selectorBtnSubmitProgress).click(force);
  }
};

export const fillRecordForm = (id: string, problems = false): void => {
  cy.scrollTo('bottom', noScrollCheck);
  cy.wait(500);
  cy.get(selectorInputRecordId)
    .should('be.visible')
    .clear(force)
    .type(id);
  if (problems) {
    cy.get(selectorBtnSubmitRecordProblems).click(force);
  } else {
    cy.get(selectorBtnSubmitRecord).click(force);
  }
};
