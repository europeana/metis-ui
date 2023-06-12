import { fillProgressForm, fillRecordForm } from '../support/helpers';
import { selectorProgressOrb } from '../support/selectors';

context('Sandbox', () => {
  describe('Dataset Tier Summary', () => {
    beforeEach(() => {
      cy.server();
      cy.visit('/dataset/1');
    });

    const selectorOpenStats = '.nav-orb.pie-orb';
    const selectorOpenTracking = '.nav-orb.track-processing-orb';
    const selectorSectionTitle = '.sub-nav-header';
    const selectorTiersGrid = '.tier-data-grid';
    const titleDefault = 'Dataset Tier Statistics (by content tier)';
    const titleMetadataLang = 'Dataset Tier Statistics (by metadata tier language)';
    const force = { force: true };

    it('should show the opener', () => {
      cy.get(selectorOpenStats).should('exist');
    });

    it('should open', () => {
      cy.get(selectorTiersGrid)
        .filter(':visible')
        .should('not.exist');
      cy.get(selectorOpenStats).click(force);
      cy.get(selectorTiersGrid)
        .filter(':visible')
        .should('exist');
    });

    it('should update the title', () => {
      cy.get(selectorOpenStats).click(force);
      cy.wait(1000);
      cy.contains(selectorSectionTitle, titleDefault)
        .filter(':visible')
        .should('exist');
      cy.contains(selectorSectionTitle, titleMetadataLang).should('not.exist');
      cy.get('.lang a').should('have.length', 1);
      cy.get('.lang a').click(force);
      cy.contains(selectorSectionTitle, titleDefault).should('not.exist');
      cy.contains(selectorSectionTitle, titleMetadataLang)
        .filter(':visible')
        .should('exist');
    });

    it('should not close the progress-tracking pop-out', () => {
      const selectorPopOut = '.pop-out';
      const selectorPopOutOpener = `${selectorPopOut} .orb-container:not(.hidden) .nav-orb`;
      const selectorPopOutOpened = `${selectorPopOut}.open`;

      // open the popout
      cy.get(selectorPopOutOpened).should('not.exist');
      cy.get(selectorPopOutOpener).click(force);
      cy.get(selectorPopOutOpened).should('exist');

      // switch to tier display
      cy.get(selectorOpenStats).click(force);
      cy.get(selectorSectionTitle)
        .contains(titleDefault)
        .filter(':visible')
        .should('exist');

      // switch back to tracking
      cy.get(selectorOpenTracking).click(force);
      cy.get(selectorPopOutOpened).should('exist');
    });

    it('should retain the state after navigations away and back', () => {
      cy.get(selectorOpenStats).click(force);
      cy.get('.lang a').click(force);
      //cy.get(selectorSectionTitle)
      cy.contains(selectorSectionTitle, titleMetadataLang)
        .filter(':visible')
        .should('exist');

      // nav away...
      fillRecordForm('xxx');
      cy.contains(selectorSectionTitle, titleMetadataLang)
        .filter(':visible')
        .should('not.exist');

      // ...nav back again
      cy.get(selectorProgressOrb).click(force);
      cy.contains(selectorSectionTitle, titleMetadataLang)
        .filter(':visible')
        .should('exist');
    });

    it('should indicate when new progress data is loaded', () => {
      const selectorInfo = '.indicator-orb.info';
      cy.get(selectorOpenStats).click(force);
      cy.get(selectorInfo).should('not.exist');
      fillProgressForm('3');
      cy.get(selectorInfo).should('exist');
    });

    it('should sort', () => {
      cy.get(selectorOpenStats).click(force);
      cy.get('.inner-grid > *')
        .eq(5)
        .contains('CC-BY-SA-NC')
        .should('exist');

      cy.get('.tier-data-grid > *')
        .eq(3)
        .find('a')
        .click(force);
      cy.get('.tier-data-grid > *')
        .eq(3)
        .find('a')
        .click(force);

      cy.get('.inner-grid > *')
        .eq(5)
        .contains('CC-BY-SA-NC')
        .should('not.exist');
      cy.get('.inner-grid > *')
        .eq(5)
        .contains('CC0')
        .should('exist');

      cy.get('.tier-data-grid > *')
        .eq(3)
        .find('a')
        .click(force);

      cy.get('.inner-grid > *')
        .eq(5)
        .contains('CC0')
        .should('not.exist');
      cy.get('.inner-grid > *')
        .eq(5)
        .contains('CC-BY-SA-NC')
        .should('exist');
    });

    it('should filter (via the search)', () => {
      cy.get(selectorOpenStats).click(force);
      cy.get(selectorTiersGrid)
        .contains('No search results found')
        .should('not.exist');
      cy.get(`${selectorTiersGrid} input`).type('xxx', force);
      cy.get(selectorTiersGrid)
        .contains('No search results found')
        .should('exist');
    });

    it('should filter (via the pie)', () => {
      const selLegendItem = '.legend-item a';
      cy.get(selectorOpenStats).click(force);
      cy.get('.inner-grid > *').should('have.length', 354);
      cy.get(selLegendItem)
        .first()
        .click(force);
      cy.get('.inner-grid > *').should('have.length', 74);
      cy.get(selLegendItem)
        .first()
        .click(force);
      cy.get('.inner-grid > *').should('have.length', 354);
    });
  });
});
