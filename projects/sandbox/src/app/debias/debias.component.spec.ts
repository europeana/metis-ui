import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef, provideZonelessChangeDetection } from '@angular/core';
import { DebiasComponent } from './debias.component';
import { DebiasService, ExportCSVService } from '../_services';
import { DebiasInfo, DebiasReport, DebiasState } from '../_models';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('DebiasComponent (Vitest Metrics Baseline)', () => {
  let component: DebiasComponent;
  let componentRef: ComponentRef<DebiasComponent>;
  let fixture: ComponentFixture<DebiasComponent>;

  const mockDebiasService = {
    pollDebiasInfo: vi.fn(),
    getDebiasReport: vi.fn(),
    derefDebiasInfo: vi.fn()
  };

  const mockExportCSVService = {
    csvFromDebiasReport: vi.fn().mockReturnValue('mock,csv,data'),
    download: vi.fn()
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [DebiasComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: DebiasService, useValue: mockDebiasService },
        { provide: ExportCSVService, useValue: mockExportCSVService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DebiasComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('datasetId', '1234');
    componentRef.setInput('signalDebiasInfo', { state: DebiasState.INITIAL } as DebiasInfo);
  });

  describe('Core Initialization', () => {
    it('should initialize with correct default flags and signals', () => {
      expect(component).toBeTruthy();
      expect(component.debiasHeaderOpen()).toBe(false);
      expect(component.debiasDetailOpen()).toBe(false);
      expect(component.debiasReport()).toBeUndefined();
      expect(component.isBusy()).toBe(false);
    });
  });

  describe('Reset Routines', () => {
    it('should safely wipe active flags on reset', () => {
      component.debiasHeaderOpen.set(true);
      component.debiasDetailOpen.set(true);
      component.reset();
      expect(component.debiasHeaderOpen()).toBe(false);
      expect(component.debiasDetailOpen()).toBe(false);
      expect(component.debiasDetail()).toBeUndefined();
    });
  });

  describe('CSV Transformations', () => {
    it('should execute CSV compilation and invoke system downloads', () => {
      const activeReport: DebiasReport = {
        'dataset-id': '1234',
        'creation-date': '2026-05-20T12:00:00Z',
        state: DebiasState.COMPLETED,
        detections: []
      };
      component.debiasReport.set(activeReport);
      component.csvDownload();
      expect(mockExportCSVService.csvFromDebiasReport).toHaveBeenCalledWith(activeReport);
      expect(mockExportCSVService.download).toHaveBeenCalledWith(
        'mock,csv,data',
        '1234_debias_report.csv'
      );
    });
  });

  describe('View Interactions & Toggles', () => {
    it('should toggle the header view info overlay layout visibility flags', () => {
      const mockEvent = ({ stopPropagation: vi.fn(), preventDefault: vi.fn() } as unknown) as Event;
      expect(component.debiasHeaderOpen()).toBe(false);
      component.toggleDebiasInfo(mockEvent);
      expect(component.debiasHeaderOpen()).toBe(true);
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should explicitly clean up the error states', () => {
      component.errorDetail.set('Sample Network Failure Trace');
      expect(component.errorDetail()).toBe('Sample Network Failure Trace');
      component.clearErrorDetail();
      expect(component.errorDetail()).toBeUndefined();
    });
  });
});
