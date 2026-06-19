import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { DatasetContentSummaryComponent } from './dataset-content-summary.component';
import { SandboxService } from '../_services';
import { SortDirection, TierSummaryRecord } from '../_models';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { describe, it, expect, beforeEach, vi } from 'vitest';

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
        // Fixes NG0908 error by instructing TestBed to run zoneless
        provideZonelessChangeDetection(),
        { provide: SandboxService, useValue: mockSandboxService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DatasetContentSummaryComponent);
    component = fixture.componentInstance;

    // Explicitly set the required input signals before the first evaluation
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

      // First click targets the same dimension ('content-tier'), cycling from NONE to DESC
      component.sortHeaderClick('content-tier');
      expect(component.sortDirection()).toBe(SortDirection.DESC);

      // Second click cycles from DESC to ASC
      component.sortHeaderClick('content-tier');
      expect(component.sortDirection()).toBe(SortDirection.ASC);
    });

    it('should filter rows by term inside rebuildGrid', async () => {
      component.gridDataRaw.set([...mockRecords]);
      component.filterTerm.set('rec-1');

      component.rebuildGrid();

      expect(component.gridData().length).toBe(1);
      expect(component.gridData()[0]['record-id']).toBe('rec-1');
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
  });

  describe('User Interactions and Navigation', () => {
    it('should emit record info when report link is executed', async () => {
      const emitSpy = vi.spyOn(component.onReportLinkClicked, 'emit');
      const fakeEvent = { preventDefault: vi.fn(), ctrlKey: false } as any;

      component.reportLinkEmit(fakeEvent, 'rec-1');

      expect(fakeEvent.preventDefault).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalledWith('rec-1');
    });
  });
});
