import { CUSTOM_ELEMENTS_SCHEMA, InputSignal, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HTMLWorker } from 'jspdf';
import { MockModalConfirmService, ModalConfirmService } from 'shared';
import {
  MockDatasetInfoComponent,
  mockProblemPatternsDataset,
  mockProblemPatternsRecord,
  MockSandboxService,
  MockSandboxServiceErrors
} from '../_mocked';
import {
  JSPDFType,
  ProblemPatternDescriptionBasic,
  ProblemPatternId,
  ProblemPatternSeverity,
  SandboxPage
} from '../_models';
import { SandboxService } from '../_services';
import { FormatHarvestUrlPipe } from '../_translate';
import { DatasetInfoComponent } from '../dataset-info';
import { ProblemViewerComponent } from '.';

import { vi } from 'vitest';

// Mock IntersectionObserver globally for this test suite
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
})) as any;

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

  const getMockJsPDF = (): Promise<JSPDFType> => {
    return new Promise((resolve) => {
      resolve(({
        html: fnMockPdfFromHtml,
        addFont: () => {
          component.pageData.isBusy = true;
        }
      } as unknown) as JSPDFType);
    });
  };

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [FormatHarvestUrlPipe, ProblemViewerComponent],
      providers: [
        provideZonelessChangeDetection(),
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
        add: { imports: [MockDatasetInfoComponent] },
        set: {
          schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }
      })
      .compileComponents();
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(ProblemViewerComponent);
    component = fixture.componentInstance;
    modalConfirms = TestBed.inject(ModalConfirmService);
    vi.useFakeTimers();
  };

  describe('Normal Behaviour', () => {
    beforeEach(() => {
      configureTestbed();
      b4Each();
    });

    afterAll(() => {
      vi.useRealTimers();
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
      vi.spyOn(component.openLinkEvent, 'emit');
      const event = {
        preventDefault: vi.fn(),
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
      vi.spyOn(modalConfirms, 'open').mockImplementation(() => {
        const res = of(true);
        modalConfirms.add({
          open: () => res,
          close: () => undefined,
          id: (() => '1' as unknown) as InputSignal<string>,
          isShowing: true
        });
        return res;
      });
      expect(modalConfirms.open).not.toHaveBeenCalled();
      component.showDescriptionModal(ProblemPatternId.P1);
      expect(modalConfirms.open).toHaveBeenCalled();
    });

    it('should get the jsPDF instance', async () => {
      const jspdf = await component.getJsPDF();
      expect(jspdf).toBeTruthy();
    });

    it('should export the PDF (dataset)', async () => {
      component.problemPatternsDataset = mockProblemPatternsDataset;
      component.pageData = ({
        isBusy: false
      } as unknown) as SandboxPage;
      fixture.detectChanges();
      const viewer = component.problemViewerRecord.nativeElement.querySelector(
        '.problem-viewer'
      ) as HTMLElement;
      vi.spyOn(viewer.classList, 'add');
      vi.spyOn(viewer.classList, 'remove');
      vi.spyOn(component, 'getJsPDF').mockImplementation(getMockJsPDF);
      component.exportPDF();
      expect(component.getJsPDF).toHaveBeenCalled();
      expect(viewer.classList.add).toHaveBeenCalled();
      vi.advanceTimersByTimeAsync(1);
      fixture.detectChanges();
      expect(viewer.classList.remove).toHaveBeenCalled();
    });

    it('should export the PDF (records)', async () => {
      component.problemPatternsRecord = {
        datasetId: '123',
        problemPatternList: mockProblemPatternsRecord
      };
      component.pageData = ({
        isBusy: false
      } as unknown) as SandboxPage;
      fixture.detectChanges();
      const viewer = component.problemViewerDataset.nativeElement.querySelector(
        '.problem-viewer'
      ) as HTMLElement;
      vi.spyOn(viewer.classList, 'add');
      vi.spyOn(viewer.classList, 'remove');
      vi.spyOn(component, 'getJsPDF').mockImplementation(getMockJsPDF.bind(this));
      component.exportPDF();
      expect(component.getJsPDF).toHaveBeenCalled();
      expect(viewer.classList.add).toHaveBeenCalled();
      vi.advanceTimersByTimeAsync(1);
      fixture.detectChanges();
      expect(viewer.classList.remove).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      configureTestbed(true);
      b4Each();
    });

    it('should initialise the http error', () => {
      expect(component.httpErrorRecordLinks).toBeFalsy();
      component.problemPatternsRecord = {
        datasetId: '123',
        problemPatternList: mockProblemPatternsRecord
      };
      component.loadRecordLinksData('1');
      vi.advanceTimersByTimeAsync(1);
      fixture.detectChanges();
      expect(component.httpErrorRecordLinks).toBeTruthy();
    });
  });
});
