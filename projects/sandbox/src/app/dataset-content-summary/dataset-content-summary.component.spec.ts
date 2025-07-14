import { ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { createMockPipe } from 'shared';

import { IsScrollableDirective } from '../_directives';
import { MockPieComponent, MockSandboxService } from '../_mocked';
import { PagerInfo, SortDirection, TierSummaryRecord } from '../_models';
import { SandboxService } from '../_services';
import { FormatLicensePipe, FormatTierDimensionPipe } from '../_translate';

import { PieComponent } from '../chart/pie/pie.component';
import { GridPaginatorComponent } from '../grid-paginator';
import { DatasetContentSummaryComponent } from '.';

describe('DatasetContentSummaryComponent', () => {
  let component: DatasetContentSummaryComponent;
  let fixture: ComponentFixture<DatasetContentSummaryComponent>;

  const configureTestbed = (): void => {
    TestBed.configureTestingModule({
      imports: [DatasetContentSummaryComponent, PieComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: SandboxService,
          useClass: MockSandboxService
        },
        {
          provide: FormatTierDimensionPipe,
          useValue: createMockPipe('formatTierDimension')
        },
        {
          provide: FormatLicensePipe,
          useValue: createMockPipe('formatLicense')
        },
        {
          provide: PieComponent,
          useClass: MockPieComponent
        }
      ]
    }).compileComponents();
  };

  /*
  Configure TestBed and mimic ChangeDetectorRef.

  Note that ChangeDetectorRef is not provided through DI, so cannot be obtained via TestBed.inject
  fixture.changeDetectorRef is not the same as the one provided to the component, and
  fixture.debugElement.injector.get(ChangeDetectorRef) will create a new instance of the private class

  For that reason we spy on the private class prototype
  */
  const b4Each = async (): Promise<void> => {
    configureTestbed();
    fixture = TestBed.createComponent(DatasetContentSummaryComponent);
    component = fixture.componentInstance;

    // get a reference to an instance of the private class
    const changeDetectorRef = fixture.debugElement.injector.get(ChangeDetectorRef);
    // spy on private the class prototype
    spyOn(changeDetectorRef.constructor.prototype, 'detectChanges').and.callFake(() => {
      // supply the ViewChild PieComponent, as per the ChangeDetectorRef would
      component.pieComponent = (new MockPieComponent() as unknown) as PieComponent;
    });
  };

  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(fixture).toBeTruthy();
  });

  it('should handle clicks on the sort-headers', () => {
    component.pieDimension = 'content-tier';
    component.datasetId = 0;

    component.loadData();
    component.sortHeaderClick();

    expect(component.pieComponent).toBeTruthy();
    spyOn(component.pieComponent, 'setPieSelection');

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

  it('should load the data', () => {
    component.pieDimension = 'content-tier';
    component.pieFilterValue = 0;

    component.datasetId = 100;
    expect(component.lastLoadedId).toBeFalsy();

    component.loadData();
    expect(component.lastLoadedId).toEqual(100);
    expect(component.pieComponent).toBeTruthy();

    spyOn(component.pieComponent, 'setPieSelection');
    spyOn(component.pieComponent.chart, 'update');

    component.pieFilterValue = '1';
    component.loadData();

    expect(component.pieComponent.setPieSelection).toHaveBeenCalled();
    expect(component.pieComponent.chart.update).toHaveBeenCalled();
  });

  it('should rebuild the grid', () => {
    component.datasetId = 10;
    component.loadData();
    expect(component.gridData.length).toEqual(10);
    component.filterTerm = 'anthology';

    expect(component.gridData.length).not.toEqual(2);
    component.rebuildGrid();
    expect(component.gridData.length).toEqual(2);

    component.scrollableElement = ({
      calc: jasmine.createSpy()
    } as unknown) as IsScrollableDirective;

    component.rebuildGrid();
    expect(component.scrollableElement.calc).toHaveBeenCalled();
  });

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

  it('should set visible', () => {
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
    expect(component.pieComponent).toBeTruthy();

    spyOn(component.pieComponent, 'resizeChart');
    component.isVisible = false;
    component.isVisible = true;

    expect(component.loadData).toHaveBeenCalledTimes(2);
    expect(component.pieComponent.resizeChart).toHaveBeenCalledTimes(1);
  });

  it('should flag when ready', () => {
    expect(component.ready).toBeFalsy();
    expect(component.ready).toBeFalsy();
    component.datasetId = 10;
    component.isVisible = true;
    expect(component.isVisible).toBeTruthy();
    expect(component.ready).toBeTruthy();
  });

  it('should format the data for the chart', () => {
    expect(component.pieData.length).toEqual(0);
    expect(component.pieLabels.length).toEqual(0);
    component.datasetId = 10;
    component.loadData();
    component.fmtDataForChart(component.gridDataRaw, 'content-tier');
    expect(component.pieData.length).toBeGreaterThan(0);
    expect(component.pieLabels.length).toBeGreaterThan(0);
  });

  it('should set the pager info', () => {
    expect(component.pagerInfo).toBeFalsy();
    component.setPagerInfo({} as PagerInfo);
    expect(component.pagerInfo).toBeTruthy();
  });

  it('should go to the page', () => {
    component.datasetId = 100;
    component.paginator = ({ setPage: jasmine.createSpy() } as unknown) as GridPaginatorComponent;
    component.pagerInfo = { pageCount: 3 } as PagerInfo;

    component.loadData();

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
  });

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
