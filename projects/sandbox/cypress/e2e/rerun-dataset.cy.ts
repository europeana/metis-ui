import { fillUploadForm } from '../support/helpers';

context('Sandbox', () => {
  describe('Dataset Rerun', () => {
    const force = { force: true };
    const selDatasetName = 'a.dataset-name';
    const selReRunToggle = '.re-run';
    const selUpload = '.dataset-info .upload';
    const selTitle = '.title-name';

    beforeEach(() => {
      cy.visit('/dataset/new');
    });

    it('should not be available for zip uploads', () => {
      fillUploadForm('name', true);
      cy.get(selDatasetName).click(force);
      cy.get(selReRunToggle).should('not.exist');
    });

    it('should not be available for xslt uploads', () => {});

    const confirmReRun = (name: string, nameReRun: string): void => {
      cy.get(selReRunToggle).should('exist');
      cy.get(selTitle)
        .contains(name)
        .should('exist');
      cy.get(selTitle)
        .contains(nameReRun)
        .should('not.exist');
      cy.get(selDatasetName).click(force);
      cy.get(selReRunToggle).click();
      cy.get(selUpload).click();
      cy.contains(nameReRun).should('exist');
    };

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
});
