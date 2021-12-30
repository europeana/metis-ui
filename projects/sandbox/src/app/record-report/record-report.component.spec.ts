import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RecordReportComponent } from './record-report.component';
import { mockRecordReport } from '../_mocked';
import { MediaDataItem } from '../_models';

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

    component.changeMediaIndex(keyEvent(('xxx' as any) as number));
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

    component.techData = [({ mediaType: 'xxx' } as any) as MediaDataItem];

    expect(`${component.techData[0].cssClass}`).toEqual('undefined');
    component.setOrbMediaIcons();
    expect(`${component.techData[0].cssClass}`).toEqual('undefined');

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
    expect(component.visibleMetadata).toEqual(0);
    component.setMetadata(1);
    expect(component.visibleMetadata).toEqual(1);
  });

  it('should set the media', () => {
    expect(component.visibleTier).toEqual(0);
    component.setView(1);
    expect(component.visibleTier).toEqual(1);
  });
});
