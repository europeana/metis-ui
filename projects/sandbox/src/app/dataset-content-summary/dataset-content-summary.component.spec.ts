import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { DatasetContentSummaryComponent } from './dataset-content-summary.component';
import { SandboxService } from '../_services';
import { SortDirection, TierSummaryRecord } from '../_models';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('DatasetContentSummaryComponent', () => {
  let component: DatasetContentSummaryComponent;
  let fixture: ComponentFixture<DatasetContentSummaryComponent>;
  let mockSandboxService: any;

  const mockRecords: TierSummaryRecord[] = [
    { 'record-id': 'rec-1', 'content-tier': 'tier-3', license: 'CC-BY' } as any,
    { 'record-id': 'rec-2', 'content-tier': 'tier-1', license: 'PD' } as any
  ];

  beforeEach(async () => {
    mockSandboxService = {
      getDatasetRecords: vi.fn().mockReturnValue(of(mockRecords))
    };

    await TestBed.configureTestingModule({
      imports: [DatasetContentSummaryComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: SandboxService, useValue: mockSandboxService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DatasetContentSummaryComponent);
    component = fixture.componentInstance;

    const mockElementRef = { nativeElement: document.createElement('canvas') };
    Object.defineProperty(component, 'pieCanvasEl', { get: () => mockElementRef });

    fixture.componentRef.setInput('datasetId', '123');
    await fixture.whenStable();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Data Loading', () => {
    it('should fetch records on loadData', async () => {
      component.loadData();

      expect(mockSandboxService.getDatasetRecords).toHaveBeenCalledWith(123);
      expect(component.gridDataRaw()).toEqual(mockRecords);
      expect(component.ready()).toBe(true);
      expect(component.hasError()).toBe(false);
    });

    it('should evaluate safety exit blocks for unassigned or invalid identifier inputs', async () => {
      const loadingSpy = vi.spyOn(component.onLoadingStatusChange, 'emit');

      fixture.componentRef.setInput('datasetId', 'undefined');
      await TestBed.flushEffects();
      component.loadData();
      expect(loadingSpy).toHaveBeenCalledWith(false);

      fixture.componentRef.setInput('datasetId', 'null');
      await TestBed.flushEffects();
      component.loadData();
      expect(loadingSpy).toHaveBeenCalledWith(false);
    });

    it('should set error state if loaded records array payload is completely empty', async () => {
      mockSandboxService.getDatasetRecords.mockReturnValue(of([]));

      component.loadData();
      await TestBed.flushEffects();

      expect(component.ready()).toBe(false);
      expect(component.hasError()).toBe(true);
    });

    it('should handle errors gracefully during loadData', async () => {
      const errorResponse = new HttpErrorResponse({ status: 500 });
      mockSandboxService.getDatasetRecords.mockReturnValue(throwError(() => errorResponse));

      component.loadData();

      expect(component.ready()).toBe(false);
      expect(component.hasError()).toBe(true);
    });
  });

  describe('Sorting and Grid Mutation', () => {
    it('should change sort direction sequentially on sortHeaderClick', async () => {
      component.gridDataRaw.set([...mockRecords]);
      await TestBed.flushEffects();

      component.sortHeaderClick('content-tier');
      expect(component.sortDirection()).toBe(SortDirection.DESC);

      component.sortHeaderClick('content-tier');
      expect(component.sortDirection()).toBe(SortDirection.ASC);

      component.sortHeaderClick('content-tier');
      expect(component.sortDirection()).toBe(SortDirection.NONE);
    });

    it('should reset active pie chart selection parameters if sorting dimension matches chart context', () => {
      const mockPie = { setPieSelection: vi.fn() };
      Object.defineProperty(component, 'pieComponent', { get: () => () => mockPie });
      component.pieDimension.set('content-tier');
      component.pieFilterValue.set('tier-3');

      component.sortHeaderClick('content-tier');
      expect(mockPie.setPieSelection).toHaveBeenCalledWith(-1, true);
    });

    it('should initialize ascending sorting parameters on a pristine switch to record-id dimension fields', () => {
      component.sortDimension.set('content-tier');
      component.sortDirection.set(SortDirection.NONE);

      component.sortHeaderClick('record-id');
      expect(component.sortDimension()).toBe('record-id');
      expect(component.sortDirection()).toBe(SortDirection.ASC);
    });

    it('should filter rows by term inside rebuildGrid', async () => {
      component.gridDataRaw.set([...mockRecords]);
      component.filterTerm.set('rec-1');

      component.rebuildGrid();

      expect(component.gridData().length).toBe(1);
      expect(component.gridData()[0]['record-id']).toBe('rec-1');
    });

    it('should safely escape row sorting loops if array reference elements are empty or unassigned', () => {
      expect(() => component.sortRows([], 'content-tier')).not.toThrow();
    });

    it('should run chronological tier value comparison matches down inside row sorting routines', () => {
      const mutableRecords = [...mockRecords];

      component.sortDirection.set(SortDirection.ASC);
      component.sortRows(mutableRecords, 'content-tier');
      expect(mutableRecords[0]['record-id']).toBe('rec-2');

      component.sortDirection.set(SortDirection.DESC);
      component.sortRows(mutableRecords, 'content-tier');
      expect(mutableRecords[0]['record-id']).toBe('rec-1');
    });
  });

  describe('Filters and Resets', () => {
    it('should clear states on removeAllFilters', async () => {
      component.filterTerm.set('test-term');
      component.pieFilterValue.set('tier-1');

      component.removeAllFilters();

      expect(component.filterTerm()).toBe('');
      expect(component.pieFilterValue()).toBeUndefined();
    });

    it('should handle chart transformation data formatting workflows', () => {
      component.fmtDataForChart(mockRecords, 'content-tier');

      expect(component.pieLabels()).toContain('tier-3');
      expect(component.pieLabels()).toContain('tier-1');
      expect(component.pieData()).toEqual([1, 1]);
      expect(component.piePercentages()).toBeDefined();
    });
  });

  describe('User Interactions and Navigation', () => {
    it('should emit record info when report link is executed', async () => {
      const emitSpy = vi.spyOn(component.onReportLinkClicked, 'emit');
      const fakeEvent = { preventDefault: vi.fn(), ctrlKey: false } as any;

      component.reportLinkEmit(fakeEvent, 'rec-1');

      expect(fakeEvent.preventDefault).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalledWith('rec-1');
    });

    it('should parse filter context on keyboard input character text updates', () => {
      const fakeInput = { value: 'rec-2' };
      const fakeEvent = { target: fakeInput, key: '2' } as any;

      component.updateTerm(fakeEvent);
      expect(component.filterTerm()).toBe('rec-2');
    });

    it('should break out of filter term parsing workflows if action target is unassigned', () => {
      expect(() => component.updateTerm({} as any)).not.toThrow();
    });

    it('should store pager dataset updates on setPagerInfo executions', () => {
      const fakePager = { pageCount: 5, totalRows: 50 } as any;
      component.setPagerInfo(fakePager);
      expect(component.pagerInfo).toBe(fakePager);
    });
  });

  describe('Computed Layout Subclass Evaluation Blocks', () => {
    it('should track children active states correctly for license and content dimension metrics', () => {
      component.pieDimension.set('license');
      expect(component.contentTierChildActive()).toBe(true);

      component.pieDimension.set('metadata-tier-language');
      expect(component.contentTierChildActive()).toBe(false);
      expect(component.metadataChildActive()).toBe(true);
    });
  });

  describe('Signal Defaults and Reactive Effects Validation', () => {
    it('should evaluate the default baseline parameters of unassigned signal states', () => {
      // Direct reads to ensure initial layout primitives are completely tracked
      expect(component.isVisible()).toBe(false);
      expect(component.recordHighlightRequest()).toBeUndefined();
      expect(component.gridData()).toEqual([]);
      expect(component.lastLoadedId()).toBeUndefined();
      expect(component.pieDimension()).toBe('content-tier');
      expect(component.pieFilterValue()).toBeUndefined();
    });

    it('should trigger calc layout commands inside scrollableElement effects', async () => {
      const mockScrollableDirective = { calc: vi.fn() };
      Object.defineProperty(component, 'scrollableElement', {
        get: () => () => mockScrollableDirective
      });

      // Mutating gridData triggers the active dependency inside the component constructor effect
      component.gridData.set([...mockRecords]);
      await TestBed.flushEffects();

      expect(mockScrollableDirective.calc).toHaveBeenCalled();
    });

    it('should evaluate dataset load operations reactively via visibility effects', async () => {
      vi.spyOn(component, 'loadData').mockImplementation(() => {});

      // Step A: Alter parameter inputs to establish baseline dependency pathing
      fixture.componentRef.setInput('isVisible', true);
      fixture.componentRef.setInput('datasetId', '5678');
      await TestBed.flushEffects();

      expect(component.loadData).toHaveBeenCalled();
    });
  });

  describe('Keyboard Interactive Pagination Hooks', () => {
    it('should intercept Enter keyup strokes and command page shifts on the child paginator', () => {
      const mockPaginator = { setPage: vi.fn() };
      Object.defineProperty(component, 'paginator', { get: () => () => mockPaginator });

      component.pagerInfo = { pageCount: 10, totalRows: 100 } as any;

      const mockInput = { value: 'Page 5' } as any;
      const fakeEnterEvent = ({
        key: 'Enter',
        target: mockInput
      } as unknown) as KeyboardEvent;

      // Act
      component.goToPage(fakeEnterEvent);

      // Assert: Regex cleans text out to "5". 1-indexed Page 5 scales down to zero-indexed page 4
      expect(mockPaginator.setPage).toHaveBeenCalledWith(4);
      expect(mockInput.value).toBe('');
    });

    it('should ignore input requests if key triggers are not the Enter key parameter', () => {
      const mockPaginator = { setPage: vi.fn() };
      Object.defineProperty(component, 'paginator', { get: () => () => mockPaginator });

      const mockInput = { value: '3' } as any;
      const fakeEscapeEvent = ({
        key: 'Escape',
        target: mockInput
      } as unknown) as KeyboardEvent;

      component.goToPage(fakeEscapeEvent);

      expect(mockPaginator.setPage).not.toHaveBeenCalled();
      expect(mockInput.value).toBe('3');
    });
  });
});
