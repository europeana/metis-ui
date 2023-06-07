import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormatTierDimensionPipe } from '../_translate';
import { MockSandboxService } from '../_mocked';
import { SandboxService } from '../_services';
import { DatasetContentSummaryComponent } from '.';

describe('DatasetContentSummaryComponent', () => {
  let component: DatasetContentSummaryComponent;
  let fixture: ComponentFixture<DatasetContentSummaryComponent>;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      declarations: [DatasetContentSummaryComponent, FormatTierDimensionPipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: SandboxService,
          useClass: MockSandboxService
        }
      ]
    }).compileComponents();
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(DatasetContentSummaryComponent);
    component = fixture.componentInstance;
  };

  beforeEach(async(configureTestbed));
  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(fixture).toBeTruthy();
  });

  it('should update the term', () => {
    spyOn(component, 'rebuildGrid');
    component.updateTerm(({
      key: []
    } as unknown) as KeyboardEvent);
    expect(component.rebuildGrid).not.toHaveBeenCalled();
    component.updateTerm(({
      key: [{}]
    } as unknown) as KeyboardEvent);
    expect(component.rebuildGrid).toHaveBeenCalled();
  });

  it('should flag when ready', fakeAsync(() => {
    expect(component.ready).toBeFalsy();
    tick();
    expect(component.ready).toBeFalsy();
    component.datasetId = '0';
    component.isVisible = true;
    expect(component.isVisible).toBeTruthy();
    expect(component.ready).toBeTruthy();
  }));

  it('should format the data for the chart', fakeAsync(() => {
    expect(component.pieData.length).toEqual(0);
    expect(component.pieLabels.length).toEqual(0);
    component.datasetId = '0';
    component.loadData();
    tick();
    component.fmtDataForChart(component.summaryData.records, 'content-tier');
    expect(component.pieData.length).toBeGreaterThan(0);
    expect(component.pieLabels.length).toBeGreaterThan(0);
  }));

  it('should format the data for the chart', () => {
    expect(component.metadataChildActive()).toBeFalsy();
    component.pieDimension = 'metadata-tier-language';
    expect(component.metadataChildActive()).toBeTruthy();
    component.pieDimension = 'license';
    expect(component.metadataChildActive()).toBeFalsy();
    component.pieDimension = 'metadata-tier-elements';
    expect(component.metadataChildActive()).toBeTruthy();
    component.pieDimension = 'license';
    expect(component.metadataChildActive()).toBeFalsy();
    component.pieDimension = 'metadata-tier-classes';
    expect(component.metadataChildActive()).toBeTruthy();
    component.pieDimension = 'license';
    expect(component.metadataChildActive()).toBeFalsy();
  });
});
