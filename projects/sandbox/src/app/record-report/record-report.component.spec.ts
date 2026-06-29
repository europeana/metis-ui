import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockedMatomoService, mockRecordReport } from '../_mocked';
import { DisplayedMetaTier, DisplayedTier, MediaDataItem, RecordMediaType } from '../_models';
import { MatomoService } from '../_services';
import { RecordReportComponent } from './record-report.component';

describe('RecordReportComponent', () => {
  let component: RecordReportComponent;
  let fixture: ComponentFixture<RecordReportComponent>;

  const configureTestbed = async (): Promise<void> => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      imports: [RecordReportComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .overrideComponent(RecordReportComponent, {
        set: {
          providers: [
            {
              provide: MatomoService,
              useValue: mockedMatomoService
            }
          ]
        }
      })
      .compileComponents();
  };

  beforeEach(async () => {
    await configureTestbed();
    fixture = TestBed.createComponent(RecordReportComponent);

    fixture.componentRef.setInput('report', { ...mockRecordReport });
    TestBed.flushEffects();
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get the dataset id', async () => {
    const id = '321';
    const reportMock = JSON.parse(JSON.stringify(mockRecordReport));

    reportMock.recordTierCalculationSummary.europeanaRecordId = `/${id}/12345`;

    fixture.componentRef.setInput('report', reportMock);
    TestBed.flushEffects();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.getDatasetId()).toContain(id);
  });

  it('should handle keyboard events', () => {
    const keyEvent = (val: number): KeyboardEvent => {
      return ({ target: { value: val } } as unknown) as KeyboardEvent;
    };

    expect(component.techData().length).toBe(5);
    expect(component.visibleMedia()).toBe(0);

    component.changeMediaIndex(keyEvent(22));
    expect(component.visibleMedia()).toBe(4);

    component.changeMediaIndex(keyEvent(-1));
    expect(component.visibleMedia()).toBe(0);

    component.changeMediaIndex(keyEvent(1));
    expect(component.visibleMedia()).toBe(0);

    component.changeMediaIndex(keyEvent(2));
    expect(component.visibleMedia()).toBe(1);

    component.changeMediaIndex(keyEvent(('xxx' as unknown) as number));
    expect(component.visibleMedia()).toBe(0);
  });

  it('should get the inner ClassMap', async () => {
    TestBed.flushEffects();
    fixture.detectChanges();
    await fixture.whenStable();

    const config = component.getOrbConfigInner(DisplayedTier.CONTENT, component.visibleTier());

    expect(config['content-tier-orb']).toBe(true);
    expect(config['indicator-orb']).toBe(true);
  });

  it('should get the media ClassMap', () => {
    TestBed.flushEffects();
    fixture.detectChanges();
    expect(component.getOrbConfigInnerMedia(0, component.visibleMedia())['is-active']).toBeTruthy();
    expect(component.getOrbConfigInnerMedia(1, component.visibleMedia())['is-active']).toBeFalsy();
  });

  it('should get the getOrbConfigInnerMetadata ClassMap', () => {
    const currentMeta = component.visibleMetadata();

    expect(component.getOrbConfigInnerMetadata(0, currentMeta)['language-orb']).toBeTruthy();
    expect(component.getOrbConfigInnerMetadata(1, currentMeta)['language-orb']).toBeFalsy();

    expect(component.getOrbConfigInnerMetadata(1, currentMeta)['element-orb']).toBeTruthy();
    expect(component.getOrbConfigInnerMetadata(2, currentMeta)['element-orb']).toBeFalsy();

    expect(component.getOrbConfigInnerMetadata(2, currentMeta)['classes-orb']).toBeTruthy();
    expect(component.getOrbConfigInnerMetadata(0, currentMeta)['classes-orb']).toBeFalsy();
  });

  it('should set the media orb icons automatically via computed signal', () => {
    const testItems = [
      { mediaType: RecordMediaType.IMAGE } as MediaDataItem,
      ({ mediaType: 'UNKNOWN_TYPE' } as unknown) as MediaDataItem
    ];

    fixture.componentRef.setInput('report', {
      ...mockRecordReport,
      contentTierBreakdown: {
        ...mockRecordReport.contentTierBreakdown,
        mediaResourceTechnicalMetadataList: testItems
      }
    });

    TestBed.flushEffects();
    fixture.detectChanges();

    expect(component.techData()[0].cssClass).toBe('orb-media-image');
    expect(component.techData()[1].cssClass).toBe('orb-media-unknown');
  });

  it('should set the media', () => {
    expect(component.visibleMedia()).toBe(0);
    component.setMedia(1);
    expect(component.visibleMedia()).toBe(1);
  });

  it('should set the metadata', () => {
    expect(component.visibleMetadata()).toBe(DisplayedMetaTier.LANGUAGE);
    component.setMetadata(1);
    expect(component.visibleMetadata()).toBe(DisplayedMetaTier.ELEMENTS);
  });

  it('should set the view tier', () => {
    expect(component.visibleTier()).toBe(DisplayedTier.CONTENT);
    component.setView(DisplayedTier.METADATA);
    expect(component.visibleTier()).toBe(DisplayedTier.METADATA);
  });

  it('should reset the index tracking variable via input transform boundaries', () => {
    component.visibleMedia.set(123);
    component.visibleMetadata.set(DisplayedMetaTier.CLASSES);
    component.visibleTier.set(DisplayedTier.METADATA);

    fixture.componentRef.setInput('report', { ...mockRecordReport, id: 'mutation-trigger' });
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(component.visibleMedia()).toBe(0);
    expect(component.visibleMetadata()).toBe(DisplayedMetaTier.LANGUAGE);
    expect(component.visibleTier()).toBe(DisplayedTier.CONTENT);
  });

  it('should track the external link', () => {
    vi.spyOn(mockedMatomoService, 'trackNavigation').mockImplementation(() => {});
    component.trackExternalLink('X');
    expect(mockedMatomoService.trackNavigation).toHaveBeenCalled();
  });

  describe('Calculated Signal Cache Records Matrices', () => {
    it('should evaluate the media collapsed constraint computation correctly', () => {
      expect(component.mediaCollapsed()).toBeFalsy();

      const manyItems = Array(12).fill({ mediaType: RecordMediaType.IMAGE }) as MediaDataItem[];
      fixture.componentRef.setInput('report', {
        ...mockRecordReport,
        contentTierBreakdown: {
          ...mockRecordReport.contentTierBreakdown,
          mediaResourceTechnicalMetadataList: manyItems
        }
      });
      TestBed.flushEffects();
      expect(component.mediaCollapsed()).toBeTruthy();
    });

    it('should evaluate tierOrbsInnerRecord mappings when visible states flip', () => {
      expect(component.tierOrbsInnerRecord()[0]['is-active']).toBeTruthy();
      expect(component.tierOrbsInnerRecord()[1]['is-active']).toBeFalsy();

      component.visibleTier.set(DisplayedTier.METADATA);
      TestBed.flushEffects();

      expect(component.tierOrbsInnerRecord()[0]['is-active']).toBeFalsy();
      expect(component.tierOrbsInnerRecord()[1]['is-active']).toBeTruthy();
    });

    it('should evaluate metadataOrbsInnerRecord matrices reactively across choices', () => {
      expect(component.metadataOrbsInnerRecord()[0]['is-active']).toBeTruthy();
      expect(component.metadataOrbsInnerRecord()[1]['is-active']).toBeFalsy();

      component.visibleMetadata.set(DisplayedMetaTier.ELEMENTS);
      TestBed.flushEffects();

      expect(component.metadataOrbsInnerRecord()[0]['is-active']).toBeFalsy();
      expect(component.metadataOrbsInnerRecord()[1]['is-active']).toBeTruthy();
    });

    it('should calculate active record loops within mediaOrbsInnerRecord dynamic lists', () => {
      const loopRecord = component.mediaOrbsInnerRecord();
      expect(loopRecord[0]['is-active']).toBeTruthy();
      expect(loopRecord[1]['is-active']).toBeFalsy();

      component.visibleMedia.set(1);
      TestBed.flushEffects();

      expect(component.mediaOrbsInnerRecord()[0]['is-active']).toBeFalsy();
      expect(component.mediaOrbsInnerRecord()[1]['is-active']).toBeTruthy();
    });

    it('should return empty outer configurations matching template placeholders', () => {
      expect(component.staticOuterRecord()).toEqual({});
    });
  });
});
