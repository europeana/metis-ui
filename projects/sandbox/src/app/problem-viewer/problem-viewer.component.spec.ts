import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { HTMLWorker } from 'jspdf';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { MockModalConfirmService, ModalConfirmService } from 'shared';
import {
  MockDatasetInfoComponent,
  mockProblemPatternsDataset,
  mockProblemPatternsRecord,
  MockSandboxService,
  MockSandboxServiceErrors
} from '../_mocked';
import {
  ProblemPatternDescriptionBasic,
  ProblemPatternId,
  ProblemPatternSeverity,
  SandboxPage
} from '../_models';
import { SandboxService } from '../_services';
import { FormatHarvestUrlPipe } from '../_translate';
import { DatasetInfoComponent } from '../dataset-info';
import { ProblemViewerComponent } from '.';

describe('ProblemViewerComponent', () => {
  let component: ProblemViewerComponent;
  let fixture: ComponentFixture<ProblemViewerComponent>;
  let modalConfirms: ModalConfirmService;

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  const fnMockPdfFromHtml = (_: HTMLElement, ops: {}): HTMLWorker => {
    expect(component.pageData.isBusy).toBeTruthy();
    // eslint-disable-next-line no-empty-pattern
    (ops as { callback: ({}) => HTMLWorker }).callback({
      setFont: (): void => {
        // not implemented
      },
      setFontSize: (): void => {
        // not implemented
      },
      setPage: (): void => {
        // not implemented
      },
      save: (): void => {
        // not implemented
      },
      text: (): void => {
        // not implemented
      },
      internal: {
        pages: {
          length: 2
        },
        pageSize: {
          width: 1,
          height: 1
        }
      }
    });
    return ({} as unknown) as HTMLWorker;
  };

  const configureTestbed = (errorMode = false): void => {
    console.log('error mode is ' + errorMode);
    TestBed.configureTestingModule({
      imports: [FormatHarvestUrlPipe, ProblemViewerComponent],
      providers: [
        { provide: ModalConfirmService, useClass: MockModalConfirmService },
        {
          provide: SandboxService,
          useClass: errorMode ? MockSandboxServiceErrors : MockSandboxService
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .overrideComponent(ProblemViewerComponent, {
        remove: { imports: [DatasetInfoComponent] },
        add: { imports: [MockDatasetInfoComponent] }
      })
      .compileComponents();
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(ProblemViewerComponent);
    component = fixture.componentInstance;
    modalConfirms = TestBed.inject(ModalConfirmService);
  };

  describe('Normal Behaviour', () => {
    beforeEach(() => {
      configureTestbed();
      b4Each();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should decode', () => {
      const testString = 'http://it works!';
      expect(component.decode(encodeURIComponent(testString))).toEqual(testString);
    });

    it('should load the link data', () => {
      expect(component.processedRecordData).toBeFalsy();
      component.problemPatternsRecord = {
        datasetId: '123',
        problemPatternList: mockProblemPatternsRecord
      };
      component.loadRecordLinksData('1');
      expect(component.processedRecordData).toBeTruthy();
    });

    it('should open the link', () => {
      spyOn(component.openLinkEvent, 'emit');
      const event = {
        preventDefault: jasmine.createSpy(),
        ctrlKey: false
      };

      component.openLink(event, 'x');
      expect(component.openLinkEvent.emit).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();

      event.ctrlKey = true;
      component.openLink(event, 'x');
      expect(component.openLinkEvent.emit).toHaveBeenCalledTimes(1);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
    });

    it('should get the warning classmap', () => {
      const generateDescription = (
        severity: ProblemPatternSeverity
      ): ProblemPatternDescriptionBasic => {
        return ({
          problemPatternSeverity: severity
        } as unknown) as ProblemPatternDescriptionBasic;
      };

      expect(
        component.getWarningClassMap(generateDescription(ProblemPatternSeverity.WARNING)).warning
      ).toBeTruthy();

      expect(
        component.getWarningClassMap(generateDescription(ProblemPatternSeverity.ERROR)).error
      ).toBeTruthy();

      expect(
        component.getWarningClassMap(generateDescription(ProblemPatternSeverity.FATAL)).fatal
      ).toBeTruthy();

      expect(
        component.getWarningClassMap(generateDescription(ProblemPatternSeverity.NOTICE)).notice
      ).toBeTruthy();
    });

    it('should show the modal', () => {
      spyOn(modalConfirms, 'open').and.callFake(() => {
        const res = of(true);
        modalConfirms.add({ open: () => res, close: () => undefined, id: '1', isShowing: true });
        return res;
      });
      expect(modalConfirms.open).not.toHaveBeenCalled();
      component.showDescriptionModal(ProblemPatternId.P1);
      expect(modalConfirms.open).toHaveBeenCalled();
    });

    it('should export the PDF (dataset)', fakeAsync(() => {
      component.problemPatternsDataset = mockProblemPatternsDataset;
      fixture.detectChanges();
      component.pageData = ({
        isBusy: false
      } as unknown) as SandboxPage;
      spyOn(component.pdfDoc, 'html').and.callFake(fnMockPdfFromHtml);
      component.exportPDF();
      expect(component.pageData.isBusy).toBeFalsy();
      tick(1000);
    }));

    it('should export the PDF (records)', fakeAsync(() => {
      component.problemPatternsRecord = {
        datasetId: '123',
        problemPatternList: mockProblemPatternsRecord
      };
      fixture.detectChanges();
      component.pageData = ({
        isBusy: false
      } as unknown) as SandboxPage;
      spyOn(component.pdfDoc, 'html').and.callFake(fnMockPdfFromHtml);
      component.exportPDF();
      expect(component.pageData.isBusy).toBeFalsy();
      tick(1000);
    }));
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      configureTestbed(true);
      b4Each();
    });

    it('should initialise the http error', fakeAsync(() => {
      expect(component.httpErrorRecordLinks).toBeFalsy();
      component.problemPatternsRecord = {
        datasetId: '123',
        problemPatternList: mockProblemPatternsRecord
      };
      component.loadRecordLinksData('1');
      tick(1);
      expect(component.httpErrorRecordLinks).toBeTruthy();
    }));
  });
});
