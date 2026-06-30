import { UrlManipulation } from '../../test-data/models/models.mjs';
import { fillProgressForm } from '../support/helpers';

context('Sandbox', () => {
  describe('Problem Patterns', () => {
    const selectorModalHeader = '.modal .head';
    const selectorModalClose = `${selectorModalHeader} .btn-close`;
    const selectorProblemViewer = '.problem-viewer';
    const selectorProblemViewerHeader = `${selectorProblemViewer} .problem-header`;
    const selectorModalOpener = `${selectorProblemViewerHeader} a`;
    const selectorLinkRelated = `${selectorProblemViewer} .link-related`;
    const selectorLinkPDF = '.link-pdf-export';

    const textNoProblemsDataset = 'No Problem Patterns Found for Dataset';
    const textNoProblemsRecord = 'No Problem Patterns Found for Record';
    const textP1Error = 'P1';

    const testErrorsShowing = (url: string): void => {
      cy.visit(url);
      cy.get(selectorProblemViewer).should('be.visible');
      cy.get(selectorProblemViewerHeader).should('be.visible');
    };

    const testNoErrorsShowing = (url: string, msg: string): void => {
      cy.visit(url);
      cy.get(selectorProblemViewer)
        .contains(msg)
        .should('have.length', 1);
    };

    const testModalOpen = (url?: string): void => {
      if (url) {
        cy.visit(url);
        cy.get(selectorModalHeader).should('not.exist');
      }
      cy.get(selectorModalOpener)
        .first()
        .click();
      cy.get(selectorModalHeader)
        .contains(textP1Error)
        .should('have.length', 1);
    };

    describe('(polling)', () => {
      const pollInterval = 2000;
      const localDataServer = 'http://localhost:3000';
      const expectText1 = 'Occurs in 1 record';
      const expectText2 = 'Occurs in 2 records';
      const expectText3 = 'Occurs in 3 records';
      const expectText4 = 'Occurs in 4 records';

      const checkProblemOccurences = (
        problemCode: string,
        msg: string,
        assertNonExistence = false
      ): void => {
        const dynamic = assertNonExistence ? 'not.' : '';
        cy.get('.bold')
          .contains(problemCode)
          .first()
          .parent()
          .parent()
          .parent()
          .parent()
          .find('.title-record-occurences')
          .contains(msg)
          .should(dynamic + 'exist');
      };

      const checkProblemTitle = (text: number): void => {
        cy.get('.title-id')
          .contains(text)
          .should('exist');
      };

      it('should poll and cache', () => {
        const datasetId = 5003;
        const datasetId2 = 5001;
        const datasetId3 = 5007;

        // clear existing data
        [datasetId, datasetId2, datasetId3].forEach((id: number) => {
          cy.request(
            `${localDataServer}/pattern-analysis/${id}/get-dataset-pattern-analysis${UrlManipulation.RESET_DATASET_PROBLEMS}`
          );
        });

        cy.visit('/dataset');

        // begin polling on 2nd dataset
        fillProgressForm(`${datasetId2}`, true, 0);

        // switch to primary dataset
        fillProgressForm(`${datasetId}`, true, 0);

        // tick out the polling...
        cy.wait(2 * pollInterval);

        // ...and confirm the last selected is showing
        checkProblemTitle(datasetId);

        checkProblemOccurences('P1', expectText4);
        checkProblemOccurences('P9', expectText1);

        // switch and confirm (cached) alternative showing
        fillProgressForm(`${datasetId2}`, true, 0);

        checkProblemTitle(datasetId2);

        checkProblemOccurences('P1', expectText2);
        checkProblemOccurences('P9', expectText3);

        // switch to non-cached...
        fillProgressForm(`${datasetId3}`, true, 0);
        checkProblemTitle(datasetId3);

        // ...and confirm (non-cached) alternative is not showing

        checkProblemOccurences('P1', expectText4, true);
        checkProblemOccurences('P9', expectText1, true);

        // tick out the polling...
        cy.wait(1 * pollInterval);

        // ...and confirm that it is showing now
        checkProblemOccurences('P1', expectText4);

        cy.wait(1 * pollInterval);
        checkProblemOccurences('P9', expectText1);
      });
    });

    describe('(dataset)', () => {
      it('should show no errors', () => {
        testNoErrorsShowing('/dataset/100?view=problems', textNoProblemsDataset);
        cy.get(selectorLinkPDF).should('have.length', 0);
      });

      it('should show errors', () => {
        testErrorsShowing('/dataset/101?view=problems');
        cy.get(selectorLinkRelated).should('have.length.gt', 0);
        cy.get(selectorLinkPDF).should('have.length', 1);
      });

      it('should open the modal', () => {
        testModalOpen('/dataset/101?view=problems');
      });

      it('should collapse and expand the list of affected record ids', () => {
        cy.visit('/dataset/101?view=problems');

        const selOpener = '.problem-pattern .list-opener a';
        const selOpenedContent = `.openable-list`;

        cy.get(selOpenedContent)
          .filter(':visible')
          .should('have.length', 2);

        cy.get(selOpener)
          .first()
          .click();

        cy.get(selOpenedContent)
          .filter(':visible')
          .should('have.length', 1);

        cy.get(selOpener)
          .first()
          .click();

        cy.get(selOpenedContent)
          .filter(':visible')
          .should('have.length', 2);
      });
    });

    describe('(record)', () => {
      it('should show no errors', () => {
        testNoErrorsShowing('/dataset/100?recordId=2&view=problems', textNoProblemsRecord);
        cy.get(selectorLinkPDF).should('have.length', 0);
      });

      it('should show errors', () => {
        testErrorsShowing('/dataset/100?recordId=1&view=problems');
        cy.get(selectorLinkRelated).should('not.exist');
        cy.get(selectorLinkPDF).should('have.length', 1);
      });

      it('should open the modal', () => {
        testModalOpen('/dataset/100?recordId=1&view=problems');
      });
    });

    describe('(linked-viewers)', () => {
      it('should link the viewers', () => {
        cy.visit('/dataset/321?view=problems');
        cy.get('.problem-pattern').should('be.visible');
        cy.get(selectorLinkRelated)
          .eq(7)
          .click();
        cy.location('search').should('contain', `?recordId=`);
        cy.location('search').should('contain', `&view=problems`);
        cy.get(selectorLinkRelated)
          .filter(':visible')
          .should('not.exist');
      });

      it('should maintain separate modal instances', () => {
        cy.visit('/dataset/101?view=problems');
        cy.get('.problem-pattern').should('be.visible');

        testModalOpen();

        // Close dataset modal
        cy.get(selectorModalClose).click();

        cy.get('.openable-list a .link-related')
          .contains('/101/11/')
          .first()
          .closest('a')
          .click({ force: true });

        // Wait for the view to switch to the record details panel
        cy.contains('Problem Patterns (Record)').should('be.visible');

        // test modal record
        cy.get(selectorModalOpener)
          .last()
          .click();

        cy.get(selectorModalClose)
          .should('be.visible')
          .click();

        // back to dataset
        cy.get('.nav-orb.problem-orb')
          .first()
          .click();

        cy.contains('Problem Patterns (Dataset)').should('be.visible');
      });
    });

    describe('(error navigation)', () => {
      it('should show the arrows (dataset)', () => {
        cy.visit('/dataset/101?view=problems');
        cy.get('.skip-arrows')
          .filter(':visible')
          .should('exist');
      });

      it('should not show the arrows if (record) viewer is not scrollable', () => {
        cy.visit('/dataset/1?recordId=1&view=problems');
        cy.get('.skip-arrows').should('not.exist');
      });

      it('should show the arrows if the (record) viewer is scrollable', () => {
        cy.visit('/dataset/1478?recordId=121r9&view=problems');
        cy.get('.skip-arrows')
          .filter(':visible')
          .should('exist');
      });
    });
  });
});
