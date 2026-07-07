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
  return `[href="http://localhost:3000/dataset/${datasetId}/record?recordId=${recordId}-eu&step=INDEX_PREVIEW"]`;
};

export const uploadFile = (fileName: string, fileType = '', selector: string): void => {
  cy.get(selector).selectFile(
    {
      contents: Cypress.Buffer.from('mock-file-content'),
      fileName: fileName,
      mimeType: fileType
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
  const force1 = { force: true, scrollBehavior: false };

  cy.get(selectorInputName).should('have.value', '');
  cy.get(selectorInputCountry).should('have.value', null);
  cy.get(selectorInputLanguage).should('have.value', null);

  cy.get('.file-name')
    .contains('No file chosen')
    .should('be.visible');

  cy.get(selectorInputName)
    .clear()
    .type(testDatasetName, force1);
  cy.get(selectorInputCountry).scrollIntoView();
  cy.get(selectorInputCountry).select('Greece');
  cy.get(selectorInputLanguage).select('Greek');

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
    cy.get('.file-name')
      .contains('Test_Sandbox.zip')
      .should('be.visible');
  }
  if (xslt) {
    cy.get(selectorSendXSLT).click();
    uploadFile('Test_Sandbox.xsl', 'xsl', selectorInputXSLFile);
  }
  if (submit) {
    cy.get(selectorBtnSubmitData).should('be.enabled');
    cy.get(selectorBtnSubmitData).click();
  }
};

export const fillProgressForm = (id: string, problems = false, wait = 3000): void => {
  // 1. Clear and type the value natively
  cy.get(selectorInputDatasetId)
    .clear({ force: true })
    .type(id);

  // 2. CONDITIONAL ESCAPE: Check if the drop-in suggestion list is active in the DOM.
  // This explicitly prevents hitting Escape when it's closed, which would toggle it back open.
  cy.get('body').then(($body) => {
    if ($body.find('sb-drop-in .item-list').length > 0 || $body.find('sb-drop-in a').length > 0) {
      cy.get(selectorInputDatasetId).type('{esc}');
    }
  });

  // 3. Clear focus standardly to let the component clean up its tracking microtasks
  cy.get(selectorInputDatasetId).blur();

  // 4. Select the correct submit button based on the flag
  const btnSelector = problems ? selectorBtnSubmitDatasetProblems : selectorBtnSubmitProgress;

  // 5. Assert that the button is genuinely enabled.
  // This ensures the new constructor effect completely finishes restoring form validity
  // before the click occurs, preventing the empty-page routing glitch.
  cy.get(btnSelector)
    .should('not.be.disabled')
    .focus()
    .click();

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
  cy.get('.link-logout').should('be.visible');
};
