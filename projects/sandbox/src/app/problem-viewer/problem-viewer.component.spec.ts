import {
  CUSTOM_ELEMENTS_SCHEMA,
  InputSignal,
  provideZonelessChangeDetection,
  signal
} from '@angular/core';
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
    expect(component.pageData()?.isBusy).toBeTruthy();

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
          const data = component.pageData();
          if (data) {
            data.isBusy = true;
          }
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
        add: {
          imports: [MockDatasetInfoComponent],
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
      fixture.componentRef.setInput('problemPatternsRecord', {
        datasetId: '123',
        problemPatternList: mockProblemPatternsRecord
      });
      fixture.detectChanges();
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
          isShowing: signal(true)
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
      fixture.componentRef.setInput('problemPatternsDataset', mockProblemPatternsDataset);
      fixture.componentRef.setInput('pageData', { isBusy: false }); // FIX HERE

      // 2. First pass: Renders the DOM elements into the page
      // 3. Second pass: Resolves the viewChild() signal query
      fixture.detectChanges();
      await Promise.resolve();
      fixture.detectChanges();

      // 4. Now the signal should have the nativeElement
      const viewerWrapper = component.problemViewerDataset()?.nativeElement;

      // Use optional chaining for the querySelector
      const pdfViewer = viewerWrapper?.querySelector('.problem-viewer') as HTMLElement;

      if (!pdfViewer) {
        throw new Error('Signal resolved but .problem-viewer div not found in DOM.');
      }

      const listSpyAdd = vi.spyOn(pdfViewer.classList, 'add');
      vi.spyOn(component, 'getJsPDF').mockImplementation(getMockJsPDF);

      await component.exportPDF();

      expect(listSpyAdd).toHaveBeenCalledWith('pdf');

      // Advance timers for the jspdf callback logic
      await vi.advanceTimersByTimeAsync(1);
      await Promise.resolve();
      fixture.detectChanges();
    });

    it('should export the PDF (records)', async () => {
      // 1. Set the inputs via the componentRef
      fixture.componentRef.setInput('problemPatternsRecord', {
        datasetId: '123',
        problemPatternList: mockProblemPatternsRecord
      });
      fixture.componentRef.setInput('pageData', { isBusy: false } as SandboxPage);

      // 2. STABILIZE: First pass renders the @if block
      fixture.detectChanges();
      await Promise.resolve();

      // 3. STABILIZE: Second pass resolves the viewChild() signal query
      fixture.detectChanges();

      // 4. Access the CORRECT signal for the record block
      const viewer = component
        .problemViewerRecord()
        ?.nativeElement.querySelector('.problem-viewer') as HTMLElement;

      if (!viewer) {
        throw new Error(
          'Record viewer element not found. Check if template ID #problemViewerRecord is rendered.'
        );
      }

      // 5. Spies and Execution
      vi.spyOn(viewer.classList, 'add');
      vi.spyOn(viewer.classList, 'remove');
      vi.spyOn(component, 'getJsPDF').mockImplementation(getMockJsPDF);

      await component.exportPDF();

      expect(component.getJsPDF).toHaveBeenCalled();
      expect(viewer.classList.add).toHaveBeenCalledWith('pdf');

      // 6. Handle the async jspdf callback
      await vi.advanceTimersByTimeAsync(1);
      await Promise.resolve();
      fixture.detectChanges();

      expect(viewer.classList.remove).toHaveBeenCalledWith('pdf');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      configureTestbed(true);
      b4Each();
    });

    it('should initialise the http error', async () => {
      // 1. Setup signal state so the component's 'if' check passes
      fixture.componentRef.setInput('problemPatternsRecord', {
        datasetId: '123',
        problemPatternList: mockProblemPatternsRecord
      });
      fixture.detectChanges();
      await Promise.resolve();

      // 2. Start the request
      component.loadRecordLinksData('1');

      // 3. Wait for the "realistic" 1ms delay in your mock
      await vi.advanceTimersByTimeAsync(1);

      // 4. Yield so the .subscribe() error block can actually run
      await Promise.resolve();
      fixture.detectChanges();

      expect(component.httpErrorRecordLinks).toBeTruthy();
    });
  });
});
