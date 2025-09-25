import { fillUploadForm, login } from '../support/helpers';

context('Sandbox', () => {
  const force = { force: true };
  const selDatasetName = 'a.dataset-name';
  const selReRunToggle = '.re-run';
  const selUpload = '.dataset-info .upload';
  const selTitle = '.title-name';

  const openReRun = (): void => {
    cy.get(selDatasetName).click(force);
    cy.get(selReRunToggle).click();
  };

  const confirmReRun = (name: string, nameReRun: string): void => {
    cy.get(selReRunToggle).should('exist');
    cy.get(selTitle)
      .contains(name)
      .should('exist');
    cy.get(selTitle)
      .contains(nameReRun)
      .should('not.exist');
    openReRun();
    cy.get(selUpload).click();
    cy.contains(nameReRun).should('exist');
  };

  describe('Dataset Rerun', () => {
    beforeEach(() => {
      cy.visit('/dataset/1234');
      login();
      cy.contains('create a new dataset').click(force);
    });

    it('should not be available for zip uploads', () => {
      fillUploadForm('name', true);
      cy.get(selDatasetName).click(force);
      cy.get(selReRunToggle).should('not.exist');
    });

    it('should not be available for xslt uploads', () => {
      fillUploadForm('name', true, 'http', true);
      cy.get(selDatasetName).click(force);
      cy.get(selReRunToggle).should('not.exist');
    });

    it('should be available for http uploads', () => {
      const name = 'My_HTTP_Upload';
      const nameReRun = `${name}_1`;
      fillUploadForm(name, true, 'http');
      confirmReRun(name, nameReRun);
    });

    it('should be available for oai uploads', () => {
      const name = 'My_OAI_Upload_100';
      const nameReRun = 'My_OAI_Upload_101';
      fillUploadForm(name, true, 'oai');
      confirmReRun(name, nameReRun);
    });

    it('should handle errors', () => {
      const selError = '.validation-bubble.error';

      fillUploadForm('Test_Upload_Error', true, 'oai');
      openReRun();

      cy.get('.dataset-info #name')
        .clear()
        .type('404');
      cy.get(selError).should('not.exist');
      cy.get(selUpload).click();
      cy.get(selError).should('exist');
    });

    it('should handle validation errors', () => {
      const selError = '.validation-bubble.name';

      fillUploadForm('Test_Validation_Error', true, 'oai');
      openReRun();

      cy.get(selError).should('not.exist');
      cy.get('.dataset-info #name').clear();
      cy.get(selError).should('exist');
    });
  });
});
