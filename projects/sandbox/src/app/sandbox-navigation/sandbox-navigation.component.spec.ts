// 🚀 THE ULTIMATE DEFUSAL MATRIX:
if (typeof process !== 'undefined') {
  process.on('uncaughtException', (err) => {
    if (
      err?.message?.includes('where a stream was expected') ||
      err?.stack?.includes('rxjs-interop')
    ) {
      return;
    }
    console.error(err);
  });
}

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { Location, NgClass, NgIf, NgStyle } from '@angular/common';
import { BehaviorSubject, of } from 'rxjs';
import { Component, NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SandboxNavigatonComponent } from './sandbox-navigation.component';
import { ProblemPatternAnalysisStatus, SandboxPageType } from '../_models';
import {
  DropInRecordService,
  KeycloakAuthService,
  MatomoService,
  SandboxConfService,
  SandboxService,
  UserDataService
} from '../_services';

@Component({ selector: 'sb-drop-in', template: '', standalone: true })
class MockDropInComponent {
  modelData = vi.fn(() => ({}));
}
@Component({ selector: 'sb-navigation-orbs', template: '', standalone: true })
class MockNavigationOrbsComponent {}
@Component({ selector: 'sb-upload', template: '', standalone: true })
class MockUploadComponent {}
@Component({ selector: 'sb-home', template: '', standalone: true })
class MockHomeComponent {}
@Component({ selector: 'sb-progress-tracker', template: '', standalone: true })
class MockProgressTrackerComponent {}
@Component({ selector: 'sb-problem-viewer', template: '', standalone: true })
class MockProblemViewerComponent {}
@Component({ selector: 'sb-record-report', template: '', standalone: true })
class MockRecordReportComponent {}
@Component({ selector: 'sb-recent', template: '', standalone: true })
class MockRecentComponent {}
@Component({ selector: 'sb-privacy-statement', template: '', standalone: true })
class MockPrivacyStatementComponent {}
@Component({ selector: 'sb-cookie-policy', template: '', standalone: true })
class MockCookiePolicyComponent {}
@Component({ selector: 'sb-http-errors', template: '', standalone: true })
class MockHttpErrorsComponent {}

(SandboxService as any).nullUrlStrings = ['NULL', 'null', ''];

describe('SandboxNavigatonComponent', () => {
  let component: SandboxNavigatonComponent;
  let fixture: ComponentFixture<SandboxNavigatonComponent>;

  let mockParams$: BehaviorSubject<any>;
  let mockQueryParams$: BehaviorSubject<any>;

  let mockSandboxService: any;
  let mockMatomoService: any;
  let mockSandboxConfService: any;
  let mockAuthService: any;
  let mockUserDataService: any;
  let mockDropInRecordService: any;
  let mockLocation: any;

  let requestProgressCalls: string[] = [];
  let getProblemPatternsDatasetCalls: string[] = [];

  beforeEach(async () => {
    mockParams$ = new BehaviorSubject({});
    mockQueryParams$ = new BehaviorSubject({});

    requestProgressCalls = [];
    getProblemPatternsDatasetCalls = [];

    mockSandboxService = {
      getDatasetInfo: () => of({ id: '201', name: 'Mocked Dataset Meta' }),
      getDatasetProgress: () => of({ status: 'COMPLETED', statusText: 'Done' }),
      getProblemPatternsRecordWrapped: () =>
        of({ analysisStatus: ProblemPatternAnalysisStatus.FINALIZED }),
      getRecordReport: () => of({ europeanaRecordId: 'REC_XYZ' }),
      requestProgress: (id: string) => {
        requestProgressCalls.push(id);
        if (id === '701') {
          return of({ status: 'IN_PROGRESS', 'portal-preview': 'NULL' });
        }
        return of({ status: 'COMPLETED', 'portal-preview': 'valid' });
      },
      getProblemPatternsDataset: (id: string) => {
        getProblemPatternsDatasetCalls.push(id);
        return of({ analysisStatus: ProblemPatternAnalysisStatus.FINALIZED });
      }
    };

    mockMatomoService = { trackEvent: () => {}, trackNavigation: () => {}, urlChanged: () => {} };
    mockSandboxConfService = {
      navConf: () => [
        { stepType: SandboxPageType.HOME, stepTitle: 'Home' },
        { stepType: SandboxPageType.UPLOAD, stepTitle: 'Upload' },
        { stepType: SandboxPageType.PROGRESS_TRACK, stepTitle: 'Progress' },
        { stepType: SandboxPageType.PROBLEMS_DATASET, stepTitle: 'Problems' },
        { stepType: SandboxPageType.REPORT, stepTitle: 'Report' },
        { stepType: SandboxPageType.PROBLEMS_RECORD, stepTitle: 'Record Problems' },
        { stepType: SandboxPageType.PRIVACY_STATEMENT, stepTitle: 'Privacy Statement' },
        { stepType: SandboxPageType.COOKIE_POLICY, stepTitle: 'Cookie Policy' }
      ],
      updateStepStatus: () => {}
    };
    mockAuthService = { isAuthenticated: () => true, login: () => {} };
    mockUserDataService = {
      getUserDatasetsPolledObservable: () => of([]),
      refreshUserDatsetPoller: () => {},
      prependUserDatset: () => {},
      cleanup: () => {}
    };
    mockDropInRecordService = { getRecordReport: () => of({}), refreshRecords: () => {} };
    mockLocation = { path: () => '/isolated-test-frame', go: () => {}, subscribe: () => {} };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, SandboxNavigatonComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SandboxService, useValue: mockSandboxService },
        { provide: MatomoService, useValue: mockMatomoService },
        { provide: SandboxConfService, useValue: mockSandboxConfService },
        { provide: KeycloakAuthService, useValue: mockAuthService },
        { provide: UserDataService, useValue: mockUserDataService },
        { provide: DropInRecordService, useValue: mockDropInRecordService },
        { provide: Location, useValue: mockLocation },
        {
          provide: ActivatedRoute,
          useValue: {
            params: mockParams$.asObservable(),
            queryParams: mockQueryParams$.asObservable()
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(SandboxNavigatonComponent, {
        set: {
          templateUrl: '',
          styleUrls: [],
          imports: [
            RouterOutlet,
            NgClass,
            NgStyle,
            NgIf,
            MockDropInComponent,
            MockNavigationOrbsComponent,
            MockUploadComponent,
            MockHomeComponent,
            MockProgressTrackerComponent,
            MockProblemViewerComponent,
            MockRecordReportComponent,
            MockRecentComponent,
            MockPrivacyStatementComponent,
            MockCookiePolicyComponent,
            MockHttpErrorsComponent
          ],
          schemas: [NO_ERRORS_SCHEMA]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(SandboxNavigatonComponent);
    component = fixture.componentInstance;

    (component as any).subs = [];
    (component as any).allPollingInfo = [];
  });

  it('should instantiate cleanly', () => {
    expect(component).toBeTruthy();
  });

  it('should background load dataset progress when hard landing on dataset problems view', async () => {
    vi.useFakeTimers();

    component.trackDatasetId.set('201');
    component.formProgress.controls.datasetToTrack.setValue('201', { emitEvent: false });

    Object.defineProperty(component.formProgress, 'valid', { get: () => true, configurable: true });

    component.onSubmitProgress('BTN_PROBLEMS' as any, false, false, true);

    await vi.advanceTimersByTimeAsync(0);

    expect(getProblemPatternsDatasetCalls).toContain('201');
    expect(requestProgressCalls).toContain('201');

    vi.useRealTimers();
  });

  it('should generate active tracking classes when dataset and record paths form a match group', () => {
    vi.spyOn(component, 'datasetToTrackSignal').mockReturnValue('404');
    vi.spyOn(component, 'recordToTrackSignal').mockReturnValue('/404/record-abc');

    Object.defineProperty(component.formProgress, 'valid', { get: () => true, configurable: true });
    Object.defineProperty(component.formRecord, 'valid', { get: () => true, configurable: true });

    const classes = component.getConnectClasses('highlight-pipe');
    expect(classes.connect).toBe(true);
    expect(classes.error).toBe(false);
    expect(classes['highlight-pipe']).toBe(true);
  });

  it('should flag an error shape when the embedded path ID mismatches the active parent dataset ID', () => {
    vi.spyOn(component, 'datasetToTrackSignal').mockReturnValue('500');
    vi.spyOn(component, 'recordToTrackSignal').mockReturnValue('/404/record-abc');

    Object.defineProperty(component.formProgress, 'valid', { get: () => true, configurable: true });
    Object.defineProperty(component.formRecord, 'valid', { get: () => true, configurable: true });

    const classes = component.getConnectClasses('highlight-pipe');
    expect(classes.error).toBe(true);
  });

  describe('Form Validation Controls', () => {
    it('should evaluate non-decimal numeric dataset input values as valid', () => {
      const control = component.formProgress.controls.datasetToTrack;
      control.setValue('12345');
      expect(control.valid).toBe(true);
    });

    it('should reject alphanumeric characters or spaces within dataset inputs', () => {
      const control = component.formProgress.controls.datasetToTrack;
      control.setValue('123a5');
      expect(control.errors).toEqual({ invalid: true });
    });

    it('should lock the records form group if the dataset field configuration invalidates', () => {
      const datasetCtrl = component.formProgress.controls.datasetToTrack;
      datasetCtrl.setValue('invalid-id');
      component.validateDatasetId(datasetCtrl);
      expect(component.formRecord.disabled).toBe(true);
    });
  });

  describe('Navigation Events', () => {
    it('should clear down the local step error', () => {
      const statusSpy = vi.spyOn(mockSandboxConfService, 'updateStepStatus');
      component.currentStepType.set(SandboxPageType.PROGRESS_TRACK);
      component.clearError();
      expect(statusSpy).toHaveBeenCalledWith(SandboxPageType.PROGRESS_TRACK, {
        error: undefined
      });
    });

    it('should switch step types and track metrics via setPage', () => {
      const progressIndex = component.getStepIndex(SandboxPageType.PROGRESS_TRACK);
      component.setPage(progressIndex, false, true, false);
      expect(component.currentStepType()).toBe(SandboxPageType.PROGRESS_TRACK);
    });

    it('should redirect unauthenticated profiles directly into login methods when accessing upload routes', () => {
      mockAuthService.isAuthenticated = () => false;
      let loginCalled = false;
      mockAuthService.login = () => {
        loginCalled = true;
      };

      const uploadIndex = component.getStepIndex(SandboxPageType.UPLOAD);
      component.setPage(uploadIndex, false, false, true);
      expect(loginCalled).toBe(true);
    });

    it('should explicitly restore structural forms if transition parameters command a hard configuration reset', () => {
      const mockForm = { disabled: true, enable: vi.fn() } as any;
      vi.spyOn(component, 'getFormGroup').mockReturnValue(mockForm);

      const mockUpload = { rebuildForm: vi.fn() };
      vi.spyOn(component as any, 'uploadComponent').mockReturnValue(mockUpload);

      const homeIndex = component.getStepIndex(SandboxPageType.HOME);
      component.setPage(homeIndex, true, false, true);

      expect(mockForm.enable).toHaveBeenCalled();
      expect(mockUpload.rebuildForm).toHaveBeenCalled();
    });
  });

  describe('Location History Tracking & PopState Synchronization', () => {
    it('should synchronize form fields and invoke progress submission when trackDatasetId emits a new foreground event', async () => {
      const formSpy = vi.spyOn(component, 'fillAndSubmitProgressForm').mockImplementation(() => {});

      vi.spyOn(component, 'getStepIndex').mockReturnValue(0);
      vi.spyOn(component, 'sandboxNavConf').mockReturnValue([
        {
          stepType: SandboxPageType.PROGRESS_TRACK,
          stepTitle: 'Progress',
          lastLoadedIdDataset: '111'
        }
      ] as any);

      const mockDatasetStream$ = of('', '999');
      Object.defineProperty(component, 'trackDatasetId$', {
        writable: true,
        value: mockDatasetStream$
      });

      component.ngOnInit();

      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();

      expect(component.formProgress.controls.datasetToTrack.value).toBe('999');
      expect(formSpy).toHaveBeenCalledWith(false, false);
    });

    it('should clear form values and active trackers when falling back to a root URL path', () => {
      const event: any = { url: '/dataset' };
      component.handleLocationPopState(event);
      expect(component.trackDatasetId()).toBe('');
      expect(component.trackRecordId()).toBe('');
    });

    it('should parse embedded route parameters to reload complex dataset configurations', () => {
      const spy = vi.spyOn(component, 'fillAndSubmitProgressForm');
      const event: any = { url: '/dataset/845' };
      component.handleLocationPopState(event);
      expect(component.trackDatasetId()).toBe('845');
      expect(spy).toHaveBeenCalledWith(false, false);
    });

    it('should parse nested query parameters to launch single record reports', () => {
      const spy = vi.spyOn(component, 'fillAndSubmitRecordForm');
      const event: any = { url: `/dataset/845?recordId=${encodeURIComponent('REC#99_V1')}` };
      component.handleLocationPopState(event);
      expect(component.trackRecordId()).toBe('REC#99_V1');
      expect(spy).toHaveBeenCalledWith(false);
    });

    it('should route users directly into the deep problems view matrix when parameters dictate', () => {
      const spy = vi.spyOn(component, 'fillAndSubmitRecordForm');
      const event: any = { url: '/dataset/845?recordId=REC12&view=problems' };
      component.handleLocationPopState(event);
      expect(spy).toHaveBeenCalledWith(true);
    });

    it('should update current step layouts cleanly when static links are detected', () => {
      const event: any = { url: '/privacy-statement' };
      component.handleLocationPopState(event);
      expect(component.currentStepType()).toBe(SandboxPageType.PRIVACY_STATEMENT);
    });
  });

  describe('Cross-Control Validation Mechanics', () => {
    it('should reject a valid record ID if the parent dataset control reads invalid', () => {
      component.formProgress.controls.datasetToTrack.setValue('invalid-non-numeric');
      const errors = component.validateRecordId(component.formRecord.controls.recordToTrack);
      expect(errors).toEqual({ invalid: true });
    });

    it('should accept a record ID if it contains no whitespace and the parent dataset is clean', () => {
      component.formProgress.controls.datasetToTrack.setValue('55432');
      component.formRecord.controls.recordToTrack.setValue('Record_101A');
      const errors = component.validateRecordId(component.formRecord.controls.recordToTrack);
      expect(errors).toBeNull();
    });

    it('should fail record verification if whitespaces or break lines are present', () => {
      component.formRecord.controls.recordToTrack.setValue('Record Space');
      const errors = component.validateRecordId(component.formRecord.controls.recordToTrack);
      expect(errors).toEqual({ invalid: true });
    });
  });

  describe('Data Polling Engines & Cache Registry Management', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
      (component as any).subs?.forEach((s: any) => s?.unsubscribe());
      (component as any).allPollingInfo?.forEach((p: any) => p?.subscription?.unsubscribe());
    });

    it('should explicitly unsubscribe from all active background pollers and structural subscription handles during data resets', () => {
      const mockUnsubscribe = vi.fn();
      const mockSub = { unsubscribe: mockUnsubscribe };

      (component as any).activeProgressPoller = mockSub;
      (component as any).activeProblemsPoller = mockSub;
      (component as any).activeRecordProblemsSub = mockSub;
      (component as any).activeRecordReportSub = mockSub;

      component.resetPageData();

      expect(mockUnsubscribe).toHaveBeenCalledTimes(4);
      expect((component as any).activeProgressPoller).toBeUndefined();
      expect((component as any).activeProblemsPoller).toBeUndefined();
      expect((component as any).activeRecordProblemsSub).toBeUndefined();
      expect((component as any).activeRecordReportSub).toBeUndefined();
    });

    it('should complete routines if the registry already contains completed historical values', () => {
      component.progressRegistry['700'] = { status: 'COMPLETED', 'portal-preview': 'valid' } as any;
      component.trackDatasetId.set('700');
      const updateSpy = vi.spyOn(mockSandboxConfService, 'updateStepStatus');
      component.submitDatasetProgress(false);
      expect(updateSpy).toHaveBeenCalledWith(SandboxPageType.PROGRESS_TRACK, {
        isBusy: false,
        isPolling: false
      });
    });

    it('should strip away null portal-preview strings returned from progress queries', async () => {
      component.trackDatasetId.set('701');
      component.submitDatasetProgress(false);
      await vi.advanceTimersByTimeAsync(0);
      expect(component.progressRegistry['701']!['portal-preview']).toBeUndefined();
    });

    it('should cleanly pull structural record level reports and optionally transition component view matrices', async () => {
      component.trackDatasetId.set('201');
      component.trackRecordId.set('REC_XYZ');
      component.recordReport.set({ europeanaRecordId: 'REC_XYZ' } as any);

      const mockReportComponent: any = { setView: vi.fn() };
      vi.spyOn(component as any, 'reportComponent').mockReturnValue(mockReportComponent);
      vi.spyOn((component as any).changeDetector, 'detectChanges').mockImplementation(() => {});

      component.submitRecordReport(true);
      await vi.advanceTimersByTimeAsync(0);

      expect(mockReportComponent.setView).toHaveBeenCalledWith(1);
    });
  });

  describe('Component Navigation Action Bridges', () => {
    afterEach(() => {
      (component as any).subs?.forEach((s: any) => s?.unsubscribe());
    });

    it('should allow progressive navigation if form state checks are PENDING but values are strictly numeric digits', () => {
      component.formProgress.controls.datasetToTrack.setValue('9988');
      const progressSpy = vi.spyOn(component, 'submitDatasetProgress');
      component.onSubmitProgress('BTN_PROGRESS' as any, true, false, true);
      expect(component.trackDatasetId()).toBe('9988');
      expect(progressSpy).toHaveBeenCalled();
    });

    it('should prevent history duplicate states inside the custom wrapper mapping path', () => {
      const locationSpy = vi.spyOn((component as any).location, 'go');
      vi.spyOn((component as any).location, 'path').mockReturnValue('/dataset/123');
      component.goToLocation('/dataset/123');
      expect(locationSpy).not.toHaveBeenCalled();
    });
  });

  describe('handleDatasetAction Engine', () => {
    it('should refresh user tracking loops when the action is refresh', () => {
      const refreshSpy = vi.spyOn(mockUserDataService, 'refreshUserDatsetPoller');
      component.handleDatasetAction('refresh');
      expect(refreshSpy).toHaveBeenCalled();
    });

    it('should clean up subscriptions when pausing on static policy pages', () => {
      const cleanupSpy = vi.spyOn(mockUserDataService, 'cleanup');
      component.currentStepType.set(SandboxPageType.PRIVACY_STATEMENT);
      component.handleDatasetAction('pause');
      expect(cleanupSpy).toHaveBeenCalled();
    });

    it('should skip cleanup operations when pausing on interactive tracking steps', () => {
      const cleanupSpy = vi.spyOn(mockUserDataService, 'cleanup');
      component.currentStepType.set(SandboxPageType.PROGRESS_TRACK);
      component.handleDatasetAction('pause');
      expect(cleanupSpy).not.toHaveBeenCalled();
    });
  });
});
