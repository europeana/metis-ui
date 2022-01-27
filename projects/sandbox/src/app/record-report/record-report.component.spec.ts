import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RecordReportComponent } from './record-report.component';
import { mockRecordReport } from '../_mocked';
import { DisplayedMetaTier, DisplayedTier, MediaDataItem } from '../_models';

describe('RecordReportComponent', () => {
  let component: RecordReportComponent;
  let fixture: ComponentFixture<RecordReportComponent>;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      declarations: [RecordReportComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(RecordReportComponent);
    component = fixture.componentInstance;
    component.report = mockRecordReport;
  };

  beforeEach(async(configureTestbed));
  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle keyboard events', () => {
    const keyEvent = (val: number): KeyboardEvent => {
      return ({ target: { value: val } } as unknown) as KeyboardEvent;
    };

    expect(component.techData.length).toEqual(5);
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

  it('should get the inner ClassMap', () => {
    expect(component.getOrbConfigInner(0)['content-tier-orb']).toBeTruthy();
    expect(component.getOrbConfigInner(1)['content-tier-orb']).toBeFalsy();
  });

  it('should get the media ClassMap', () => {
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

  it('should set the media orb icons', () => {
    component.techData.forEach((mediaItem: MediaDataItem) => {
      mediaItem.cssClass = '';
    });

    const techData = component.techData.slice();

    component.techData = [({ mediaType: 'xxx' } as unknown) as MediaDataItem];

    expect(`${component.techData[0].cssClass}`).toEqual('undefined');
    component.setOrbMediaIcons();
    expect(`${component.techData[0].cssClass}`).toEqual('orb-media-unknown');

    component.techData = techData;

    component.techData.forEach((mediaItem: MediaDataItem) => {
      mediaItem.cssClass = '';
    });
    component.setOrbMediaIcons();
    component.techData.forEach((mediaItem: MediaDataItem) => {
      expect(`${mediaItem.cssClass}`.length).toBeGreaterThan(0);
    });
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
    component.report = mockRecordReport;
    expect(component.visibleMedia).toEqual(0);
    expect(component.visibleMetadata as number).toEqual(DisplayedMetaTier.LANGUAGE);
    expect(component.visibleTier as number).toEqual(DisplayedTier.CONTENT);
  });
});
