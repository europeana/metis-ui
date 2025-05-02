import { CUSTOM_ELEMENTS_SCHEMA, Renderer2 } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MockDebiasService, MockDebiasServiceErrors, MockSkipArrowsComponent } from '../_mocked';
import { DebiasSourceField, DebiasState } from '../_models';
import { DebiasService, ExportCSVService } from '../_services';
import { SkipArrowsComponent } from '../skip-arrows';
import { DebiasComponent } from '.';

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
  };

  const getEvent = (target?: string): Event => {
    return ({
      preventDefault: jasmine.createSpy(),
      stopPropagation: jasmine.createSpy(),
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

    it('should clear old data pollers', () => {
      spyOn(component, 'clearDataPollerByIdentifier');
      component.datasetId = '1';
      expect(component.clearDataPollerByIdentifier).not.toHaveBeenCalled();
      component.datasetId = '2';
      expect(component.clearDataPollerByIdentifier).toHaveBeenCalled();
    });

    it('should download the csv', () => {
      spyOn(exportCsv, 'download');
      component.debiasReport = mockDebiasReport;
      component.csvDownload();
      expect(exportCsv.download).toHaveBeenCalled();
    });

    it('should poll the debias report', fakeAsync(() => {
      expect(component.debiasReport).toBeFalsy();
      component.datasetId = DebiasState.COMPLETED;
      component.pollDebiasReport();
      tick(component.apiSettings.interval);
      expect(component.debiasReport).toBeTruthy();
      tick(component.apiSettings.interval);
    }));

    it('should reset the skipArrows', () => {
      component.debiasReport = { ...mockDebiasReport };
      fixture.detectChanges();
      spyOn(component.skipArrows, 'skipToItem');
      component.resetSkipArrows();
      expect(component.skipArrows.skipToItem).toHaveBeenCalled();
    });

    it('should reset', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      spyOn(component, 'resetSkipArrows').and.callFake(() => {});
      component.debiasDetailOpen = true;
      component.debiasHeaderOpen = true;
      component.reset();
      expect(component.resetSkipArrows).toHaveBeenCalled();
      expect(component.debiasDetailOpen).toBeFalsy();
      expect(component.debiasHeaderOpen).toBeFalsy();
    });

    it('should resume polling after interruption', () => {
      spyOn(component, 'pollDebiasReport').and.callThrough();
      spyOn(debias, 'getDebiasReport');

      const report = { ...mockDebiasReport };
      report.state = DebiasState.COMPLETED;

      component.datasetId = '1';
      expect(component.pollDebiasReport).not.toHaveBeenCalled();

      component.cachedReports['2'] = report;
      component.datasetId = '2';

      expect(component.pollDebiasReport).toHaveBeenCalled();
      expect(debias.getDebiasReport).not.toHaveBeenCalled();

      report.state = DebiasState.PROCESSING;
      component.cachedReports['2'] = report;

      component.datasetId = '1';
      component.datasetId = '2';
      expect(component.pollDebiasReport).toHaveBeenCalledTimes(2);
      expect(debias.getDebiasReport).toHaveBeenCalled();
    });

    it('should close the debias info', () => {
      const e = getEvent();
      component.debiasHeaderOpen = true;
      component.closeDebiasInfo(e);
      expect(component.debiasHeaderOpen).toBeFalsy();
      expect(e.stopPropagation).toHaveBeenCalled();
    });

    it('should toggle the debias info', () => {
      const e = getEvent();
      component.debiasHeaderOpen = true;
      component.toggleDebiasInfo(e);
      expect(component.debiasHeaderOpen).toBeFalsy();
      expect(e.stopPropagation).toHaveBeenCalledTimes(1);
      component.toggleDebiasInfo(e);
      expect(component.debiasHeaderOpen).toBeTruthy();
      expect(e.stopPropagation).toHaveBeenCalledTimes(2);
    });

    it('should open the debias detail', () => {
      component.debiasDetailOpen = false;
      component.openDebiasDetail();
      expect(component.debiasDetailOpen).toBeTruthy();
    });

    it('should close the debias detail', () => {
      component.debiasDetailOpen = true;
      const e = getEvent();
      component.closeDebiasDetail(e);
      expect(component.debiasDetailOpen).toBeFalsy();
    });

    it('should close the debias detail with the keyboard', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      spyOn(component, 'clickInterceptor').and.callFake(() => {});
      component.debiasDetailOpen = true;
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
      spyOn(renderer, 'removeClass');
      const e = ({
        ...getEvent(),
        key: 'Escape'
      } as unknown) as KeyboardEvent;
      component.fnKeyUp(e);
      expect(renderer.removeClass).toHaveBeenCalled();
    });

    it('should intercept key down events', () => {
      spyOn(renderer, 'addClass');
      spyOn(component, 'closeDebiasDetail').and.callFake(() => {
        return true;
      });
      const e = ({
        ...getEvent(),
        key: 'Escape'
      } as unknown) as KeyboardEvent;
      component.fnKeyDown(e);
      expect(renderer.addClass).not.toHaveBeenCalled();
      expect(component.closeDebiasDetail).not.toHaveBeenCalled();

      component.debiasDetailOpen = true;
      component.fnKeyDown(e);

      expect(renderer.addClass).toHaveBeenCalled();
      expect(component.closeDebiasDetail).toHaveBeenCalled();
    });

    it('should intercept clicks', () => {
      const classes: Array<string> = [];
      const classList = {
        contains: (name: string): boolean => {
          return classes.includes(name);
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        add: (): void => {},
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        remove: (): void => {}
      };
      spyOn(debias, 'derefDebiasInfo').and.callThrough();

      const url = 'http://some-deref-url';
      const e = getEvent(url);
      const target = ({ classList } as unknown) as HTMLElement;

      component.clickInterceptor(e, target);
      expect(debias.derefDebiasInfo).not.toHaveBeenCalled();

      component.clickInterceptor(e);
      expect(debias.derefDebiasInfo).not.toHaveBeenCalled();

      classes.push(component.cssClassDerefLink);
      component.clickInterceptor(e, target);
      expect(debias.derefDebiasInfo).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      configureTestbed(true);
      b4Each();
    });

    it('should not set the debias report on error', fakeAsync(() => {
      expect(component.debiasReport).toBeFalsy();
      component.datasetId = DebiasState.COMPLETED;
      component.pollDebiasReport();
      tick(component.apiSettings.interval);
      expect(component.debiasReport).toBeFalsy();
      tick(component.apiSettings.interval);
      expect(component.debiasReport).toBeFalsy();
    }));
  });
});
