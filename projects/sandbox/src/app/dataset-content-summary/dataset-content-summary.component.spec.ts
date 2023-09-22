import { CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Chart } from 'chart.js';
import { FormatLicensePipe, FormatTierDimensionPipe } from '../_translate';
import { MockSandboxService } from '../_mocked';
import { PagerInfo, SortDirection, TierSummaryRecord } from '../_models';
import { SandboxService } from '../_services';
import { PieComponent } from '../chart/pie/pie.component';
import { GridPaginatorComponent } from '../grid-paginator';
import { DatasetContentSummaryComponent } from '.';

describe('DatasetContentSummaryComponent', () => {
  let component: DatasetContentSummaryComponent;
  let fixture: ComponentFixture<DatasetContentSummaryComponent>;
  const tickTime = 100;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      declarations: [DatasetContentSummaryComponent, FormatTierDimensionPipe, FormatLicensePipe],
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

    component.sortHeaderClick('license');
    expect(component.sortDirection).toEqual(SortDirection.DESC);

    component.sortHeaderClick('license');
    expect(component.sortDirection).toEqual(SortDirection.ASC);

    component.sortHeaderClick('license');
    expect(component.sortDirection).toEqual(SortDirection.NONE);

    component.sortHeaderClick('record-id');
    expect(component.sortDirection).toEqual(SortDirection.ASC);

    component.pieDimension = 'license';
    expect(component.pieDimension).toEqual('license');

    component.pieFilterValue = '1';
    component.sortHeaderClick('license');
    expect(component.pieComponent.setPieSelection).toHaveBeenCalled();
  });

  it('should handle the grid scroll', fakeAsync(() => {
    const spyToggleClass = jasmine.createSpy();

    component.innerGridEl = ({
      nativeElement: {
        getBoundingClientRect: () => {
          return {};
        },
        classList: ({
          toggle: spyToggleClass
        } as unknown) as DOMTokenList
      } as Element
    } as unknown) as ElementRef;

    component.datasetId = 100;
    addPieComponent();

    expect(spyToggleClass).toHaveBeenCalledTimes(0);
    component.loadData();
    tick(tickTime);

    expect(spyToggleClass).toHaveBeenCalledTimes(1);
    component.gridScroll();
    tick(tickTime);
    expect(spyToggleClass).toHaveBeenCalledTimes(2);
  }));

  it('should load the data', fakeAsync(() => {
    component.datasetId = 100;
    expect(component.lastLoadedId).toBeFalsy();
    addPieComponent();
    component.loadData();
    tick(tickTime);

    expect(component.lastLoadedId).toEqual(100);
    expect(component.pieComponent.setPieSelection).not.toHaveBeenCalled();
    expect(component.pieComponent.chart.update).not.toHaveBeenCalled();

    component.pieFilterValue = '1';
    component.loadData();
    tick(tickTime);
    expect(component.pieComponent.setPieSelection).toHaveBeenCalled();
    expect(component.pieComponent.chart.update).toHaveBeenCalled();
  }));

  it('should rebuild the grid', fakeAsync(() => {
    component.datasetId = 10;
    component.loadData();
    tick(tickTime);
    tick(tickTime);
    expect(component.gridData.length).toEqual(10);
    component.filterTerm = 'anthology';
    component.rebuildGrid();
    tick(tickTime);
    expect(component.gridData.length).toEqual(2);
  }));

  it('should sort the rows', () => {
    const rows = ([{ license: 'CC1' }, { license: 'CC-BY' }] as unknown) as Array<
      TierSummaryRecord
    >;
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
    tick(tickTime);

    expect(component.lastLoadedId).toEqual(0);
    component.isVisible = false;
    component.isVisible = true;
    expect(component.loadData).toHaveBeenCalledTimes(1);
    component.datasetId = 1;
    expect(component.loadData).toHaveBeenCalledTimes(1);

    component.pieComponent = ({
      resizeChart: jasmine.createSpy()
    } as unknown) as PieComponent;

    component.isVisible = false;
    component.isVisible = true;
    expect(component.loadData).toHaveBeenCalledTimes(2);
    expect(component.pieComponent.resizeChart).toHaveBeenCalled();
    tick(tickTime);
  }));

  it('should flag when ready', fakeAsync(() => {
    expect(component.ready).toBeFalsy();
    tick(tickTime);
    expect(component.ready).toBeFalsy();
    component.datasetId = 10;
    component.isVisible = true;
    tick(tickTime);
    expect(component.isVisible).toBeTruthy();
    expect(component.ready).toBeTruthy();
  }));

  it('should format the data for the chart', fakeAsync(() => {
    expect(component.pieData.length).toEqual(0);
    expect(component.pieLabels.length).toEqual(0);
    component.datasetId = 10;
    component.loadData();
    tick(tickTime);
    component.fmtDataForChart(component.gridDataRaw, 'content-tier');
    expect(component.pieData.length).toBeGreaterThan(0);
    expect(component.pieLabels.length).toBeGreaterThan(0);
  }));

  it('should set the pager info', fakeAsync(() => {
    expect(component.pagerInfo).toBeFalsy();
    component.setPagerInfo({} as PagerInfo);
    expect(component.pagerInfo).toBeFalsy();
    tick(tickTime);
    expect(component.pagerInfo).toBeTruthy();
  }));

  it('should go to the page', fakeAsync(() => {
    component.datasetId = 100;
    component.paginator = ({ setPage: jasmine.createSpy() } as unknown) as GridPaginatorComponent;
    component.pagerInfo = { pageCount: 3 } as PagerInfo;

    addPieComponent();
    component.loadData();
    tick(tickTime);

    const mockInput = ({
      value: ''
    } as unknown) as HTMLInputElement;

    const mockKeyEvent = ({ key: 'Enter', target: mockInput } as unknown) as KeyboardEvent;

    component.goToPage(mockKeyEvent);
    expect(mockInput.value.length).toEqual(0);
    expect(component.paginator.setPage).not.toHaveBeenCalled();

    mockInput.value = '1';
    component.goToPage(mockKeyEvent);
    expect(mockInput.value.length).toEqual(0);
    expect(component.paginator.setPage).toHaveBeenCalled();
  }));

  it('should detect if a content-tier dimension is active', () => {
    expect(component.contentTierChildActive()).toBeTruthy();
    component.pieDimension = 'metadata-tier-language';
    expect(component.contentTierChildActive()).toBeFalsy();
    component.pieDimension = 'license';
    expect(component.contentTierChildActive()).toBeTruthy();
    component.pieDimension = 'metadata-tier-enabling-elements';
    expect(component.contentTierChildActive()).toBeFalsy();
    component.pieDimension = 'content-tier';
    expect(component.contentTierChildActive()).toBeTruthy();
    component.pieDimension = 'metadata-tier-contextual-classes';
    expect(component.contentTierChildActive()).toBeFalsy();
  });

  it('should detect if a metadata dimension is active', () => {
    expect(component.metadataChildActive()).toBeFalsy();
    component.pieDimension = 'metadata-tier-language';
    expect(component.metadataChildActive()).toBeTruthy();
    component.pieDimension = 'license';
    expect(component.metadataChildActive()).toBeFalsy();
    component.pieDimension = 'metadata-tier-enabling-elements';
    expect(component.metadataChildActive()).toBeTruthy();
    component.pieDimension = 'license';
    expect(component.metadataChildActive()).toBeFalsy();
    component.pieDimension = 'metadata-tier-contextual-classes';
    expect(component.metadataChildActive()).toBeTruthy();
    component.pieDimension = 'license';
    expect(component.metadataChildActive()).toBeFalsy();
  });

  it('should remove all filters', () => {
    spyOn(component, 'rebuildGrid');
    component.pieComponent = ({ setPieSelection: jasmine.createSpy() } as unknown) as PieComponent;
    component.filterTerm = 'xxx';
    component.removeAllFilters();
    expect(component.filterTerm.length).toBeFalsy();
  });

  it('should emit events', () => {
    spyOn(component.onReportLinkClicked, 'emit');
    const id = 'id';
    const getMockKeyEvent = (ctrlKey: boolean): KeyboardEvent => {
      return ({
        preventDefault: jasmine.createSpy(),
        ctrlKey: ctrlKey
      } as unknown) as KeyboardEvent;
    };

    component.reportLinkEmit(getMockKeyEvent(true), id);
    expect(component.onReportLinkClicked.emit).not.toHaveBeenCalled();

    component.reportLinkEmit(getMockKeyEvent(false), id);
    expect(component.onReportLinkClicked.emit).toHaveBeenCalled();
  });

});
