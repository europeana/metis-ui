import {
  CUSTOM_ELEMENTS_SCHEMA,
  InputSignal,
  provideZonelessChangeDetection,
  signal
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
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

  vi.mock('html2canvas', () => ({
    default: vi.fn().mockResolvedValue({
      width: 1200,
      height: 2400,
      toDataURL: () => 'data:image/jpeg;base64,fakedatastream'
    })
  }));

  vi.mock('jspdf', () => ({
    jsPDF: vi.fn().mockImplementation(() => ({
      internal: {
        pages: { length: 2 }, // FIX: Satisfies internal arrays if accessed
        pageSize: {
          getWidth: () => 595,
          getHeight: () => 842
        }
      },
      getNumberOfPages: vi.fn().mockReturnValue(1), // FIX: Standardized API method matching your loop fix
      addPage: vi.fn(),
      setPage: vi.fn(),
      setFont: vi.fn(),
      setFontSize: vi.fn(),
      text: vi.fn(),
      addImage: vi.fn(),
      save: vi.fn()
    }))
  }));

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

    it('should export the PDF (dataset)', async () => {
      vi.useRealTimers();

      fixture.componentRef.setInput('problemPatternsDataset', mockProblemPatternsDataset);
      fixture.componentRef.setInput('pageData', { isBusy: false });

      fixture.detectChanges();
      await Promise.resolve();
      fixture.detectChanges();

      const viewerWrapper = component.problemViewerDataset()?.nativeElement;
      const pdfViewer = viewerWrapper?.querySelector('.problem-viewer') as HTMLElement;

      if (!pdfViewer) {
        throw new Error('Signal resolved but .problem-viewer div not found in DOM.');
      }

      const listSpyAdd = vi.spyOn(pdfViewer.classList, 'add');
      const listSpyRemove = vi.spyOn(pdfViewer.classList, 'remove');

      vi.spyOn(component, 'createCanvasAndPdf').mockResolvedValue({
        pdfDoc: {
          internal: {
            pages: { length: 2 },
            pageSize: { getWidth: () => 595, getHeight: () => 842 }
          },
          getNumberOfPages: vi.fn().mockReturnValue(1),
          addPage: vi.fn(),
          setPage: vi.fn(),
          setFont: vi.fn(),
          setFontSize: vi.fn(),
          text: vi.fn(),
          addImage: vi.fn(),
          save: vi.fn()
        }
      });

      await component.exportPDF();

      expect(listSpyAdd).toHaveBeenCalledWith('pdf');
      expect(listSpyRemove).toHaveBeenCalledWith('pdf');
      expect(component.isBusyPDF()).toBeFalsy();
    });

    it('should export the PDF (records)', async () => {
      vi.useRealTimers();

      fixture.componentRef.setInput('problemPatternsRecord', {
        datasetId: '123',
        problemPatternList: mockProblemPatternsRecord
      });
      fixture.componentRef.setInput('pageData', { isBusy: false } as SandboxPage);

      fixture.detectChanges();
      await Promise.resolve();
      fixture.detectChanges();

      const viewer = component
        .problemViewerRecord()
        ?.nativeElement.querySelector('.problem-viewer') as HTMLElement;

      if (!viewer) {
        throw new Error('Record viewer element not found.');
      }

      const listSpyAdd = vi.spyOn(viewer.classList, 'add');
      const listSpyRemove = vi.spyOn(viewer.classList, 'remove');

      vi.spyOn(component, 'createCanvasAndPdf').mockResolvedValue({
        pdfDoc: {
          internal: {
            pages: { length: 2 },
            pageSize: { getWidth: () => 595, getHeight: () => 842 }
          },
          getNumberOfPages: vi.fn().mockReturnValue(1),
          addPage: vi.fn(),
          setPage: vi.fn(),
          setFont: vi.fn(),
          setFontSize: vi.fn(),
          text: vi.fn(),
          addImage: vi.fn(),
          save: vi.fn()
        }
      });

      await component.exportPDF();

      expect(listSpyAdd).toHaveBeenCalledWith('pdf');
      expect(listSpyRemove).toHaveBeenCalledWith('pdf');
      expect(component.isBusyPDF()).toBeFalsy();
    });

    it('should flip the affectedRecordIdsShowing state flag when toggleOccurrence is executed', () => {
      const mockOccurrence = { affectedRecordIdsShowing: false };

      component.toggleOccurrence(mockOccurrence);
      expect(mockOccurrence.affectedRecordIdsShowing).toBe(true);

      component.toggleOccurrence(mockOccurrence);
      expect(mockOccurrence.affectedRecordIdsShowing).toBe(false);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      configureTestbed(true);
      b4Each();
    });

    it('should initialise the http error', async () => {
      fixture.componentRef.setInput('problemPatternsRecord', {
        datasetId: '123',
        problemPatternList: mockProblemPatternsRecord
      });
      fixture.detectChanges();
      await Promise.resolve();

      component.loadRecordLinksData('1');
      await vi.advanceTimersByTimeAsync(1);
      await Promise.resolve();
      fixture.detectChanges();

      expect(component.httpErrorRecordLinks).toBeTruthy();
    });
  });
});
