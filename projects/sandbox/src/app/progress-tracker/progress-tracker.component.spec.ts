import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

// Globally isolate internal interop streams to prevent teardown leaks
vi.mock('@angular/core/rxjs-interop', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@angular/core/rxjs-interop')>();
  return {
    ...actual,
    toSignal: vi.fn().mockImplementation(() => {
      return signal({ id: '201', name: 'Mocked Dataset Meta' });
    }),
    toObservable: vi.fn().mockImplementation(() => {
      return of('201');
    })
  };
});

import { ProgressTrackerComponent } from './progress-tracker.component';
import { KeycloakAuthService, MatomoService, UserDataService } from '../_services';
import { ModalConfirmService } from 'shared';
import {
  DatasetStatus,
  DisplayedSubsection,
  DisplayedTier,
  ProgressByStep,
  ProgressError,
  StepStatus
} from '../_models';

describe('ProgressTrackerComponent', () => {
  let component: ProgressTrackerComponent;
  let fixture: ComponentFixture<ProgressTrackerComponent>;
  let mockMatomo: any;
  let mockModalConfirms: any;
  let mockAuthService: any;
  let mockUserDataService: any;

  const mockDatasetProgressPayload = {
    status: DatasetStatus.COMPLETED,
    'processed-records': 100,
    'progress-by-step': [
      { step: 'import', success: 10, total: 10, fail: 0, warn: 0, errors: [] },
      { step: 'validate', success: 90, total: 90, fail: 0, warn: 0, errors: [] }
    ],
    'tier-zero-info': {
      'content-tier': { total: 5, samples: ['rec1', 'rec2'] },
      'metadata-tier': { total: 0, samples: [] }
    }
  };

  beforeEach(async () => {
    mockMatomo = {
      trackNavigation: vi.fn()
    };

    mockModalConfirms = {
      open: vi.fn().mockReturnValue(of(true)),
      add: vi.fn(),
      remove: vi.fn(),
      isOpen: vi.fn().mockReturnValue(false)
    };

    mockAuthService = {
      isAuthenticated: vi.fn().mockReturnValue(true),
      login: vi.fn()
    };

    mockUserDataService = {
      getUserDatasetsPolledObservable: vi.fn().mockReturnValue(of([])),
      refreshUserDatsetPoller: vi.fn(),
      prependUserDatset: vi.fn(),
      cleanup: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ProgressTrackerComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatomoService, useValue: mockMatomo },
        { provide: ModalConfirmService, useValue: mockModalConfirms },
        { provide: KeycloakAuthService, useValue: mockAuthService },
        { provide: UserDataService, useValue: mockUserDataService }
      ]
    })
      .overrideComponent(ProgressTrackerComponent, {
        set: { templateUrl: '', styleUrls: [] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(ProgressTrackerComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('datasetId', 201);
    fixture.componentRef.setInput('datasetProgress', { ...mockDatasetProgressPayload });

    (component as any).subs = [];
    (component as any).allPollingInfo = [];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should instantiate cleanly in zoneless environment', () => {
    expect(component).toBeTruthy();
  });

  describe('Linked Signals and Computeds', () => {
    it('should fall back to PROGRESS subsection if dataset status is FAILED', async () => {
      fixture.componentRef.setInput('datasetProgress', {
        status: DatasetStatus.FAILED,
        'progress-by-step': []
      });
      fixture.detectChanges();

      expect(component.activeSubSection()).toBe(DisplayedSubsection.PROGRESS);
    });

    it('should compute tier counts correctly based on dataset progress state data maps', async () => {
      fixture.detectChanges();

      expect(component.hasContentTier()).toBe(true);
      expect(component.hasMetadataTier()).toBe(false);
      expect(component.getOrbConfigCount()).toBe(1);
    });

    it('should compute dynamic tooltips and indicators based on unseen updates', () => {
      fixture.componentRef.setInput('showing', true);
      fixture.detectChanges();

      expect(component.subNavTooltips()).toEqual([
        'Track Dataset Processing',
        'Dataset Tier Summary'
      ]);
      expect(component.subNavIndicators()).toEqual([null, null]);

      component.unseenDataProgress.set(true);
      fixture.detectChanges();

      expect(component.subNavTooltips()).toEqual([
        'Track Dataset Processing (new data loaded)',
        'Dataset Tier Summary'
      ]);
      expect(component.subNavIndicators()).toEqual(['i', null]);
    });

    it('should evaluate subNavOrbLinks block list locks based on dataset mapping identity checks', () => {
      fixture.componentRef.setInput('formValueDatasetId', 999);
      fixture.detectChanges();

      const links = component.subNavOrbLinks();
      expect(links[1].disabled).toBe(true);
      expect(links[1].tooltip).toBe('load data to unlock tier breakdown');
    });

    it('should generate popOut data layout records maps accurately on valid metrics thresholds', () => {
      fixture.detectChanges();

      expect(component.popOutTooltips()).toEqual([
        'content-tier-zero records found (click to see samples)'
      ]);
      expect(component.popOutInnerRecord()[DisplayedTier.CONTENT]).toBeDefined();
      expect(component.popOutOuterRecord()[DisplayedTier.CONTENT]).toBeDefined();
      expect(component.staticOuterRecord()).toEqual({});
    });
  });

  describe('UI Interactions and Analytics', () => {
    it('should update active section state and reset progress alerts via setActiveSubSection', () => {
      component.setActiveSubSection(DisplayedSubsection.PROGRESS);

      expect(component.activeSubSection()).toBe(DisplayedSubsection.PROGRESS);
      expect(component.unseenDataProgress()).toBe(false);
    });

    it('should emit record payload markers and track metrics on report link triggers', () => {
      const emitSpy = vi.spyOn(component.openReport, 'emit');
      component.reportLinkEmit('rec-id-123', true);

      expect(mockMatomo.trackNavigation).toHaveBeenCalledWith(['link', 'pop-out-link']);
      expect(emitSpy).toHaveBeenCalledWith({ recordId: 'rec-id-123', openMetadata: true });
    });

    it('should track navigational telemetry when firing stats link triggers', () => {
      const emitSpy = vi.spyOn(component.openReport, 'emit');
      component.reportLinkEmitFromTierStats('rec-id-456');

      expect(mockMatomo.trackNavigation).toHaveBeenCalledWith(['link', 'tier-stats-link']);
      expect(emitSpy).toHaveBeenCalledWith({ recordId: 'rec-id-456', openMetadata: false });
    });

    it('should securely process native mouse click parameter combinations during link navigation', () => {
      const mockEvent = ({ preventDefault: vi.fn(), ctrlKey: false } as unknown) as MouseEvent;
      const emitSpy = vi.spyOn(component.openReport, 'emit');

      component.reportLinkClicked(mockEvent, 'rec-id-789', false);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalledWith({ recordId: 'rec-id-789', openMetadata: false });
    });

    it('should capture external outgoing routing clicks and map labels onto trackers', () => {
      component.trackExternalLink('user-manual');

      expect(mockMatomo.trackNavigation).toHaveBeenCalledWith(['external', 'user-manual']);
    });

    it('should toggle expanded details cleanly with no structural side effects', () => {
      const initialValue = component.expandedWarning();
      component.toggleExpandedWarning();

      expect(component.expandedWarning()).toBe(!initialValue);
    });

    it('should map operational labels onto matching class tokens cleanly', () => {
      expect(component.getLabelClass('HARVEST_OAI' as StepStatus)).toBe('harvest');
    });

    it('should evaluate pipeline state loops when compiling execution status tokens', () => {
      const successfulStep: ProgressByStep = { success: 10, total: 10, fail: 0, warn: 0 } as any;
      const runningStep: ProgressByStep = { success: 5, total: 10, fail: 0, warn: 0 } as any;
      const warningStep: ProgressByStep = { success: 9, total: 10, fail: 0, warn: 1 } as any;
      const pendingStep: ProgressByStep = { success: 0, total: 0, fail: 0, warn: 0 } as any;

      expect(component.getStatusClass(successfulStep)).toBe('success');
      expect(component.getStatusClass(runningStep)).toBe('running');
      expect(component.getStatusClass(warningStep)).toBe('warn');
      expect(component.getStatusClass(pendingStep)).toBe('pending');
    });

    it('should change internal loading parameters upon request notifications', () => {
      component.handleTierLoadingChange(true);
      expect(component.isLoadingTierData()).toBe(true);
    });

    it('should assign explicit display boundaries when toggling open warning views', () => {
      component.setWarningView(0);
      expect(component.warningDisplayedTier()).toBe(DisplayedTier.CONTENT);
      // Inspect array element 0 for the content-tier opening status flag
      expect(component.warningViewOpened()[0]).toBe(true);
    });

    it('should launch step error breakdown modals upon request pass actions', () => {
      const anchorMock = document.createElement('button');
      component.showErrorsForStep(1, anchorMock, false);

      expect(component.detailIndex()).toBe(1);
      expect(mockModalConfirms.open).toHaveBeenCalledWith(
        'confirm-modal-errors',
        false,
        anchorMock
      );
    });

    it('should search nested sub-elements dynamically when searching context click anchors', () => {
      const baseNode = document.createElement('div');
      const innerWarn = document.createElement('span');
      innerWarn.className = 'warn';
      baseNode.appendChild(innerWarn);

      component.invokeFlagClick(0, baseNode);
      expect(component.detailIndex()).toBe(0);
    });

    it('should correctly format and serialize error data objects', () => {
      const errorObj: ProgressError = { message: 'operational calculation error dump' } as any;
      expect(component.formatError(errorObj)).toContain('operational calculation error dump');
    });
  });

  describe('Asynchronous Layout Handling', () => {
    it('should schedule view closures safely using setTimeout boundaries', async () => {
      fixture.componentRef.setInput('showing', true);
      component.warningDisplayedTier.set(DisplayedTier.CONTENT);

      component.closeWarningView();

      await new Promise((resolve) => setTimeout(resolve, 450));

      expect(component.warningDisplayedTier()).toBe(DisplayedTier.NONE);
    });
  });
});
