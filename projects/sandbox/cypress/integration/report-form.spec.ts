import { fillRecordForm } from '../support/helpers';
import {
  selectorBtnSubmitProgress,
  selectorBtnSubmitRecord,
  selectorInputMedia,
  selectorInputRecordId,
  selectorInputDatasetId,
  selectorLinkDatasetForm,
  selectorLinkProgressForm,
  selectorProgressOrb
} from '../support/selectors';

context('Sandbox', () => {
  describe('Report Form', () => {
    beforeEach(() => {
      cy.server();
    });

    const force = { force: true };
    const selectorDatasetOrb = '.nav-orb:not(.progress-orb, .report-orb)';
    const selectorOrbsHidden = '.dataset-orbs-hidden';
    const selectorContentTierOrb = '.content-tier-orb';
    const selectorMetadataTierOrb = '.metadata-tier-orb';

    const selectorActive = '.is-active';
    const selectorMediaOrb3D = '.orb-media-3d';
    const selectorMediaOrbAudio = '.orb-media-audio';
    const selectorMediaOrbImage = '.orb-media-image';
    const selectorMediaOrbText = '.orb-media-text';
    const selectorMediaOrbVideo = '.orb-media-video';
    const selectorMediaOrbUnknown = '.orb-media-unknown';

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

    it('should show the inputs and submit buttons', () => {
      cy.visit('/1?recordId=2');
      cy.get(selectorBtnSubmitRecord).should('have.length', 1);
      cy.get(selectorBtnSubmitRecord).should('not.be.disabled');
      cy.get(selectorBtnSubmitProgress).should('have.length', 1);
      cy.get(selectorBtnSubmitProgress).should('not.be.disabled');
      cy.get(selectorInputRecordId).should('have.value', '2');
      cy.get(selectorInputDatasetId).should('have.value', '1');
    });

    it('should show the processing errors conditionally', () => {
      cy.visit('/1?recordId=2');
      const selectorErrors = '.processing-errors';
      cy.get(selectorErrors).should('have.length', 0);
      cy.visit('/1?recordId=13');
      cy.wait(200);
      cy.get(selectorErrors).should('have.length', 1);
    });

    it('should link to the progress / track form', () => {
      cy.visit('/1?recordId=2');
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
      cy.visit('/1?recordId=2');
      cy.get(`.progress-orb-container:not(.hidden)`).should('have.length', 0);
      cy.get(`.wizard-head ${selectorDatasetOrb}`).should('have.length', 3);
      cy.get(`.wizard-head${selectorOrbsHidden} ${selectorDatasetOrb}`).should('have.length', 3);

      cy.scrollTo('bottom');
      cy.wait(500);
      cy.get(selectorLinkDatasetForm).click();

      cy.get(`.wizard-head${selectorOrbsHidden} ${selectorDatasetOrb}`).should('have.length', 0);
      cy.get(`.wizard-head ${selectorDatasetOrb}`).should('have.length', 3);
    });

    it('should toggle the contentTier and metadataTier sections', () => {
      cy.visit('/1?recordId=2');
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
      cy.visit('/1?recordId=1');
      cy.scrollTo(0, 200);
      cy.wait(200);

      allMediaOrbs.forEach((sel: string) => {
        cy.get(sel).should('have.length', 1);
      });
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrb3D);

      cy.get(selectorMediaOrbText).click();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbText);

      cy.get(selectorMediaOrbAudio).click();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbAudio);

      cy.get(selectorMediaOrbImage).click();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbImage);

      cy.get(selectorMediaOrbVideo).click();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbVideo);
    });

    it('should navigate with buttons when there are more than 5 media items', () => {
      cy.visit('/1?recordId=100');
      cy.scrollTo(0, 200);
      cy.wait(200);

      const selectorMediaItemNext = '.record-report .next.nav-orb';
      const selectorMediaItemPrev = '.record-report .previous.nav-orb';

      checkSingleActiveItem(allMediaOrbs, selectorMediaOrb3D);
      cy.get(selectorMediaItemNext).click();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbAudio);
      cy.get(selectorMediaItemNext).click();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbImage);
      cy.get(selectorMediaItemNext).click();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbText);
      cy.get(selectorMediaItemNext).click();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbVideo);
      cy.get(selectorMediaItemNext).click();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbUnknown);

      cy.get(selectorMediaItemPrev).click();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbVideo);
      cy.get(selectorMediaItemPrev).click();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbText);
      cy.get(selectorMediaItemPrev).click();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbImage);
      cy.get(selectorMediaItemPrev).click();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbAudio);
      cy.get(selectorMediaItemPrev).click();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrb3D);
    });

    it('should navigate with an input when there are more than 5 media items', () => {
      cy.visit('/1?recordId=100');
      cy.scrollTo(0, 200);
      cy.wait(200);
      cy.get(selectorInputMedia).should('have.length', 1);

      checkSingleActiveItem(allMediaOrbs, selectorMediaOrb3D);

      cy.get(selectorInputMedia)
        .clear()
        .type('2')
        .blur();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbAudio);

      cy.get(selectorInputMedia)
        .clear()
        .type('3')
        .blur();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbImage);

      cy.get(selectorInputMedia)
        .clear()
        .type('4')
        .blur();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbText);

      cy.get(selectorInputMedia)
        .clear()
        .type('5')
        .blur();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbVideo);

      cy.get(selectorInputMedia)
        .clear()
        .type('10')
        .blur();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbText);

      cy.get(selectorInputMedia)
        .clear()
        .type('100')
        .blur();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbText);

      cy.get(selectorInputMedia)
        .clear()
        .type('-100')
        .blur();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrb3D);
    });

    it('should toggle the metadataTier sub-sections', () => {
      cy.visit('/1?recordId=2');

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

    it('should correctly encode and decode url parameters', () => {
      cy.visit('/1');
      const url = 'http://some-url.com';
      const otherUrl = 'http://some-other-url.com';

      fillRecordForm(url);
      cy.location('search').should('not.equal', `?recordId=${url}`);
      cy.location('search').should('equal', `?recordId=${encodeURIComponent(url)}`);

      cy.visit(`/1?recordId=${encodeURIComponent(otherUrl)}`);
      cy.get(selectorInputRecordId).should('have.value', otherUrl);
    });
  });
});
