import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockedMatomoService, mockRecordReport } from '../_mocked';
import { DisplayedMetaTier, DisplayedTier, MediaDataItem, RecordMediaType } from '../_models';
import { MatomoService } from '../_services';
import { RecordReportComponent } from '.';

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

  const b4Each = (): void => {
    configureTestbed();
    fixture = TestBed.createComponent(RecordReportComponent);
    fixture.componentRef.setInput('recordReport', { ...mockRecordReport });
    TestBed.flushEffects();
    component = fixture.componentInstance;
  };

  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get the dataset id', async () => {
    const id = '321';
    const report = JSON.parse(JSON.stringify(mockRecordReport));
    expect(component.getDatasetId()).not.toEqual(id);
    report.recordTierCalculationSummary.europeanaRecordId = `/${id}/12345`;
    fixture.componentRef.setInput('recordReport', report);
    TestBed.flushEffects();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.getDatasetId()).toEqual(id);
  });

  it('should handle keyboard events', () => {
    const keyEvent = (val: number): KeyboardEvent => {
      return ({ target: { value: val } } as unknown) as KeyboardEvent;
    };

    expect(component.techData().length).toEqual(5);
    expect(component.visibleMedia).toEqual(0);

    component.changeMediaIndex(keyEvent(22));
    expect(component.visibleMedia).toEqual(4);

    component.changeMediaIndex(keyEvent(-1));
    expect(component.visibleMedia).toEqual(0);

    component.changeMediaIndex(keyEvent(1));
    expect(component.visibleMedia).toEqual(0);

    component.changeMediaIndex(keyEvent(2));
    expect(component.visibleMedia).toEqual(1);

    component.changeMediaIndex(keyEvent(('xxx' as unknown) as number));
    expect(component.visibleMedia).toEqual(0);
  });

  it('should get the inner ClassMap', async () => {
    // Ensure the component is initialized
    TestBed.flushEffects();
    fixture.detectChanges();
    await fixture.whenStable();

    // Call with the Enum instead of a magic number
    const config = component.getOrbConfigInner(DisplayedTier.CONTENT);

    // Access the key exactly as defined in the component
    expect(config['content-tier-orb']).toBe(true);
    expect(config['indicator-orb']).toBe(true);
  });

  it('should get the media ClassMap', () => {
    TestBed.flushEffects();
    fixture.detectChanges();
    expect(component.getOrbConfigInnerMedia(0)['is-active']).toBeTruthy();
    expect(component.getOrbConfigInnerMedia(1)['is-active']).toBeFalsy();
  });

  it('should get the getOrbConfigInnerMetadata ClassMap', () => {
    expect(component.getOrbConfigInnerMetadata(0)['language-orb']).toBeTruthy();
    expect(component.getOrbConfigInnerMetadata(1)['language-orb']).toBeFalsy();
    expect(component.getOrbConfigInnerMetadata(1)['element-orb']).toBeTruthy();
    expect(component.getOrbConfigInnerMetadata(2)['element-orb']).toBeFalsy();
    expect(component.getOrbConfigInnerMetadata(2)['classes-orb']).toBeTruthy();
    expect(component.getOrbConfigInnerMetadata(0)['classes-orb']).toBeFalsy();
  });

  it('should set the media orb icons automatically via computed signal', () => {
    // 1. Define test data with various types
    const testItems = [
      { mediaType: RecordMediaType.IMAGE } as MediaDataItem,
      ({ mediaType: 'UNKNOWN_TYPE' } as unknown) as MediaDataItem
    ];

    // 2. Set the input (this triggers the computed techData)
    fixture.componentRef.setInput('recordReport', {
      ...mockRecordReport,
      contentTierBreakdown: {
        ...mockRecordReport.contentTierBreakdown,
        mediaResourceTechnicalMetadataList: testItems
      }
    });

    TestBed.flushEffects();
    fixture.detectChanges();

    // 3. Assert on the signal result directly
    // The computed signal logic we wrote earlier should have added these classes
    expect(component.techData()[0].cssClass).toEqual('orb-media-image');
    expect(component.techData()[1].cssClass).toEqual('orb-media-unknown');
  });

  it('should set the media', () => {
    expect(component.visibleMedia).toEqual(0);
    component.setMedia(1);
    expect(component.visibleMedia).toEqual(1);
  });

  it('should set the metadata', () => {
    expect(component.visibleMetadata).toEqual(DisplayedMetaTier.LANGUAGE);
    component.setMetadata(1);
    expect(component.visibleMetadata).toEqual(DisplayedMetaTier.ELEMENTS);
  });

  it('should set the media', () => {
    expect(component.visibleTier).toEqual(DisplayedTier.CONTENT);
    component.setView(DisplayedTier.METADATA);
    expect(component.visibleTier).toEqual(DisplayedTier.METADATA);
  });

  it('should reset the index tracking variable', () => {
    component.visibleMedia = 123;
    component.visibleMetadata = DisplayedMetaTier.CLASSES;
    component.visibleTier = DisplayedTier.METADATA;

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('recordReport', { ...mockRecordReport });
    });
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(component.visibleMedia).toEqual(0);
    expect(component.visibleMetadata as number).toEqual(DisplayedMetaTier.LANGUAGE);
    expect(component.visibleTier as number).toEqual(DisplayedTier.CONTENT);
  });

  it('should track the external link', () => {
    vi.spyOn(mockedMatomoService, 'trackNavigation').mockImplementation(() => {});
    component.trackExternalLink('X');
    expect(mockedMatomoService.trackNavigation).toHaveBeenCalled();
  });
});
