import { setEmptyDataResult } from '../support/helpers';

context('metis-ui', () => {
  describe('mapping', () => {
    beforeEach(() => {
      cy.visit('/dataset/mapping/0');
    });
    const force = { force: true };
    const selBtnInitDefault = '[data-e2e=xslt-init-default]';
    const selBtnTryDefaultXSLT = '[data-e2e=xslt-try-default]';
    const selEditors = '.view-sample';
    const selStatistics = '.view-statistics';
    const selSuccessNotification = '.success-notification';
    const selErrorNotification = '.error-notification';

    it('should show the statistics', () => {
      cy.get(selStatistics).should('have.length', 1);
      cy.get(selEditors).should('have.length', 1);
    });

    it('should show try out XSLT', () => {
      const btnLabel = 'Go back to Mapping';

      cy.contains('button', btnLabel).should('not.exist');
      cy.url().should('not.contain', '/preview');
      cy.url().should('contain', '/mapping');

      cy.get(selBtnTryDefaultXSLT)
        .first()
        .click();

      cy.url().should('contain', '/preview');
      cy.url().should('not.contain', '/mapping');
      cy.contains('button', btnLabel).should('have.length', 1);
      cy.contains('button', btnLabel).click(force);
      cy.url().should('not.contain', '/preview');
      cy.url().should('contain', '/mapping');
    });

    it('should show try out XSLT (fail)', () => {
      const selSampleEmpty = '.sample-data-empty';
      cy.get(selSampleEmpty).should('not.exist');
      cy.wait(1);

      setEmptyDataResult(
        '/orchestrator/proxies/records?workflowExecutionId=0&pluginType=VALIDATION_EXTERNAL&nextPage=',
        true
      );

      cy.get(selBtnTryDefaultXSLT)
        .first()
        .click();

      cy.get(selSampleEmpty).should('have.length', 1);
    });

    it('should initialise an editor with the default XSLT', () => {
      cy.get(selBtnInitDefault).should('not.exist');
      cy.visit('/dataset/mapping/1');
      cy.get(selBtnInitDefault).should('have.length', 1);

      cy.get(selEditors).should('have.length', 1);
      cy.get(selBtnInitDefault).click();
      cy.get(selEditors).should('have.length', 2);

      ['Cancel', 'Reset to default XSLT', 'Save', 'Save XSLT & Try it out'].forEach(
        (text: string) => {
          cy.contains('button', text).should('have.length', 1);
        }
      );
    });

    it('should save XSLT', () => {
      cy.visit('/dataset/mapping/1');
      cy.get(selBtnInitDefault).click();
      cy.wait(100);
      cy.get(selSuccessNotification).should('not.exist');
      cy.get(selErrorNotification).should('not.exist');
      cy.contains('button', 'Save').click(force);
      cy.get(selSuccessNotification).should('have.length', 1);
      cy.get(selErrorNotification).should('not.exist');
    });

    it('should report errors saving XSLT', () => {
      const selSuccessNotification = '.success-notification';
      const selErrorNotification = '.error-notification';

      cy.visit('/dataset/mapping/1');
      cy.get(selBtnInitDefault).click();
      cy.wait(100);
      cy.get(selSuccessNotification).should('not.exist');
      cy.get(selErrorNotification).should('not.exist');

      cy.get('.view-sample-editor-codemirror .CodeMirror')
        .first()
        .then((editor) => {
          const cast = (editor[0] as unknown) as {
            CodeMirror: { setValue: (value: string) => void };
          };
          cast.CodeMirror.setValue('fail');
        });

      cy.contains('button', 'Save').click(force);
      cy.get(selSuccessNotification).should('not.exist');
      cy.get(selErrorNotification).should('have.length', 1);
    });
  });
});
