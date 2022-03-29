import { RecordMediaType } from '../../src/app/_models';
import { selectorInputMedia } from '../support/selectors';

context('Sandbox', () => {
  describe('Report Types', () => {
    beforeEach(() => {
      cy.server();
    });

    const selectorRecordType = '[data-e2e=record-type]';

    const selectorEmbed = '[data-e2e=embed-available]';
    const selectorLanding = '[data-e2e=landing-available]';
    const selectorThumbnail = '[data-e2e=thumbnail-available]';
    const selectorThumbnailVal = `${selectorThumbnail} + .report-value`;

    const selectorEmptyValue = '[data-e2e=empty-value]';
    const selectorImageResolution = '[data-e2e=image-resolution]';
    const selectorVerticalResolution = '[data-e2e=vertical-resolution]';
    const selectorVerticalResolutionNotEmpty = `${selectorVerticalResolution} + :not(${selectorEmptyValue})`;

    it('should show reports for THREE_D', () => {
      cy.visit('/dataset/1?recordId=0');
      cy.get(selectorRecordType).contains(RecordMediaType.THREE_D);

      cy.get(selectorEmbed).should('have.length', 0);
      cy.get(selectorLanding).should('have.length', 0);
      cy.get(selectorThumbnail).should('have.length', 0);
      cy.get(selectorImageResolution).should('have.length', 0);
      cy.get(selectorVerticalResolution).should('have.length', 0);
    });

    it('should show reports for AUDIO', () => {
      cy.visit('/dataset/1?recordId=1');
      cy.get(selectorRecordType).contains(RecordMediaType.AUDIO);

      cy.get(selectorEmbed).should('have.length', 1);
      cy.get(selectorLanding).should('have.length', 1);
      cy.get(selectorThumbnail).should('have.length', 0);
      cy.get(selectorImageResolution).should('have.length', 0);
      cy.get(selectorVerticalResolution).should('have.length', 0);
    });

    it('should show reports for IMAGE', () => {
      cy.visit('/dataset/1?recordId=2');
      cy.get(selectorRecordType).contains(RecordMediaType.IMAGE);

      cy.get(selectorEmbed).should('have.length', 0);
      cy.get(selectorLanding).should('have.length', 0);

      cy.get(selectorThumbnail).should('have.length', 1);
      cy.get(selectorThumbnailVal).contains('No');
      cy.get(selectorThumbnailVal)
        .contains('Yes')
        .should('have.length', 0);

      cy.visit('/dataset/1?recordId=8');
      cy.get(selectorThumbnail).should('have.length', 1);
      cy.get(selectorThumbnailVal)
        .contains('No')
        .should('have.length', 0);
      cy.get(selectorThumbnailVal).contains('Yes');
      cy.get(selectorImageResolution).should('have.length', 1);
      cy.get(selectorVerticalResolution).should('have.length', 0);
    });

    it('should show reports for TEXT', () => {
      cy.visit('/dataset/1?recordId=3');
      cy.get(selectorRecordType).contains(RecordMediaType.TEXT);

      cy.get(selectorEmbed).should('have.length', 0);
      cy.get(selectorLanding).should('have.length', 1);
      cy.get(selectorThumbnail).should('have.length', 0);
      cy.get(selectorImageResolution).should('have.length', 1);
      cy.get(selectorVerticalResolution).should('have.length', 0);
    });

    it('should show reports for VIDEO', () => {
      cy.visit('/dataset/1?recordId=4');
      cy.get(selectorRecordType).contains(RecordMediaType.VIDEO);

      cy.get(selectorEmbed).should('have.length', 1);
      cy.get(selectorLanding).should('have.length', 1);
      cy.get(selectorVerticalResolution).should('have.length', 1);
      cy.get(selectorThumbnail).should('have.length', 0);
      cy.get(selectorImageResolution).should('have.length', 0);
    });

    it('should show reports for OTHER', () => {
      cy.visit('/dataset/1?recordId=5');
      cy.get(selectorRecordType).contains(RecordMediaType.OTHER);
      cy.get(selectorThumbnail).should('have.length', 0);
      cy.get(selectorImageResolution).should('have.length', 0);
      cy.get(selectorVerticalResolution).should('have.length', 0);
    });

    it('should show the vertical resolution field conditionally', () => {
      const force = { force: true };

      cy.visit('/dataset/1?recordId=102'); // 3D record
      cy.scrollTo(0, 200);
      cy.wait(200);

      [1, 2, 3, 4, 5].forEach((mediaIndex: number) => {
        cy.get(selectorInputMedia)
          .clear(force)
          .type(`${mediaIndex}`)
          .blur();
        cy.get(selectorVerticalResolution).should('have.length', 0);
      });

      cy.visit('/dataset/1?recordId=100'); // video record
      cy.scrollTo(0, 200);
      cy.wait(200);

      const indexesWithVideoValues = [2, 3, 4, 5];

      [1, 2, 3, 4, 5].forEach((mediaIndex: number) => {
        cy.get(selectorInputMedia)
          .clear(force)
          .type(`${mediaIndex}`)
          .blur();

        const expectedFieldCount = indexesWithVideoValues.includes(mediaIndex) ? 1 : 0;

        cy.get(selectorVerticalResolution).should('have.length', 1);
        cy.get(selectorVerticalResolutionNotEmpty).should('have.length', expectedFieldCount);
      });
    });
  });
});
