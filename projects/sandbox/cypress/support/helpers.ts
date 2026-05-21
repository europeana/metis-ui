import {
  selectorBtnSubmitData,
  selectorBtnSubmitDatasetProblems,
  selectorBtnSubmitProgress,
  selectorBtnSubmitRecord,
  selectorBtnSubmitRecordProblems,
  selectorInputCountry,
  selectorInputDatasetId,
  selectorInputHarvestUrl,
  selectorInputLanguage,
  selectorInputMetadataFormat,
  selectorInputName,
  selectorInputRecordId,
  selectorInputUrl,
  selectorInputXSLFile,
  selectorInputZipFile,
  selectorSendXSLT
} from '../support/selectors';

const noScrollCheck = { ensureScrollable: false };
const force = { force: true };

export const getSelectorPublishedUrl = (datasetId: string, recordId: string): string => {
  return `[href="http://localhost:3000/dataset/${datasetId}/record?recordId=${recordId}-eu&step=INDEX_PUBLISH"]`;
};

export const uploadFile = (fileName: string, fileType = '', selector: string): void => {
  cy.get(selector).selectFile(
    {
      contents: Cypress.Buffer.from('mock-file-content'),
      fileName: fileName,
      mimeType: 'application/zip'
    },
    { force: true }
  );
};

export const fillUploadForm = (
  testDatasetName: string,
  submit = false,
  protocol = 'zip',
  xslt = false
): void => {
  cy.get(selectorInputName).type(testDatasetName, { force: true, scrollBehavior: false });
  cy.get(selectorInputCountry).scrollIntoView();
  cy.get(selectorInputCountry).select('Greece', force);
  cy.get(selectorInputLanguage).select('Greek', force);

  if (protocol === 'http') {
    cy.contains('HTTP upload').click();
    cy.get(selectorInputUrl).type('http://upload-http.com');
  } else if (protocol === 'oai') {
    cy.contains('OAI-PMH upload').click();
    cy.get(selectorInputMetadataFormat).type('edm');
    cy.get(selectorInputHarvestUrl).type('http://upload-http.com');
  } else {
    cy.contains('File upload').click();

    uploadFile('Test_Sandbox.zip', 'zip', selectorInputZipFile);
  }
  if (xslt) {
    cy.get(selectorSendXSLT).click();
    uploadFile('Test_Sandbox.xsl', 'xsl', selectorInputXSLFile);
  }
  if (submit) {
    cy.get(selectorBtnSubmitData).click();
  }
};

export const fillProgressForm = (id: string, problems = false, wait = 3000): void => {
  cy.get(selectorInputDatasetId)
    .clear()
    .type(id);

  // needed to process submit event
  cy.press(Cypress.Keyboard.Keys.TAB);

  if (problems) {
    cy.get(selectorBtnSubmitDatasetProblems).click();
  } else {
    cy.get(selectorBtnSubmitProgress).click();
  }
  cy.wait(wait);
};

export const fillRecordForm = (id: string, problems = false): void => {
  cy.scrollTo('bottom', noScrollCheck);
  cy.wait(500);
  cy.get(selectorInputRecordId)
    .should('be.visible')
    .clear(force)
    .type(id);

  // needed to process submit event
  cy.press(Cypress.Keyboard.Keys.TAB);

  if (problems) {
    cy.get(selectorBtnSubmitRecordProblems).click(force);
  } else {
    cy.get(selectorBtnSubmitRecord).click(force);
  }
};

export const login = (): void => {
  cy.get('.link-login').click();
};
