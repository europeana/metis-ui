import { CUSTOM_ELEMENTS_SCHEMA, Renderer2, signal } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { of } from 'rxjs';

import { MockDebiasService, MockDebiasServiceErrors, MockSkipArrowsComponent } from '../_mocked';
import { DebiasInfo, DebiasSourceField, DebiasState } from '../_models';
import { DebiasService, ExportCSVService } from '../_services';
import { SkipArrowsComponent } from '../skip-arrows';
import { DebiasComponent } from '.';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('DebiasComponent', () => {
  let component: DebiasComponent;
  let fixture: ComponentFixture<DebiasComponent>;
  let exportCsv: ExportCSVService;
  let debias: DebiasService;
  let renderer: Renderer2;

  const mockDebiasReport = {
    'dataset-id': '4',
    'creation-date': 'now',
    state: DebiasState.PROCESSING,
    detections: [
      {
        europeanaId: `/123/4`,
        recordId: '2',
        sourceField: DebiasSourceField.DC_TITLE,
        valueDetection: {
          language: 'en',
          literal: 'once upon a time',
          tags: [
            {
              start: 13,
              end: 17,
              length: 4,
              uri: 'http://hello'
            }
          ]
        }
      }
    ]
  };

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [DebiasComponent],
      providers: [
        Renderer2,
        {
          provide: DebiasService,
          useClass: errorMode ? MockDebiasServiceErrors : MockDebiasService
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .overrideComponent(DebiasComponent, {
        remove: { imports: [SkipArrowsComponent] },
        add: { imports: [MockSkipArrowsComponent] }
      })
      .compileComponents();
    exportCsv = TestBed.inject(ExportCSVService);
    debias = TestBed.inject(DebiasService);
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(DebiasComponent);
    component = fixture.componentInstance;
    renderer = fixture.debugElement.injector.get(Renderer2);
    const testSignal = signal(({ state: DebiasState.READY } as unknown) as DebiasInfo);
    fixture.componentRef.setInput('signalDebiasInfo', testSignal);
    // Explicit initial set to guarantee required input state
    fixture.componentRef.setInput('datasetId', '0');
    fixture.detectChanges();
  };

  const getEvent = (target?: string): Event => {
    return ({
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      target
    } as unknown) as Event;
  };

  describe('Normal Operations', () => {
    beforeEach(() => {
      configureTestbed(false);
      b4Each();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('clear the error', () => {
      component.errorDetail.set('some error');
      component.clearErrorDetail();
      expect(component.errorDetail()).toBeFalsy();
    });

    it('should clear old data pollers', () => {
      vi.spyOn(component, 'clearDataPollerByIdentifier');
      fixture.componentRef.setInput('datasetId', '1');
      fixture.detectChanges();
      // First change acts as registration initialization, subsequent updates clear previous pollers
      vi.spyOn(component, 'clearDataPollerByIdentifier');
      fixture.componentRef.setInput('datasetId', '2');
      fixture.detectChanges();
      expect(component.clearDataPollerByIdentifier).toHaveBeenCalledWith('1');
    });

    it('should download the csv', () => {
      vi.spyOn(exportCsv, 'download');
      component.debiasReport.set(mockDebiasReport);
      component.csvDownload();
      expect(exportCsv.download).toHaveBeenCalled();
    });

    it('should poll the debias report', fakeAsync(() => {
      expect(component.debiasReport()).toBeFalsy();
      fixture.componentRef.setInput('datasetId', '1');
      fixture.detectChanges();
      component.pollDebiasReport();
      tick(component.apiSettings.interval);
      fixture.detectChanges();
      expect(component.debiasReport()).toBeTruthy();
    }));

    it('should poll the debias report (signalDebiasInfo update)', fakeAsync(() => {
      const report = { ...mockDebiasReport };

      vi.spyOn(debias, 'getDebiasReport').mockImplementation((_: string) => {
        return of(report);
      });

      fixture.componentRef.setInput('datasetId', '4');
      fixture.detectChanges();

      expect(Object.keys(component.cachedReports).length).toBeFalsy();

      component.pollDebiasReport();

      expect(Object.keys(component.cachedReports).length).toEqual(1);
      expect(Object.keys(component.cachedReports)[0]).toEqual(report['dataset-id']);
      expect(debias.getDebiasReport).toHaveBeenCalledTimes(1);

      report.state = DebiasState.COMPLETED;

      tick(component.apiSettings.interval);
      expect(debias.getDebiasReport).toHaveBeenCalledTimes(2);

      tick(component.apiSettings.interval);
      expect(debias.getDebiasReport).toHaveBeenCalledTimes(2);
      expect(Object.keys(component.cachedReports).length).toEqual(1);

      component.pollDebiasReport();
      tick(component.apiSettings.interval);
      expect(debias.getDebiasReport).toHaveBeenCalledTimes(2);
    }));

    it('should reset the skipArrows', () => {
      component.debiasReport.set({ ...mockDebiasReport });
      fixture.detectChanges();
      vi.spyOn(component.skipArrows, 'skipToItem');
      component.resetSkipArrows();
      expect(component.skipArrows.skipToItem).toHaveBeenCalled();

      component.skipArrows = (null as unknown) as SkipArrowsComponent;
      component.resetSkipArrows();
      expect(component.skipArrows).toBeFalsy();
    });

    it('should reset', () => {
      vi.spyOn(component, 'resetSkipArrows').mockImplementation(() => {});
      component.debiasDetailOpen.set(true);
      component.debiasHeaderOpen.set(true);
      component.reset();
      expect(component.resetSkipArrows).toHaveBeenCalled();
      expect(component.debiasDetailOpen()).toBeFalsy();
      expect(component.debiasHeaderOpen()).toBeFalsy();
    });

    it('should close the debias info', () => {
      const e = getEvent();
      component.debiasHeaderOpen.set(true);
      component.closeDebiasInfo(e);
      expect(component.debiasHeaderOpen()).toBeFalsy();
      expect(e.stopPropagation).toHaveBeenCalled();
    });

    it('should toggle the debias info', () => {
      const e = getEvent();
      component.debiasHeaderOpen.set(true);
      component.toggleDebiasInfo(e);
      expect(component.debiasHeaderOpen()).toBeFalsy();
      expect(e.stopPropagation).toHaveBeenCalledTimes(1);
      component.toggleDebiasInfo(e);
      expect(component.debiasHeaderOpen()).toBeTruthy();
      expect(e.stopPropagation).toHaveBeenCalledTimes(2);
    });

    it('should open the debias detail', () => {
      component.debiasDetailOpen.set(false);
      component.openDebiasDetail();
      expect(component.debiasDetailOpen()).toBeTruthy();
    });

    it('should close the debias detail', () => {
      component.debiasDetailOpen.set(true);
      const e = getEvent();
      component.closeDebiasDetail(e);
      expect(component.debiasDetailOpen()).toBeFalsy();
    });

    it('should close the debias detail with the keyboard', () => {
      vi.spyOn(component, 'clickInterceptor').mockImplementation(() => {});
      component.debiasDetailOpen.set(true);
      const e = getEvent();
      let focusCalled = false;
      component.debiasDetailOpener = ({
        contentEditable: false,
        focus: (): void => {
          focusCalled = true;
        }
      } as unknown) as HTMLElement;
      component.closeDebiasDetail(e, true);
      expect(focusCalled).toBeTruthy();
    });

    it('should intercept key up events', () => {
      vi.spyOn(renderer, 'removeClass');
      const e = ({
        ...getEvent(),
        key: 'Escape'
      } as unknown) as KeyboardEvent;
      component.fnKeyUp(e);
      expect(renderer.removeClass).toHaveBeenCalled();
    });

    it('should intercept key down events', () => {
      vi.spyOn(renderer, 'addClass');
      vi.spyOn(component, 'closeDebiasDetail').mockImplementation(() => {
        return true;
      });
      component.debiasDetailOpen.set(true);
      const e = ({
        ...getEvent(),
        key: 'Escape'
      } as unknown) as KeyboardEvent;
      component.fnKeyDown(e);
      expect(renderer.addClass).toHaveBeenCalled();
      expect(component.closeDebiasDetail).toHaveBeenCalled();
    });
  });
});
