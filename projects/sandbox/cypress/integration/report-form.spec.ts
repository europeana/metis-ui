import {
  selectorBtnSubmitRecord,
  selectorInputRecordId,
  selectorLinkDatasetForm,
  selectorLinkProgressForm,
  selectorProgressOrb
} from '../support/selectors';

context('Sandbox', () => {
  describe('Report Form', () => {
    beforeEach(() => {
      cy.server();
      cy.visit('/1/2');
    });

    const force = { force: true };
    const selectorDatasetOrb = '.wizard-status .nav-orb:not(.progress-orb, .report-orb)';

    const selectorContentTierOrb = '.content-tier-orb';
    const selectorMetadataTierOrb = '.metadata-tier-orb';

    const selectorActive = '.is-active';
    const selectorMediaOrb3D = '.orb-media-3d';
    const selectorMediaOrbAudio = '.orb-media-audio';
    const selectorMediaOrbImage = '.orb-media-image';
    const selectorMediaOrbText = '.orb-media-text';
    const selectorMediaOrbVideo = '.orb-media-video';

    const allMediaOrbs = [
      selectorMediaOrbText,
      selectorMediaOrb3D,
      selectorMediaOrbAudio,
      selectorMediaOrbImage,
      selectorMediaOrbVideo
    ];

    const checkSingleActiveItem = (allOrbs: Array<string>, activeOrb: string): void => {
      allOrbs
        .map((sel: string) => {
          return sel + selectorActive;
        })
        .filter((sel: string) => {
          return sel !== activeOrb + selectorActive;
        })
        .forEach((sel: string) => {
          console.log('test ' + sel);
          cy.get(sel).should('have.length', 0);
        });
      cy.get(activeOrb + selectorActive).should('have.length', 1);
    };

    it('should show the input and submit button', () => {
      cy.get(selectorBtnSubmitRecord).should('have.length', 1);
      cy.get(selectorBtnSubmitRecord).should('not.be.disabled');
      cy.get(selectorInputRecordId).should('have.value', '2');
    });

    it('should show the processing errors conditionally', () => {
      const selectorErrors = '.error-grid.report-grid';
      cy.get(selectorErrors).should('have.length', 1);
      cy.visit('/1/0');
      cy.wait(200);
      cy.get(selectorErrors).should('have.length', 0);
    });

    it('should link to the progress / track form', () => {
      cy.get(selectorProgressOrb)
        .filter(':visible')
        .should('have.length', 0);
      cy.get(selectorLinkProgressForm)
        .scrollIntoView()
        .should('be.visible');
      cy.wait(500);
      cy.get(selectorLinkProgressForm)
        .scrollIntoView()
        .click(force);
      cy.get(selectorLinkProgressForm).should('have.length', 0);
      cy.get(selectorProgressOrb)
        .filter(':visible')
        .should('have.length', 1);
    });

    it('should link to the dataset form (without opening the progress form)', () => {
      cy.get(selectorProgressOrb)
        .filter(':visible')
        .should('have.length', 0);
      cy.get(selectorDatasetOrb)
        .filter(':visible')
        .should('have.length', 0);

      cy.scrollTo('bottom');
      cy.wait(500);
      cy.get(selectorLinkDatasetForm).click();

      cy.get(selectorProgressOrb)
        .filter(':visible')
        .should('have.length', 0);
      cy.get(selectorDatasetOrb)
        .filter(':visible')
        .should('have.length', 3);
    });

    it('should toggle the contentTier and metadataTier sections', () => {
      const selectorContentTierOrbActive = `${selectorContentTierOrb}.is-active`;
      const selectorMetadataTierOrbActive = `${selectorMetadataTierOrb}.is-active`;

      cy.get(selectorContentTierOrbActive).should('have.length', 1);
      cy.get(selectorMetadataTierOrbActive).should('have.length', 0);

      cy.get(selectorMetadataTierOrb).click();

      cy.get(selectorContentTierOrbActive).should('have.length', 0);
      cy.get(selectorMetadataTierOrbActive).should('have.length', 1);

      cy.get(selectorContentTierOrb).click();

      cy.get(selectorContentTierOrbActive).should('have.length', 1);
      cy.get(selectorMetadataTierOrbActive).should('have.length', 0);
    });

    it('should navigate by multiple media orbs when there are 5 or less media items', () => {
      cy.visit('/1/1');
      cy.scrollTo(0, 200);
      cy.wait(200);

      allMediaOrbs.forEach((sel: string) => {
        cy.get(sel).should('have.length', 1);
      });

      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbText);

      cy.get(selectorMediaOrb3D).click();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrb3D);

      cy.get(selectorMediaOrbAudio).click();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbAudio);

      cy.get(selectorMediaOrbImage).click();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbImage);

      cy.get(selectorMediaOrbVideo).click();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbVideo);
    });

    it('should navigate with buttons when there are more than 5 media items', () => {
      cy.visit('/1/100');
      cy.scrollTo(0, 200);
      cy.wait(200);

      const selectorMediaItemNext = '.record-report .next.nav-orb';
      const selectorMediaItemPrev = '.record-report .previous.nav-orb';

      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbText);

      cy.get(selectorMediaItemNext).click();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrb3D);
      cy.get(selectorMediaItemNext).click();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbAudio);
      cy.get(selectorMediaItemNext).click();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbImage);
      cy.get(selectorMediaItemNext).click();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbVideo);

      cy.get(selectorMediaItemPrev).click();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbImage);
      cy.get(selectorMediaItemPrev).click();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbAudio);
      cy.get(selectorMediaItemPrev).click();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrb3D);
      cy.get(selectorMediaItemPrev).click();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbText);
    });

    it('should navigate with an input when there are more than 5 media items', () => {
      cy.visit('/1/100');
      cy.scrollTo(0, 200);
      cy.wait(200);

      const selectorMediaInput = '.record-report input[type="number"]';
      cy.get(selectorMediaInput).should('have.length', 1);

      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbText);

      cy.get(selectorMediaInput)
        .clear()
        .type('2')
        .blur();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrb3D);

      cy.get(selectorMediaInput)
        .clear()
        .type('3')
        .blur();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbAudio);

      cy.get(selectorMediaInput)
        .clear()
        .type('4')
        .blur();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbImage);

      cy.get(selectorMediaInput)
        .clear()
        .type('5')
        .blur();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbVideo);

      cy.get(selectorMediaInput)
        .clear()
        .type('10')
        .blur();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbVideo);

      cy.get(selectorMediaInput)
        .clear()
        .type('100')
        .blur();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbVideo);

      cy.get(selectorMediaInput)
        .clear()
        .type('-100')
        .blur();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbText);
    });

    it('should toggle the metadataTier sub-sections', () => {
      const selectorLanguageOrb = '.language-orb';
      const selectorElementOrb = '.element-orb';
      const selectorClassesOrb = '.classes-orb';

      const subSectionOrbs = [selectorLanguageOrb, selectorElementOrb, selectorClassesOrb];

      subSectionOrbs.forEach((sel: string) => {
        cy.get(sel + selectorActive).should('have.length', 0);
      });

      cy.get(selectorMetadataTierOrb).click();
      checkSingleActiveItem(allMediaOrbs, selectorLanguageOrb);

      cy.get(selectorElementOrb).click();
      checkSingleActiveItem(allMediaOrbs, selectorElementOrb);

      cy.get(selectorClassesOrb).click();
      checkSingleActiveItem(allMediaOrbs, selectorClassesOrb);
    });
  });
});
