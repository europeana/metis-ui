import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MockSandboxService, MockSandboxServiceErrors, MockSkipArrowsComponent } from '../_mocked';
import { DebiasSourceField, DebiasState } from '../_models';
import { ExportCSVService, SandboxService } from '../_services';
import { SkipArrowsComponent } from '../skip-arrows';
import { DebiasComponent } from '.';

describe('DebiasComponent', () => {
  let component: DebiasComponent;
  let fixture: ComponentFixture<DebiasComponent>;
  let exportCsv: ExportCSVService;
  let sandbox: SandboxService;

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
        {
          provide: SandboxService,
          useClass: errorMode ? MockSandboxServiceErrors : MockSandboxService
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
    sandbox = TestBed.inject(SandboxService);
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(DebiasComponent);
    component = fixture.componentInstance;
  };

  const getEvent = (): Event => {
    return ({
      stopPropagation: jasmine.createSpy()
    } as unknown) as Event;
  };

  describe('Normal Operations', () => {
    beforeEach(async(configureTestbed));
    beforeEach(b4Each);

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

    it('should resume polling after interruption', () => {
      spyOn(component, 'pollDebiasReport').and.callThrough();
      spyOn(sandbox, 'getDebiasReport');

      const report = { ...mockDebiasReport };
      report.state = DebiasState.COMPLETED;

      component.datasetId = '1';
      expect(component.pollDebiasReport).not.toHaveBeenCalled();

      component.cachedReports['2'] = report;
      component.datasetId = '2';

      expect(component.pollDebiasReport).toHaveBeenCalled();
      expect(sandbox.getDebiasReport).not.toHaveBeenCalled();

      report.state = DebiasState.PROCESSING;
      component.cachedReports['2'] = report;

      component.datasetId = '1';
      component.datasetId = '2';
      expect(component.pollDebiasReport).toHaveBeenCalledTimes(2);
      expect(sandbox.getDebiasReport).toHaveBeenCalled();
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
  });

  describe('Error Handling', () => {
    beforeEach(async(() => {
      configureTestbed(true);
    }));

    beforeEach(b4Each);

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
