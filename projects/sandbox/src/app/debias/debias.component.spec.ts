import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef, provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { DebiasComponent } from './debias.component';
import { DebiasService, ExportCSVService } from '../_services';
import { DebiasInfo, DebiasReport, DebiasState } from '../_models';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('DebiasComponent (Vitest)', () => {
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

    vi.spyOn(component, 'createNewDataPoller').mockImplementation((...args: any[]) => {
      const callback = args[3] as (report?: DebiasReport) => void;
      const mockReport: DebiasReport = {
        'dataset-id': '1234',
        'creation-date': '2026-05-20T12:00:00Z',
        state: DebiasState.COMPLETED,
        detections: []
      };
      callback(mockReport);

      return {
        subject: null,
        stopPolling: () => {},
        pausePolling: () => {},
        resumePolling: () => {}
      } as any;
    });

    vi.spyOn(component, 'clearDataPollerByIdentifier').mockImplementation(() => {});
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

  describe('Data Polling Engines', () => {
    it('should trigger report polling and map payloads straight into internal data signals', () => {
      mockDebiasService.getDebiasReport.mockReturnValue(
        of({
          'dataset-id': '1234',
          'creation-date': '2026-05-20T12:00:00Z',
          state: DebiasState.COMPLETED,
          detections: []
        })
      );

      component.pollDebiasReport();

      expect(component.debiasReport()).toBeDefined();
      expect(component.debiasReport()?.state).toBe(DebiasState.COMPLETED);
      expect(component.isBusy()).toBe(false);
    });

    it('should exit polling early if a completed report exists in cache', () => {
      const activeReport: DebiasReport = {
        'dataset-id': '1234',
        state: DebiasState.COMPLETED
      } as any;
      component.cachedReports['1234'] = activeReport;

      component.pollDebiasReport();
      expect(component.createNewDataPoller).not.toHaveBeenCalled();
      expect(component.debiasReport()).toBe(activeReport);
    });

    it('should proceed to spin up poller if cached report is not completed', () => {
      const activeReport: DebiasReport = {
        'dataset-id': '1234',
        state: DebiasState.PROCESSING
      } as any;
      component.cachedReports['1234'] = activeReport;

      component.pollDebiasReport();
      expect(component.createNewDataPoller).toHaveBeenCalled();
    });

    it('should handle custom error poller response definitions cleanly', () => {
      vi.mocked(component.createNewDataPoller).mockImplementation((...args: any[]) => {
        const errorCallback = args[4] as (err: HttpErrorResponse) => any;
        const mockError = new HttpErrorResponse({ status: 500 });

        expect(errorCallback(mockError)).toBe(mockError);
        return {} as any;
      });
      component.pollDebiasReport();
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

    it('should hide info header panels cleanly on closeDebiasInfo execution', () => {
      const stopSpy = vi.fn();
      const preventSpy = vi.fn();
      component.debiasHeaderOpen.set(true);

      component.closeDebiasInfo({ stopPropagation: stopSpy, preventDefault: preventSpy } as any);
      expect(component.debiasHeaderOpen()).toBe(false);
    });
  });

  describe('Host Listeners & Modal Modifiers', () => {
    it('should clean the body locked class on Escape keyUp events', () => {
      const spy = vi.spyOn(document.body.classList, 'remove');
      component.fnKeyUp(new KeyboardEvent('keyup', { key: 'Escape' }));
      expect(spy).toHaveBeenCalledWith('modal-locked');
    });

    it('should add the body locked class and shut the detail panel on Escape keydown events', () => {
      const spy = vi.spyOn(document.body.classList, 'add');
      const stopSpy = vi.fn();
      const preventSpy = vi.fn();

      component.debiasDetailOpen.set(true);
      component.debiasDetailOpener = document.createElement('button');

      const mockEvent = {
        key: 'Escape',
        stopPropagation: stopSpy,
        preventDefault: preventSpy
      } as any;
      component.fnKeyDown(mockEvent);

      expect(spy).toHaveBeenCalledWith('modal-locked');
      expect(component.debiasDetailOpen()).toBe(false);
    });

    it('should ignore keydown escape events if detail panels are closed', () => {
      const stopSpy = vi.fn();
      component.debiasDetailOpen.set(false);
      component.fnKeyDown({ key: 'Escape', stopPropagation: stopSpy } as any);
      expect(stopSpy).not.toHaveBeenCalled();
    });
  });

  describe('Click Interceptor & Concept Dereferencing', () => {
    let mockElement: HTMLElement;
    let mockEvent: Event;

    beforeEach(() => {
      mockElement = document.createElement('a');
      mockElement.classList.add(component.cssClassDerefLink);
      mockEvent = { preventDefault: vi.fn(), target: 'https://example.org' } as any;
    });

    it('should ignore intercepts if target elements are absent or match nothing', () => {
      expect(() => component.clickInterceptor(mockEvent, undefined)).not.toThrow();
      expect(() =>
        component.clickInterceptor(mockEvent, document.createElement('div'))
      ).not.toThrow();
    });

    it('should extract data values and open modal panels upon a successful enrichment response match', () => {
      const mockResult = {
        enrichmentBaseResultWrapperList: [
          { dereferenceStatus: 'SUCCESS', enrichmentBaseList: [{ prefLabel: 'Enriched Text' }] }
        ]
      };
      mockDebiasService.derefDebiasInfo.mockReturnValue(of(mockResult));

      component.clickInterceptor(mockEvent, mockElement);
      expect(component.debiasDetail()).toEqual({ prefLabel: 'Enriched Text' });
      expect(component.debiasDetailOpen()).toBe(true);
    });

    it('should log dereference errors correctly if the wrapper reports a non-success state', () => {
      const mockResult = {
        enrichmentBaseResultWrapperList: [
          { dereferenceStatus: 'FAILED_DEREFERENCE', enrichmentBaseList: [] }
        ]
      };
      mockDebiasService.derefDebiasInfo.mockReturnValue(of(mockResult));

      component.clickInterceptor(mockEvent, mockElement);
      expect(component.errorDetail()).toBe('Dereference Error: FAILED_DEREFERENCE');
    });

    it('should capture HTTP errors and handle error logging safely', () => {
      const mockHttpError = new HttpErrorResponse({ error: 'Fatal', status: 404 });
      mockDebiasService.derefDebiasInfo.mockReturnValue(throwError(() => mockHttpError));

      component.clickInterceptor(mockEvent, mockElement);
      expect(component.errorDetail()).toBeDefined();
    });
  });
});
