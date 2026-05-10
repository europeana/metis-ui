import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createMockPipe } from 'shared';
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
        provideZonelessChangeDetection(),
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
        }
      ]
    })
      .overrideComponent(DatasetContentSummaryComponent, {
        remove: { imports: [PieComponent] },
        add: { imports: [MockPieComponent] }
      })
      .compileComponents();
  };

  const b4Each = async (): Promise<void> => {
    configureTestbed();
    fixture = TestBed.createComponent(DatasetContentSummaryComponent);
    fixture.componentRef.setInput('datasetId', '0');
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const setVisible = (value: boolean): void => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('isVisible', value);
    });
    fixture.detectChanges();
  };

  // Mock ResizeObserver for JSDOM environment
  beforeAll(() => {
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  beforeEach(b4Each);

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(fixture).toBeTruthy();
  });

  it('should handle clicks on the sort-headers', async () => {
    component.pieDimension = 'content-tier';

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('datasetId', 0);
      fixture.componentRef.setInput('isVisible', true);
    });

    component.loadData();

    await fixture.whenStable();

    component.sortHeaderClick();

    const pie = component.pieComponent();
    expect(pie).toBeTruthy();

    if (pie) {
      vi.spyOn(pie, 'setPieSelection');
    }

    expect(pie?.setPieSelection).not.toHaveBeenCalled();
    expect(component.pieDimension).toEqual('content-tier');
    expect(component.sortDimension).toEqual('content-tier');

    component.sortHeaderClick('license');
    expect(pie?.setPieSelection).not.toHaveBeenCalled();
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

    component.pieFilterValue.set('1');
    component.sortHeaderClick('license');
    expect(pie?.setPieSelection).toHaveBeenCalled();
  });

  it('should load the data', () => {
    component.pieDimension = 'content-tier';
    component.pieFilterValue.set(0);

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('isVisible', true);
      fixture.componentRef.setInput('datasetId', 100);
    });

    fixture.detectChanges();

    const pie = component.pieComponent();
    expect(pie).toBeTruthy();
    if (pie) {
      expect(pie.chart).toBeTruthy();
      vi.spyOn(pie, 'setPieSelection');

      const updateSpy = vi.spyOn(pie.chart as any, 'update');
      component.pieFilterValue.set('1');
      component.loadData();
      expect(pie?.setPieSelection).toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalled();
    }
  });

  it('should rebuild the grid', async () => {
    fixture.componentRef.setInput('datasetId', 10);
    fixture.componentRef.setInput('isVisible', true);
    TestBed.flushEffects();
    fixture.detectChanges();
    await fixture.whenStable();

    let results = component.gridData();

    expect(results.length).toEqual(10);

    component.filterTerm.set('anthology');

    TestBed.flushEffects();
    fixture.detectChanges();
    await fixture.whenStable();
    results = component.gridData();
    expect(results.length).not.toEqual(10);
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
    vi.spyOn(component, 'rebuildGrid');
    component.updateTerm(({
      target: {
        value: ''
      },
      key: []
    } as unknown) as KeyboardEvent);
    expect(component.rebuildGrid).not.toHaveBeenCalled();
    component.updateTerm(({
      target: {
        value: 'a'
      },
      key: [{}]
    } as unknown) as KeyboardEvent);
    expect(component.rebuildGrid).toHaveBeenCalled();
  });

  it('should set visible', async () => {
    vi.spyOn(component, 'loadData');

    setVisible(true);
    await fixture.whenStable();

    expect(component.loadData).toHaveBeenCalledTimes(1);

    setVisible(false);
    fixture.detectChanges();

    expect(component.loadData).toHaveBeenCalledTimes(1);

    setVisible(true);
    fixture.detectChanges();

    expect(component.loadData).toHaveBeenCalledTimes(1);

    setVisible(false);
    fixture.detectChanges();

    fixture.componentRef.setInput('datasetId', 1);

    TestBed.flushEffects();
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentRef.setInput('datasetId', 10);
    fixture.componentRef.setInput('isVisible', true);

    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.lastLoadedId()).toEqual(10);

    expect(component.loadData).toHaveBeenCalledTimes(2);
    expect(component.pieComponent()).toBeTruthy();

    const pie = component.pieComponent();
    expect(pie).toBeTruthy();

    if (pie) {
      vi.spyOn(pie, 'resizeChart');

      setVisible(false);
      await fixture.whenStable();
      setVisible(true);
      await fixture.whenStable();

      expect(component.loadData).toHaveBeenCalledTimes(2);
      expect(pie?.resizeChart).toHaveBeenCalledTimes(1);
    }
  });

  it('should flag when ready', async () => {
    expect(component.ready()).toBeFalsy();
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('datasetId', 10);
      fixture.componentRef.setInput('isVisible', true);
    });
    await fixture.whenStable();
    expect(component.ready()).toBeTruthy();
  });

  it('should format the data for the chart', () => {
    expect(component.pieData.length).toEqual(0);
    expect(component.pieLabels.length).toEqual(0);

    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('datasetId', 10);
    });

    component.loadData();
    component.fmtDataForChart(component.gridDataRaw(), 'content-tier');
    expect(component.pieData.length).toBeGreaterThan(0);
    expect(component.pieLabels.length).toBeGreaterThan(0);
  });

  it('should go to the page', () => {
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('datasetId', 100);
    });

    // Overwrite the signal with a standard signal for testing
    (component as any).paginator = signal(({
      setPage: vi.fn()
    } as unknown) as GridPaginatorComponent);

    component.pagerInfo = { pageCount: 3 } as PagerInfo;

    component.loadData();

    const mockInput = ({
      value: ''
    } as unknown) as HTMLInputElement;

    const mockKeyEvent = ({ key: 'Enter', target: mockInput } as unknown) as KeyboardEvent;

    component.goToPage(mockKeyEvent);
    expect(mockInput.value.length).toEqual(0);
    expect(component.paginator()?.setPage).not.toHaveBeenCalled();

    mockInput.value = '1';
    component.goToPage(mockKeyEvent);
    expect(mockInput.value.length).toEqual(0);
    expect(component.paginator()?.setPage).toHaveBeenCalled();
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
    vi.spyOn(component, 'rebuildGrid');
    component.filterTerm.set('xxx');
    component.removeAllFilters();
    expect(component.filterTerm.length).toBeFalsy();
  });

  it('should emit events', () => {
    vi.spyOn(component.onReportLinkClicked, 'emit');
    const id = 'id';
    const getMockKeyEvent = (ctrlKey: boolean): KeyboardEvent => {
      return ({
        preventDefault: vi.fn(),
        ctrlKey: ctrlKey
      } as unknown) as KeyboardEvent;
    };

    component.reportLinkEmit(getMockKeyEvent(true), id);
    expect(component.onReportLinkClicked.emit).not.toHaveBeenCalled();

    component.reportLinkEmit(getMockKeyEvent(false), id);
    expect(component.onReportLinkClicked.emit).toHaveBeenCalled();
  });

  it('should highlight the records', () => {
    const id = '123/456';
    expect(component.filterTerm()).toEqual('');

    fixture.componentRef.setInput('recordHighlightRequest', id);
    TestBed.flushEffects();
    expect(component.filterTerm()).toEqual(id);

    fixture.componentRef.setInput('recordHighlightRequest', undefined);
    TestBed.flushEffects();
    expect(component.filterTerm()).toEqual('');
  });
});
