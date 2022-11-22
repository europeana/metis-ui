import { fillRecordForm, getSelectorPublishedUrl } from '../support/helpers';
import {
  selectorBtnSubmitProgress,
  selectorBtnSubmitRecord,
  selectorInputDatasetId,
  selectorInputMedia,
  selectorInputRecordId,
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
    const noScrollCheck = { ensureScrollable: false };
    const selectorDatasetOrb = '.upload-orb';
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
          cy.get(sel).should('not.exist');
        });
      cy.get(activeOrb + selectorActive).should('have.length', 1);
    };

    it('should be disabled if there is no dataset id or if the dataset id is invalid', () => {
      cy.visit('/');
      cy.get(selectorBtnSubmitRecord).should('have.length', 1);
      cy.get(selectorInputRecordId).should('be.disabled');

      cy.get(selectorInputDatasetId)
        .clear()
        .type('1');
      cy.get(selectorInputRecordId).should('not.be.disabled');

      cy.get(selectorInputDatasetId)
        .clear()
        .type('XXX');
      cy.get(selectorInputRecordId).should('be.disabled');
    });

    it('should show the inputs and submit buttons', () => {
      cy.visit('/dataset/1?recordId=2');
      cy.get(selectorBtnSubmitRecord).should('have.length', 1);
      cy.get(selectorBtnSubmitRecord).should('not.be.disabled');
      cy.get(selectorBtnSubmitProgress).should('have.length', 1);
      cy.get(selectorBtnSubmitProgress).should('not.be.disabled');
      cy.get(selectorInputRecordId).should('have.value', '2');
      cy.get(selectorInputDatasetId).should('have.value', '1');
    });

    it('should show the as processed / as published links', () => {
      let datasetId = '1';
      let recordId = '/1/23';
      cy.get(getSelectorPublishedUrl(datasetId, recordId)).should('not.exist');
      cy.visit(`/dataset/${datasetId}?recordId=${encodeURIComponent(recordId)}`);
      cy.wait(200);
      cy.get(getSelectorPublishedUrl(datasetId, recordId)).should('have.length', 1);

      datasetId = '4';
      recordId = '/4/321';
      cy.get(getSelectorPublishedUrl(datasetId, recordId)).should('not.exist');
      cy.visit(`/dataset/${datasetId}?recordId=${encodeURIComponent(recordId)}`);
      cy.wait(200);
      cy.get(getSelectorPublishedUrl(datasetId, recordId)).should('have.length', 1);
    });

    it('should show the processing errors conditionally', () => {
      cy.visit('/dataset/1?recordId=2');
      const selectorErrors = '.processing-errors';
      cy.get(selectorErrors).should('not.exist');
      cy.visit('/dataset/1?recordId=13');
      cy.wait(200);
      cy.get(selectorErrors).should('have.length', 1);
    });

    it('should link to the progress / track form', () => {
      cy.visit('/dataset/1?recordId=2');
      cy.get(selectorProgressOrb)
        .filter(':visible')
        .should('not.exist');
      cy.get(selectorLinkProgressForm)
        .scrollIntoView()
        .should('be.visible');
      cy.wait(500);
      cy.get(selectorLinkProgressForm)
        .scrollIntoView()
        .click(force);
      cy.get(selectorLinkProgressForm).should('not.exist');
      cy.get(selectorProgressOrb)
        .filter(':visible')
        .should('have.length', 1);
    });

    it('should link the report to the dataset form (without opening the progress form)', () => {
      cy.visit('/dataset/1?recordId=2');
      cy.get(`.progress-orb-container:not(.hidden)`).should('not.exist');
      cy.get(`.wizard-head ${selectorDatasetOrb}`).should('have.length', 1);
      cy.get(`.wizard-head${selectorOrbsHidden} ${selectorDatasetOrb}`).should('have.length', 1);

      cy.scrollTo('bottom', noScrollCheck);
      cy.wait(500);
      cy.get(selectorLinkDatasetForm).click();

      cy.get(`.wizard-head ${selectorDatasetOrb}`).should('have.length', 1);
      cy.get(`.wizard-head${selectorOrbsHidden} ${selectorDatasetOrb}`).should('not.exist');
    });

    it('should toggle the contentTier and metadataTier sections', () => {
      cy.visit('/dataset/1?recordId=2');
      const selectorContentTierOrbActive = `${selectorContentTierOrb}.is-active`;
      const selectorMetadataTierOrbActive = `${selectorMetadataTierOrb}.is-active`;

      cy.get(selectorContentTierOrbActive).should('have.length', 1);
      cy.get(selectorMetadataTierOrbActive).should('not.exist');

      cy.get(selectorMetadataTierOrb).click(force);

      cy.get(selectorContentTierOrbActive).should('not.exist');
      cy.get(selectorMetadataTierOrbActive).should('have.length', 1);

      cy.get(selectorContentTierOrb).click(force);

      cy.get(selectorContentTierOrbActive).should('have.length', 1);
      cy.get(selectorMetadataTierOrbActive).should('not.exist');
    });

    it('should navigate by multiple media orbs when there are 5 or less media items', () => {
      cy.visit('/dataset/1?recordId=1');
      cy.scrollTo(0, 200, noScrollCheck);
      cy.wait(200);

      allMediaOrbs.forEach((sel: string) => {
        cy.get(sel).should('have.length', 1);
      });
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrb3D);

      cy.get(selectorMediaOrbText).click(force);
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbText);

      cy.get(selectorMediaOrbAudio).click(force);
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbAudio);

      cy.get(selectorMediaOrbImage).click(force);
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbImage);

      cy.get(selectorMediaOrbVideo).click(force);
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbVideo);
    });

    it('should navigate with buttons when there are more than 5 media items', () => {
      cy.visit('/dataset/1?recordId=100');
      cy.scrollTo(0, 200, noScrollCheck);
      cy.wait(200);

      const selectorMediaItemNext = '.record-report .next.nav-orb';
      const selectorMediaItemPrev = '.record-report .previous.nav-orb';

      checkSingleActiveItem(allMediaOrbs, selectorMediaOrb3D);
      cy.get(selectorMediaItemNext).click(force);
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbAudio);
      cy.get(selectorMediaItemNext).click(force);
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbImage);
      cy.get(selectorMediaItemNext).click(force);
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbText);
      cy.get(selectorMediaItemNext).click(force);
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbVideo);
      cy.get(selectorMediaItemNext).click(force);
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbUnknown);

      cy.get(selectorMediaItemPrev).click(force);
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbVideo);
      cy.get(selectorMediaItemPrev).click(force);
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbText);
      cy.get(selectorMediaItemPrev).click(force);
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbImage);
      cy.get(selectorMediaItemPrev).click(force);
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbAudio);
      cy.get(selectorMediaItemPrev).click(force);
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrb3D);
    });

    it('should navigate with an input when there are more than 5 media items', () => {
      cy.visit('/dataset/1?recordId=100');
      cy.scrollTo(0, 200, noScrollCheck);
      cy.wait(200);
      cy.get(selectorInputMedia).should('have.length', 1);

      checkSingleActiveItem(allMediaOrbs, selectorMediaOrb3D);

      cy.get(selectorInputMedia)
        .clear(force)
        .type('2')
        .blur();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbAudio);

      cy.get(selectorInputMedia)
        .clear(force)
        .type('3')
        .blur();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbImage);

      cy.get(selectorInputMedia)
        .clear(force)
        .type('4')
        .blur();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbText);

      cy.get(selectorInputMedia)
        .clear(force)
        .type('5')
        .blur();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbVideo);

      cy.get(selectorInputMedia)
        .clear(force)
        .type('10')
        .blur();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbText);

      cy.get(selectorInputMedia)
        .clear(force)
        .type('100')
        .blur();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrbText);

      cy.get(selectorInputMedia)
        .clear(force)
        .type('-100')
        .blur();
      checkSingleActiveItem(allMediaOrbs, selectorMediaOrb3D);
    });

    it('should toggle the metadataTier sub-sections', () => {
      cy.visit('/dataset/1?recordId=2');

      const selectorLanguageOrb = '.language-orb';
      const selectorElementOrb = '.element-orb';
      const selectorClassesOrb = '.classes-orb';

      const subSectionOrbs = [selectorLanguageOrb, selectorElementOrb, selectorClassesOrb];

      subSectionOrbs.forEach((sel: string) => {
        cy.get(sel + selectorActive).should('not.exist');
      });

      cy.get(selectorMetadataTierOrb).click(force);
      checkSingleActiveItem(allMediaOrbs, selectorLanguageOrb);

      cy.get(selectorElementOrb).click(force);
      checkSingleActiveItem(allMediaOrbs, selectorElementOrb);

      cy.get(selectorClassesOrb).click(force);
      checkSingleActiveItem(allMediaOrbs, selectorClassesOrb);
    });

    it('should correctly encode and decode url parameters', () => {
      cy.visit('/dataset/1');
      const url = 'http://some-url.com';
      const otherUrl = 'http://some-other-url.com';

      fillRecordForm(url);
      cy.location('search').should('not.equal', `?recordId=${url}`);
      cy.location('search').should('equal', `?recordId=${encodeURIComponent(url)}`);

      cy.visit(`/dataset/1?recordId=${encodeURIComponent(otherUrl)}`);
      cy.get(selectorInputRecordId).should('have.value', otherUrl);
    });

    it('should indicate when the dataset id and record are connected / disconnected', () => {
      const selConnected = '.connect';
      const selConnectedError = `${selConnected}.error`;

      cy.visit('/dataset/1?recordId=2');
      cy.get(selConnected).should('not.exist');
      cy.get(selConnectedError).should('not.exist');

      cy.visit('/dataset/1?recordId=/1/23');
      cy.get(selConnected).should('have.length', 2);
      cy.get(selConnectedError).should('not.exist');

      cy.visit('/dataset/1?recordId=/2/34');
      cy.get(selConnected).should('have.length', 2);
      cy.get(selConnectedError).should('have.length', 2);

      cy.get(selectorInputDatasetId)
        .clear(force)
        .type('2');
      cy.get(selConnected).should('have.length', 2);
      cy.get(selConnectedError).should('not.exist');

      cy.get(selectorInputDatasetId)
        .clear(force)
        .type('XXX');
      cy.get(selConnected).should('not.exist');

      cy.get(selectorInputDatasetId)
        .clear(force)
        .type('2');
      cy.get(selConnected).should('have.length', 2);

      cy.get(selectorInputRecordId)
        .clear(force)
        .type('X X');
      cy.get(selConnected).should('not.exist');
    });
  });
});
