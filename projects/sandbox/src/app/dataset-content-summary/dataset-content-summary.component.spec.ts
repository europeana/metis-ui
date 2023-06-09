import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Chart } from 'chart.js';
import { FormatTierDimensionPipe } from '../_translate';
import { MockSandboxService, mockTierData } from '../_mocked';
import { SortDirection } from '../_models';
import { SandboxService } from '../_services';
import { PieComponent } from '../chart/pie/pie.component';
import { DatasetContentSummaryComponent } from '.';

fdescribe('DatasetContentSummaryComponent', () => {
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

  const addPieComponent = (): void => {
    component.pieComponent = ({
      setPieSelection: jasmine.createSpy(),
      chart: ({
        update: jasmine.createSpy()
      } as unknown) as Chart
    } as unknown) as PieComponent;
  };

  it('should handle clicks on the sort-headers', () => {
    component.pieDimension = 'content-tier';
    component.datasetId = 0;
    component.loadData();
    addPieComponent();

    component.sortHeaderClick();

    expect(component.pieComponent.setPieSelection).not.toHaveBeenCalled();
    expect(component.pieDimension).toEqual('content-tier');
    expect(component.sortDimension).toEqual('content-tier');

    component.sortHeaderClick('license');
    expect(component.pieComponent.setPieSelection).not.toHaveBeenCalled();
    expect(component.pieDimension).toEqual('license');
    expect(component.sortDimension).toEqual('license');
    expect(component.sortDirection).toEqual(SortDirection.DESC);

    component.sortHeaderClick('license');
    expect(component.sortDirection).toEqual(SortDirection.ASC);

    component.sortHeaderClick('license');
    expect(component.sortDirection).toEqual(SortDirection.NONE);

    component.sortHeaderClick('license');
    expect(component.sortDirection).toEqual(SortDirection.DESC);

    component.sortHeaderClick('record-id');
    expect(component.sortDirection).toEqual(SortDirection.DESC);

    component.pieFilterValue = '1';
    component.sortHeaderClick('license');
    expect(component.pieComponent.setPieSelection).toHaveBeenCalled();
  });

  it('should load the data', fakeAsync(() => {
    component.datasetId = 100;
    expect(component.lastLoadedId).toBeFalsy();
    addPieComponent();
    component.loadData();
    tick();

    expect(component.lastLoadedId).toEqual(100);
    expect(component.pieComponent.setPieSelection).not.toHaveBeenCalled();
    expect(component.pieComponent.chart.update).not.toHaveBeenCalled();

    component.pieFilterValue = '1';
    component.loadData();
    tick();
    expect(component.pieComponent.setPieSelection).toHaveBeenCalled();
    expect(component.pieComponent.chart.update).toHaveBeenCalled();
  }));

  it('should rebuild the grid', () => {
    component.datasetId = 0;
    component.loadData();
    expect(component.gridData.length).toEqual(10);

    component.filterTerm = 'ANTHOLOGY';
    component.rebuildGrid();
    expect(component.gridData.length).toEqual(2);
  });

  it('should sort the rows', () => {
    const rows = structuredClone(mockTierData.records);
    expect(rows[0].license).toEqual('CC1');

    component.sortRows(rows, 'license');
    expect(rows[0].license).toEqual('CC1');

    component.sortDirection = SortDirection.ASC;
    component.sortRows(rows, 'license');
    expect(rows[0].license).toEqual('CC-BY');
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

  it('should set visible', fakeAsync(() => {
    spyOn(component, 'loadData').and.callThrough();
    component.isVisible = true;
    expect(component.loadData).not.toHaveBeenCalled();
    component.isVisible = false;
    expect(component.loadData).not.toHaveBeenCalled();
    component.datasetId = 0;
    component.isVisible = true;
    expect(component.loadData).toHaveBeenCalled();
    expect(component.lastLoadedId).toEqual(0);
    component.isVisible = false;
    component.isVisible = true;
    expect(component.loadData).toHaveBeenCalledTimes(1);
    component.datasetId = 1;
    expect(component.loadData).toHaveBeenCalledTimes(1);
    component.isVisible = false;
    component.isVisible = true;
    expect(component.loadData).toHaveBeenCalledTimes(2);
  }));

  it('should flag when ready', fakeAsync(() => {
    expect(component.ready).toBeFalsy();
    tick();
    expect(component.ready).toBeFalsy();
    component.datasetId = 0;
    component.isVisible = true;
    expect(component.isVisible).toBeTruthy();
    expect(component.ready).toBeTruthy();
  }));

  it('should format the data for the chart', fakeAsync(() => {
    expect(component.pieData.length).toEqual(0);
    expect(component.pieLabels.length).toEqual(0);
    component.datasetId = 0;
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
