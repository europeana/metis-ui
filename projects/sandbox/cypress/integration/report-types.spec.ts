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

    const selectorImageResolution = '[data-e2e=image-resolution]';
    const selectorVerticalResolution = '[data-e2e=vertical-resolution]';

    it('should show reports for THREE_D', () => {
      cy.visit('/1?recordId=0');
      cy.get(selectorRecordType).contains(RecordMediaType.THREE_D);

      cy.get(selectorEmbed).should('have.length', 0);
      cy.get(selectorLanding).should('have.length', 0);
      cy.get(selectorThumbnail).should('have.length', 0);
    });

    it('should show reports for AUDIO', () => {
      cy.visit('/1?recordId=1');
      cy.get(selectorRecordType).contains(RecordMediaType.AUDIO);

      cy.get(selectorEmbed).should('have.length', 1);
      cy.get(selectorLanding).should('have.length', 1);
      cy.get(selectorThumbnail).should('have.length', 0);
    });

    it('should show reports for IMAGE', () => {
      cy.visit('/1?recordId=2');
      cy.get(selectorRecordType).contains(RecordMediaType.IMAGE);

      cy.get(selectorEmbed).should('have.length', 0);
      cy.get(selectorLanding).should('have.length', 0);

      cy.get(selectorThumbnail).should('have.length', 1);
      cy.get(selectorThumbnailVal).contains('No');
      cy.get(selectorThumbnailVal)
        .contains('Yes')
        .should('have.length', 0);

      cy.visit('/1?recordId=8');
      cy.get(selectorThumbnail).should('have.length', 1);
      cy.get(selectorThumbnailVal)
        .contains('No')
        .should('have.length', 0);
      cy.get(selectorThumbnailVal).contains('Yes');
    });

    it('should show reports for TEXT', () => {
      cy.visit('/1?recordId=3');
      cy.get(selectorRecordType).contains(RecordMediaType.TEXT);

      cy.get(selectorEmbed).should('have.length', 0);
      cy.get(selectorLanding).should('have.length', 1);
      cy.get(selectorThumbnail).should('have.length', 0);
    });

    it('should show reports for VIDEO', () => {
      cy.visit('/1?recordId=4');
      cy.get(selectorRecordType).contains(RecordMediaType.VIDEO);

      cy.get(selectorEmbed).should('have.length', 1);
      cy.get(selectorLanding).should('have.length', 1);
      cy.get(selectorThumbnail).should('have.length', 0);
    });

    it('should show reports for OTHER', () => {
      cy.visit('/1?recordId=5');
      cy.get(selectorRecordType).contains(RecordMediaType.OTHER);
      cy.get(selectorThumbnail).should('have.length', 0);
    });

    it('should show the image resolution field conditionally', () => {
      cy.visit('/1?recordId=100');
      cy.scrollTo(0, 200);
      cy.wait(200);
      cy.get(selectorInputMedia).should('have.length', 1);

      const indexesWithIR = [3, 4];
      [1, 2, 3, 4, 5].forEach((mediaIndex: number) => {
        cy.get(selectorInputMedia)
          .clear()
          .type(`${mediaIndex}`)
          .blur();
        const expectedFieldCount = indexesWithIR.includes(mediaIndex) ? 1 : 0;
        cy.get(selectorImageResolution).should('have.length', expectedFieldCount);
      });
    });

    it('should show the vertical resolution field conditionally', () => {
      cy.visit('/1?recordId=100');
      cy.scrollTo(0, 200);
      cy.wait(200);
      cy.get(selectorInputMedia).should('have.length', 1);

      const videoIndex = 5;
      [1, 2, 3, 4, 5].forEach((mediaIndex: number) => {
        cy.get(selectorInputMedia)
          .clear()
          .type(`${mediaIndex}`)
          .blur();
        const expectedFieldCount = videoIndex === mediaIndex ? 1 : 0;
        cy.get(selectorVerticalResolution).should('have.length', expectedFieldCount);
      });
    });
  });
});