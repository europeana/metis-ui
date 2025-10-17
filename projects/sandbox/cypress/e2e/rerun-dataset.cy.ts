import { fillUploadForm, login } from '../support/helpers';

context('Sandbox', () => {
  const force = { force: true };
  const selContainer = '.dataset-info';
  const selDatasetName = 'a.dataset-name';
  const selReRunToggle = '.re-run';
  const selUpload = `${selContainer} .upload`;
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

    describe('(availability)', () => {
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
    });

    describe('(errors)', () => {
      const selFieldName = `${selContainer} #name`;
      const selErrorName = '.validation-error.name';

      it('should reset errors', () => {
        const name = 'Test_Reset';

        fillUploadForm(name, true, 'oai');
        openReRun();

        cy.get(selFieldName).should('have.value', `${name}_1`);
        cy.get(selErrorName).should('not.exist');
        cy.get(selUpload).should('not.have.attr', 'disabled');

        cy.get(selFieldName).clear();

        cy.get(selFieldName).should('have.value', '');
        cy.get(selErrorName).should('exist');

        // cancel and re-begin edit
        cy.get(selReRunToggle).click();
        cy.get(selReRunToggle).click();

        cy.get(selFieldName).should('have.value', `${name}_1`);
        cy.get(selErrorName).should('not.exist');
        cy.get(selUpload).should('not.have.attr', 'disabled');
      });

      it('should handle errors', () => {
        const selError = '.validation-error.error';
        const selField = selFieldName;

        fillUploadForm('Test_Upload_Error', true, 'oai');
        openReRun();

        cy.get(selField)
          .clear()
          .type('404');
        cy.get(selError).should('not.exist');
        cy.get(selUpload).click();
        cy.get(selError).should('exist');

        // clear error
        cy.get(selReRunToggle).click();
        cy.get(selError).should('not.exist');
        cy.get(selReRunToggle).click();
        cy.get(selError).should('not.exist');
      });

      it('should handle validation errors', () => {
        let selError = selErrorName;
        let selField = selFieldName;

        fillUploadForm('Test_Validation_Error', true, 'oai');
        openReRun();

        cy.get(selError).should('not.exist');
        cy.get(selField).clear();
        cy.get(selError).should('exist');

        cy.get(selField).type('Name');
        cy.get(selError).should('not.exist');

        cy.get(selField).clear();
        cy.get(selField).type('illegal space');
        cy.get(selError).should('exist');

        cy.get(selField).clear();
        cy.get(selField).type('Name');
        cy.get(selError).should('not.exist');

        // step-size
        selError = '.validation-error.step-size';
        selField = `${selContainer} #stepSize`;

        cy.get(selError).should('not.exist');
        cy.get(selField).clear();
        cy.get(selError).should('exist');

        cy.get(selField).clear();
        cy.get(selField).type('2');
        cy.get(selError).should('not.exist');

        cy.get(selField).clear();
        cy.get(selField).type('nonNumeric');
        cy.get(selError).should('exist');

        // url
        selError = '.validation-error.url';
        selField = `${selContainer} #url`;

        cy.get(selError).should('not.exist');
        cy.get(selField).clear();
        cy.get(selError).should('exist');

        cy.get(selField).type('http://valid');
        cy.get(selError).should('not.exist');

        cy.get(selField).clear();
        cy.get(selField).type('invalid');
        cy.get(selError).should('exist');
      });
    });
  });
});
