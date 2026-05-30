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
    fixture.componentRef.setInput('recordReport', { ...mockRecordReport });
    TestBed.flushEffects();
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get the dataset id', async () => {
    const id = '321';
    const reportMock = JSON.parse(JSON.stringify(mockRecordReport));
    expect(component.getDatasetId()).not.toBe(id);

    // Structured pattern matching /dataset/321/12345 so split('/') results in index 1 being '321'
    reportMock.recordTierCalculationSummary.europeanaRecordId = `/${id}/12345`;

    fixture.componentRef.setInput('recordReport', reportMock);
    TestBed.flushEffects();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.getDatasetId()).toBe(id);
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

    fixture.componentRef.setInput('recordReport', {
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

  it('should reset the index tracking variable', () => {
    component.visibleMedia.set(123);
    component.visibleMetadata.set(DisplayedMetaTier.CLASSES);
    component.visibleTier.set(DisplayedTier.METADATA);

    // Trigger an input update to clear local indices via the constructor's side effect handler
    fixture.componentRef.setInput('recordReport', { ...mockRecordReport, id: 'mutation-trigger' });
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
});
