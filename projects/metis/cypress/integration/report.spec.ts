import { cleanupUser, setupUser } from '../support/helpers';

context('metis-ui', () => {
  describe('report', () => {
    const force = { force: true };
    const selectorModal = '.modal';
    const selectorOpener = '.table-grid [data-e2e=open-report]';
    const selectorDownloadLink = `${selectorModal} .btn-download`;
    const selectorDownloadError = `${selectorModal} .download-error`;

    beforeEach(() => {
      cy.server();
      setupUser();
      cy.visit('/dataset/log/0');
      cy.wait(1000);
    });

    afterEach(() => {
      cleanupUser();
    });

    it('should open the report', () => {
      cy.get(selectorModal).should('not.exist');
      cy.get(selectorOpener).should('have.length.gt', 1);
      cy.get(selectorOpener)
        .eq(2)
        .click(force);
      cy.get(selectorModal).should('have.length', 1);
    });

    it('should offer downloads for non-harvest topologies', () => {
      cy.get(selectorOpener)
        .first()
        .click(force);
      cy.get(selectorDownloadLink).should('have.length', 3);
    });

    it('should not offer downloads for harvest topologies', () => {
      cy.get(selectorOpener)
        .last()
        .click(force);
      cy.get(selectorDownloadLink).should('not.exist');
    });

    it('should handle downloads', () => {
      cy.get(selectorOpener)
        .first()
        .click(force);
      cy.get(selectorDownloadLink)
        .last()
        .click(force);
      cy.get(selectorDownloadError).should('not.exist');
    });

    it('should handle download fails', () => {
      cy.get(selectorOpener)
        .first()
        .click(force);
      cy.get(selectorDownloadLink)
        .first()
        .click(force);
      cy.get(selectorDownloadError).should('have.length', 1);
    });
  });
});
