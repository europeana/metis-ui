context('Sandbox', () => {
  describe('Problem Patterns', () => {
    const force = { force: true };
    const selectorModalHeader = '.modal .head';
    const selectorModalOpener = '.problem-viewer .problem-header a';
    const selectorProblemViewer = '.problem-viewer';
    const textNoProblemsDataset = 'No Problem Patterns Found for Dataset';
    const textNoProblemsRecord = 'No Problem Patterns Found for Record';
    const textP1Error = 'P1';

    beforeEach(() => {
      cy.server();
      cy.visit('/');
    });

    const testErrorsShowing = (url: string, msg: string): void => {
      cy.visit(url);
      cy.get(selectorProblemViewer)
        .contains(msg)
        .should('not.exist');
    };

    const testNoErrorsShowing = (url: string, msg: string): void => {
      cy.visit(url);
      cy.get(selectorProblemViewer)
        .contains(msg)
        .should('have.length', 1);
    };

    const testModalOpen = (url: string): void => {
      cy.visit(url);
      cy.get(selectorModalHeader).should('not.exist');
      cy.get(selectorModalOpener)
        .first()
        .click(force);
      cy.get(selectorModalHeader)
        .contains(textP1Error)
        .should('have.length', 1);
    };

    describe('(dataset)', () => {
      it('should show no errors', () => {
        testNoErrorsShowing('/dataset/100?view=problems', textNoProblemsDataset);
      });

      it('should show errors', () => {
        testErrorsShowing('/dataset/101?view=problems', textNoProblemsDataset);
      });

      it('should open the modal', () => {
        testModalOpen('/dataset/101?view=problems');
      });

      it('should expand the affected record id list', () => {
        cy.visit('/dataset/101?view=problems');
        const selUnopenedOpener = '.list-opener:not(.auto-opened)';
        const openedContent = `${selUnopenedOpener} + li .openable-list`;
        cy.get(openedContent).should('not.exist');
        cy.get(`${selUnopenedOpener} a`)
          .first()
          .click(force);
        cy.get(openedContent)
          .filter(':visible')
          .should('exist');
      });
    });

    describe('(record)', () => {
      it('should show no errors', () => {
        testNoErrorsShowing('/dataset/100?recordId=2&view=problems', textNoProblemsRecord);
      });

      it('should show errors', () => {
        testErrorsShowing('/dataset/100?recordId=1&view=problems', textNoProblemsRecord);
      });

      it('should open the modal', () => {
        testModalOpen('/dataset/100?recordId=1&view=problems');
      });
    });

    describe('(linked-viewers)', () => {
      it('should link dataset problem patterns to record problem patterns', () => {
        cy.visit('/dataset/101?view=problems');
        cy.get('.link-related')
          .first()
          .click(force);
        cy.location('search').should('contain', `?recordId=`);
        cy.location('search').should('contain', `&view=problems`);
      });
    });
  });
});
