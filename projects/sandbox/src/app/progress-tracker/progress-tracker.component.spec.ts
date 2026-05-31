import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

// 🚀 THE RESCUE INTERCEPT: Globally isolate internal interop streams
// to keep unseeded elements from bleeding 'undefined' values on teardown paths
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
import { MatomoService, KeycloakAuthService, UserDataService } from '../_services';
import { ModalConfirmService } from 'shared';
import { DatasetStatus, DisplayedSubsection, DisplayedTier } from '../_models';

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

    // 🚀 THE MODAL SERVICE FIX: Provide all required implementation hooks
    // to completely prevent 'this.modalConfirms.add is not a function' errors!
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

    it('should capture external outgoing routing clicks and map labels onto trackers', () => {
      component.trackExternalLink('user-manual');

      expect(mockMatomo.trackNavigation).toHaveBeenCalledWith(['external', 'user-manual']);
    });

    it('should toggle expanded details cleanly with no structural side effects', () => {
      const initialValue = component.expandedWarning();
      component.toggleExpandedWarning();

      expect(component.expandedWarning()).toBe(!initialValue);
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
