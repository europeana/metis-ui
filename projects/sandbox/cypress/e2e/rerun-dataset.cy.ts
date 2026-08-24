import { fillUploadForm, login } from '../support/helpers';

context('Sandbox', () => {
  const force = { force: true };
  const selContainer = '.dataset-info';
  const selDatasetName = 'a.dataset-name';
  const selReRunToggle = '.rerun';
  const selReRunShortcut = '.rerun-shortcut';
  const selReRunToggleEnabled = `${selReRunToggle}:not(.rerun-disabled)`;

  const selUpload = `${selContainer} .upload`;
  const selTitle = '.title-name';
  const cancelClass = 'rerun-cancel';

  const openReRun = (): void => {
    cy.get(selDatasetName).click(force);
    cy.get(selReRunToggle).click(force);
  };

  const checkReRunToggle = (): void => {
    cy.get(selDatasetName).click(force);

    cy.get(selReRunToggle).should('not.have.class', cancelClass);
    cy.get(selReRunToggle).click();
    cy.get(selReRunToggle).should('have.class', cancelClass);
    cy.get(selReRunToggle).click();
    cy.get(selReRunToggle).should('not.have.class', cancelClass);

    cy.get(selDatasetName).click(force);
  };

  const checkReRunShortcutToggle = (): void => {
    cy.get(selReRunShortcut).should('not.have.class', cancelClass);
    cy.get(selReRunShortcut).click(force);
    cy.get(selReRunShortcut).should('have.class', cancelClass);
    cy.get(selReRunShortcut).click(force);
    cy.get(selReRunShortcut).should('not.have.class', cancelClass);
  };

  const reRun = (name: string, nameReRun: string): void => {
    cy.get(selReRunToggle).should('exist');

    cy.get(selTitle)
      .contains(name)
      .should('exist');
    cy.get(selTitle)
      .contains(nameReRun)
      .should('not.exist');
    openReRun();

    const selUploadComplete = '.rerun-success-link';

    cy.get(selUploadComplete).should('not.exist');

    cy.get(selUpload).click();

    cy.get(selUploadComplete).should('exist');
    cy.get(selUploadComplete).click();
    cy.get(selUploadComplete).should('not.exist');
  };

  describe('Rerun Dataset', () => {
    beforeEach(() => {
      cy.visit('/dataset/1234');
      login();
      cy.contains('create a new dataset').click(force);
    });

    describe('(availability)', () => {
      it('should not be available for zip uploads', () => {
        fillUploadForm('name', true);
        cy.get(selDatasetName).click(force);
        cy.get(selReRunToggleEnabled).should('not.exist');
      });

      it('should not be available for xslt uploads', () => {
        fillUploadForm('name', true, 'http', true);
        cy.get(selDatasetName).click(force);
        cy.get(selReRunToggleEnabled).should('not.exist');
      });

      it('should be available for http uploads', () => {
        const name = 'My_HTTP_Upload';
        const nameReRun = `${name}_1`;

        fillUploadForm(name, true, 'http');

        cy.get('.portal-links', { timeout: 10000 }).should('exist');

        cy.get(selReRunToggle).should('exist');
        checkReRunToggle();
        cy.get(selReRunShortcut).should('exist');
        cy.get(selDatasetName).click(force);
        checkReRunShortcutToggle();
        reRun(name, nameReRun);
      });

      it('should be available for oai uploads', () => {
        const name = 'My_OAI_Upload_100';
        const nameReRun = 'My_OAI_Upload_101';
        fillUploadForm(name, true, 'oai');
        cy.get(selReRunToggle).should('exist');
        checkReRunToggle();
        checkReRunShortcutToggle();
        reRun(name, nameReRun);
      });
    });

    describe('(links)', () => {
      const rootName = 'ROOT';

      const checkChild = (index: number): void => {
        const nameReRun = `${rootName}_${index}`;
        reRun(rootName, nameReRun);
        cy.get(selDatasetName)
          .contains(nameReRun)
          .should('exist');
        cy.go('back');

        const selToggleAncestorMode = '.title-id .rerun-nav';
        cy.get(selToggleAncestorMode).click(force);

        const selChildDatasets = '.child-datasets';
        cy.get(`${selChildDatasets} li`)
          .contains(nameReRun)
          .should('exist');
        cy.get(selToggleAncestorMode).click(force);
      };

      it('should add children to the hierarchy', () => {
        fillUploadForm(rootName, true, 'http');
        checkChild(1);
        checkChild(2);
        checkChild(3);
        checkChild(4);
        // the colour of the links changes with subsequent additions
      });
    });

    describe('(errors)', () => {
      const selFieldName = `#rerun_name`;
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
        const selError = '.validation-error.network-error';
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
        const checkError = (
          fieldId: string,
          selError: string,
          valueValid: string,
          valueInvalid?: string
        ): void => {
          const selField = `#${fieldId}`;
          const selLabel = `[for=${fieldId}]`;

          cy.get(selError).should('not.exist');
          cy.get(selLabel).should('not.have.class', 'asterisked');
          cy.get(selLabel).should('have.class', 'tick');

          cy.get(selField).clear();
          cy.get(selError).should('exist');

          cy.get(selField).type(valueValid);
          cy.get(selError).should('not.exist');

          cy.get(selField).clear();

          if (valueInvalid) {
            cy.get(selField).type(valueInvalid);
          }
          cy.get(selError).should('exist');
          cy.get(selLabel).should('have.class', 'asterisked');
          cy.get(selLabel).should('not.have.class', 'tick');
        };

        fillUploadForm('Test_Validation_Error', true, 'oai');
        openReRun();

        const selErrorBubble = '.right-col .validation-error';

        checkError(`rerun_name`, `${selErrorBubble}.name`, 'Name', 'illegal space');
        checkError(`rerun_stepSize`, `${selErrorBubble}.step-size`, '2', 'nonNumeric');
        checkError(`rerun_url`, `${selErrorBubble}.url`, 'http://valid', 'nonUrl');
      });
    });
  });
});
