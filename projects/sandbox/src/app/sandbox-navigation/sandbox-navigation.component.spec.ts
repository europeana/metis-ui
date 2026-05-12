import { provideZonelessChangeDetection } from '@angular/core';
import { setupZonelessTestEnv } from '@angular/core/testing';

import { Location, PopStateEvent } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl
  //, ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Params, provideRouter } from '@angular/router';
import { MatomoTracker } from 'ngx-matomo-client';

import { MockBuilder, MockInstance, MockReset } from 'ng-mocks';

import { BehaviorSubject, of, throwError } from 'rxjs';

import Keycloak from 'keycloak-js';
import { mockedKeycloak } from 'shared';
import { KEYCLOAK_EVENT_SIGNAL
  //, KeycloakEvent
 } from 'keycloak-angular';

import { apiSettings } from '../../environments/apisettings';
import {
  mockDataset,
  //mockedMatomoTracker,
  mockProblemPatternsDataset,
  mockProblemPatternsRecord,
  mockRecordReport
} from '../_mocked';


import {
  DatasetStatus,
  ProblemPatternAnalysisStatus,
  ProblemPatternsDataset,
  SandboxPage,
  SandboxPageType
} from '../_models';
import {
  //DropInRecordService,
  SandboxService
  //, UserDataService
} from '../_services';
import { FormatHarvestUrlPipe } from '../_translate';
//import { DatasetInfoComponent } from '../dataset-info';
//import { DropInComponent } from '../drop-in';
//import { ProgressTrackerComponent } from '../progress-tracker';
//import { ProblemViewerComponent } from '../problem-viewer';
//import { RecordReportComponent } from '../record-report';
import { SandboxNavigatonComponent } from '.';
//import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SandboxNavigatonComponent', () => {
  let component: SandboxNavigatonComponent;
  let fixture: ComponentFixture<SandboxNavigatonComponent>;
  let sandbox: SandboxService;
  let location: Location;
  let keycloak: Keycloak;

  const params = new BehaviorSubject({} as Params);
  const queryParams = new BehaviorSubject({} as Params);

  const stepIndexHome = 0;
  const stepIndexUpload = 1;
  const stepIndexTrack = 2;
  const stepIndexProblemsDataset = 3;
  const stepIndexReport = 4;
  const stepIndexProblemsRecord = 5;
  const stepIndexPrivacy = 6;
  const stepIndexCookie = 7;

  const setFormValueDataset = (val: string): void => {
    component.formProgress.controls.datasetToTrack.setValue(val);
  };

  const setFormValueRecord = (val: string): void => {
    component.formRecord.controls.recordToTrack.setValue(val);
  };

  const configureTestbed = async (errorMode = false): Promise<void> => {


    await MockBuilder(SandboxNavigatonComponent, SandboxNavigatonComponent)
      .keep(FormatHarvestUrlPipe)
      // provide modern equivalents instead of keeping modules
      .provide(provideRouter([]))
      .provide(provideHttpClient())
      .provide(provideHttpClientTesting())
      .provide(provideZonelessChangeDetection())
      .provide({ provide: KEYCLOAK_EVENT_SIGNAL, useValue: () => ({}) })
      .provide({ provide: ActivatedRoute, useValue: { params, queryParams } })
      .provide({ provide: MatomoTracker, useValue: {} })
      .build();
    /*
    await MockBuilder(SandboxNavigatonComponent, SandboxNavigatonComponent)
      .keep(ReactiveFormsModule)
      .keep(FormatHarvestUrlPipe)
      .provide(provideRouter([]))
      .provide({ provide: KEYCLOAK_EVENT_SIGNAL, useValue: () => ({}) })
      .provide({ provide: ActivatedRoute, useValue: { params, queryParams } })
      .provide({ provide: MatomoTracker, useValue: {} }) // Mocked simply
      .provide(provideZonelessChangeDetection())
      .build();
      */

    if (errorMode) {
      MockInstance(SandboxService, {
        init: () => ({
          getRecordReport: () => throwError(() => 'err'),
          getDatasetInfo: () => throwError(() => 'err'),
          requestProgress: () => throwError(() => 'err')
        } as any) // as any allows the partial object
      });
    } else {
      MockInstance(SandboxService, {
          init: () => ({
            getRecordReport: () => of(mockRecordReport),
            getDatasetInfo: () => of(mockDataset),
            requestProgress: () => of({}),
            getProblemPatternsRecord: () => of(mockProblemPatternsRecord),
            getProblemPatternsDataset: () => of(mockProblemPatternsDataset),
            getDatasetRecords: () => of([]),
            requestDatasetInfo: () => of(mockDataset)
          } as any)
        });
    }

    fixture = TestBed.createComponent(SandboxNavigatonComponent);
    component = fixture.componentInstance;

    sandbox = TestBed.inject(SandboxService);
    location = TestBed.inject(Location);
    keycloak = TestBed.inject(Keycloak);
  };


  const b4Each = (): void => {
    fixture = TestBed.createComponent(SandboxNavigatonComponent);
    component = fixture.componentInstance;
    params.next({});
    fixture.detectChanges();
    vi.useFakeTimers();
  };


  describe('Change-detection operations', () => {
    beforeEach(() => {
      configureTestbed();
      b4Each();
      keycloak.authenticated = true;
    });

    afterEach(() => {
      MockReset();
      fixture.destroy(); // This should trigger ngOnDestroy and clear subs
      vi.clearAllTimers();
      vi.useRealTimers();
    });

    it('should dynamically add the ProblemViewerRecord ViewChild', async () => {
      expect(component.problemViewerRecord()).toBeFalsy();

      // 1. Set the state
      const id = '1';
      component.trackRecordId = id;
      component.problemPatternsRecord = {
        datasetId: id,
        problemPatternList: mockProblemPatternsRecord
      };

      // 2. Trigger the logic
      component.submitRecordProblemPatterns();

      // 3. The Zoneless "Double-Tap"
      // First, flush the microtasks (Observable/Signal updates)
      await Promise.resolve();
      // Second, trigger detection to render the DOM so ViewChild can find the component
      fixture.detectChanges();

      expect(component.problemViewerRecord()).toBeTruthy();
      expect(component.problemViewerRecord()?.recordId).toEqual(id);
    });

    it('should dynamically add the ReportComponent ViewChild', async () => {
      expect(component.reportComponent()).toBeFalsy();
      component.trackDatasetId = '1';
      component.trackRecordId = '1';
      component.recordReport = mockRecordReport;
      setFormValueRecord('2');
      expect(component.reportComponent()).toBeFalsy();
      component.submitRecordReport(true);
      vi.advanceTimersByTimeAsync(1);
      fixture.detectChanges();
      expect(component.reportComponent()).toBeTruthy();
    });
  });

  describe('Normal operations', () => {
    beforeEach(() => {
      configureTestbed();
      b4Each();
      keycloak.authenticated = true;
      vi.useFakeTimers();
    });

    afterEach(() => {
      MockReset();
      fixture.destroy();
      vi.clearAllTimers();
      vi.useRealTimers();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should clear pollers when the trackDatasetId is set', () => {
      vi.spyOn(component, 'clearDataPollerByIdentifier');
      component.trackDatasetId = '12';
      expect(component.clearDataPollerByIdentifier).toHaveBeenCalled();
    });

    it('should subscribe to parameter changes', async () => {
      expect(component.trackDatasetId).toBeFalsy();
      params.next({ id: '1' });
      await Promise.resolve();
      vi.advanceTimersByTimeAsync(1);
      fixture.detectChanges();

      expect(component.trackDatasetId).toBeTruthy();
      expect(component.trackRecordId).toBeFalsy();

      queryParams.next({ view: 'problems' });
      vi.advanceTimersByTimeAsync(1);
      await Promise.resolve();
      fixture.detectChanges();

      expect(component.trackDatasetId).toBeTruthy();
      expect(component.trackRecordId).toBeFalsy();

      queryParams.next({ recordId: '2' });
      vi.advanceTimersByTimeAsync(1);
      await Promise.resolve();
      fixture.detectChanges();

      expect(component.trackDatasetId).toBeTruthy();
      expect(component.trackRecordId).toBeTruthy();

      params.next({ id: '1' });
      await Promise.resolve();
      fixture.detectChanges();

      queryParams.next({ recordId: '2', view: 'problems' });
      vi.advanceTimersByTimeAsync(1);
      await Promise.resolve();
      fixture.detectChanges();

      expect(component.trackDatasetId).toBeTruthy();
      expect(component.trackRecordId).toBeTruthy();

      component.cleanup();
      vi.advanceTimersByTimeAsync(apiSettings.interval);
    });

    it('should subscribe to url changes', async () => {
      location.go('/new');
      params.next({});
      vi.advanceTimersByTimeAsync(1);
      await Promise.resolve();
      fixture.detectChanges();
      expect(component.currentStepIndex).toEqual(1);

      location.go('/privacy-statement');
      params.next({});
      vi.advanceTimersByTimeAsync(1);
      await Promise.resolve();
      fixture.detectChanges();
      expect(component.currentStepIndex).toEqual(6);

      location.go('/cookie-policy');
      params.next({});
      vi.advanceTimersByTimeAsync(1);
      await Promise.resolve();
      fixture.detectChanges();
      expect(component.currentStepIndex).toEqual(7);

      location.go('/dataset');
      params.next({});
      vi.advanceTimersByTimeAsync(1);
      await Promise.resolve();
      fixture.detectChanges();
      expect(component.currentStepIndex).toEqual(2);

      component.cleanup();
      vi.advanceTimersByTimeAsync(apiSettings.interval);
    });

    it('should get if a step is an indicator', () => {
      expect(component.getStepIsIndicator(stepIndexHome)).toBeFalsy();
      expect(component.getStepIsIndicator(stepIndexTrack)).toBeFalsy();
      component.progressData = structuredClone(mockDataset);
      setFormValueDataset('1');
      fixture.detectChanges();

      expect(component.getStepIsIndicator(stepIndexTrack)).toBeFalsy();
      component.sandboxNavConf[stepIndexTrack].lastLoadedIdDataset = '1';
      expect(component.getStepIsIndicator(stepIndexTrack)).toBeTruthy();

      expect(component.getStepIsIndicator(stepIndexProblemsDataset)).toBeFalsy();
      component.problemPatternsDataset = mockProblemPatternsDataset;
      expect(component.getStepIsIndicator(stepIndexProblemsDataset)).toBeFalsy();
      component.sandboxNavConf[stepIndexProblemsDataset].lastLoadedIdDataset = '1';
      expect(component.getStepIsIndicator(stepIndexProblemsDataset)).toBeTruthy();

      expect(component.getStepIsIndicator(stepIndexReport)).toBeFalsy();
      component.recordReport = mockRecordReport;
      expect(component.getStepIsIndicator(stepIndexReport)).toBeFalsy();
      component.sandboxNavConf[stepIndexReport].lastLoadedIdDataset = '1';
      component.sandboxNavConf[stepIndexReport].lastLoadedIdRecord = '2';
      expect(component.getStepIsIndicator(stepIndexReport)).toBeFalsy();
      setFormValueRecord('2');
      expect(component.getStepIsIndicator(stepIndexReport)).toBeTruthy();

      expect(component.getStepIsIndicator(stepIndexProblemsRecord)).toBeFalsy();
      component.problemPatternsRecord = {
        datasetId: '1',
        problemPatternList: mockProblemPatternsRecord
      };
      expect(component.getStepIsIndicator(stepIndexProblemsRecord)).toBeFalsy();
      component.sandboxNavConf[stepIndexProblemsRecord].lastLoadedIdDataset = '1';
      component.sandboxNavConf[stepIndexProblemsRecord].lastLoadedIdRecord = '2';
      expect(component.getStepIsIndicator(stepIndexProblemsRecord)).toBeTruthy();

      keycloak.authenticated = false;
      expect(component.getStepIsIndicator(stepIndexUpload)).toBeTruthy();
      keycloak.authenticated = true;
      expect(component.getStepIsIndicator(stepIndexUpload)).toBeFalsy();
    });

    it('should get the connect classes', () => {
      let cClasses = component.getConnectClasses('top');
      expect(cClasses.error).toBeFalsy();
      setFormValueDataset('1');
      fixture.detectChanges();
      cClasses = component.getConnectClasses('top');
      expect(cClasses.error).toBeFalsy();
      expect(cClasses.top).toBeFalsy();

      setFormValueRecord('/1/23');
      fixture.detectChanges();
      cClasses = component.getConnectClasses('top');
      expect(cClasses.error).toBeFalsy();
      expect(cClasses.top).toBeTruthy();

      setFormValueDataset('2');
      fixture.detectChanges();
      cClasses = component.getConnectClasses('top');
      expect(cClasses.error).toBeTruthy();
      expect(cClasses.top).toBeTruthy();

      setFormValueRecord('/2/23');
      fixture.detectChanges();
      cClasses = component.getConnectClasses('top');
      expect(cClasses.error).toBeFalsy();
      expect(cClasses.top).toBeTruthy();

      setFormValueRecord('/BBB/23');
      fixture.detectChanges();
      cClasses = component.getConnectClasses('top');
      expect(cClasses.error).toBeFalsy();
      expect(cClasses.top).toBeFalsy();
    });

    it('should update the location', () => {
      let location = '';
      const datasetId = '1';
      const recordId = '2';

      vi.spyOn(component, 'goToLocation').mockImplementation((path: string): void => {
        location = path;
      });

      expect(location).toEqual('');

      component.updateLocation();
      expect(location).toEqual('/dataset');

      component.updateLocation(true, false);
      expect(location).toEqual('/dataset');

      component.trackDatasetId = datasetId;
      component.trackRecordId = recordId;
      component.updateLocation(true, false);
      expect(location).toEqual(`/dataset/${datasetId}`);

      component.updateLocation(true);
      expect(location).toEqual(`/dataset/${datasetId}?recordId=${recordId}`);

      component.updateLocation(true, false, true);
      expect(location).toEqual(`/dataset/${datasetId}?view=problems`);

      component.updateLocation(true, true, true);
      expect(location).toEqual(`/dataset/${datasetId}?recordId=${recordId}&view=problems`);

      component.updateLocation(false);
      expect(location).toEqual('');
    });

    it('should get the form group', () => {
      expect(
        component.getFormGroup({ stepType: SandboxPageType.PROGRESS_TRACK } as SandboxPage)
      ).toEqual(component.formProgress);
      expect(component.getFormGroup({ stepType: SandboxPageType.UPLOAD } as SandboxPage)).toEqual(
        component.uploadComponent()?.form()
      );
      expect(component.getFormGroup({ stepType: SandboxPageType.REPORT } as SandboxPage)).toEqual(
        component.formRecord
      );
      expect(
        component.getFormGroup({ stepType: SandboxPageType.PROBLEMS_DATASET } as SandboxPage)
      ).toEqual(component.uploadComponent()?.form());
    });

    it('should set the busy flag for upload', () => {
      expect(component.sandboxNavConf[stepIndexUpload].isBusy).toBeFalsy();
      component.setBusyUpload(true);
      expect(component.sandboxNavConf[stepIndexUpload].isBusy).toBeTruthy();
    });

    it('should set the trackDatasetId on upload success', () => {
      const testId = '3';
      expect(component.trackDatasetId).toBeFalsy();
      component.dataUploaded(testId);
      expect(component.trackDatasetId).toEqual(testId);
    });

    it('should open the dataset', () => {
      const testId = '23';
      vi.spyOn(component, 'fillAndSubmitProgressForm');
      component.openDataset(testId);
      expect(component.fillAndSubmitProgressForm).toHaveBeenCalled();
      expect(component.trackDatasetId).toEqual(testId);
    });

    it('should tell if the default inputs should be shown', () => {
      component.currentStepType = SandboxPageType.PROBLEMS_RECORD;
      expect(component.defaultInputsShown()).toBeTruthy();
      component.currentStepType = SandboxPageType.HOME;
      expect(component.defaultInputsShown()).toBeFalsy();
      component.currentStepType = SandboxPageType.PROBLEMS_DATASET;
      expect(component.defaultInputsShown()).toBeTruthy();
      component.currentStepType = SandboxPageType.UPLOAD;
      expect(component.defaultInputsShown()).toBeFalsy();
      component.currentStepType = SandboxPageType.PROGRESS_TRACK;
      expect(component.defaultInputsShown()).toBeTruthy();
    });

    it('should tell if the progress is complete', () => {
      const testData = structuredClone(mockDataset);
      testData.status = DatasetStatus.COMPLETED;
      expect(component.progressComplete(testData)).toBeTruthy();
      testData.status = DatasetStatus.IN_PROGRESS;
      expect(component.progressComplete(testData)).toBeFalsy();
      testData.status = DatasetStatus.FAILED;
      expect(component.progressComplete(testData)).toBeTruthy();
    });

    it('should submit the progress form, clearing the polling before and when complete', async () => {
      vi.spyOn(component, 'clearDataPollers');
      vi.spyOn(component, 'setPage');

      component.onSubmitProgress(component.ButtonAction.BTN_PROGRESS);
      setFormValueDataset('1');
      component.onSubmitProgress(component.ButtonAction.BTN_PROGRESS, true);
      vi.advanceTimersByTimeAsync(apiSettings.interval);
      expect(component.setPage).toHaveBeenCalledTimes(1);
      expect(component.setPage).toHaveBeenCalledWith(stepIndexTrack);

      // clear and re-submit

      setFormValueDataset('1');

      component.onSubmitProgress(component.ButtonAction.BTN_PROGRESS, true);

      vi.advanceTimersByTimeAsync(apiSettings.interval);
      vi.advanceTimersByTimeAsync(apiSettings.interval);
      expect(component.setPage).toHaveBeenCalledTimes(2);

      // clear and re-submit

      setFormValueRecord('1');
      component.onSubmitProgress(component.ButtonAction.BTN_RECORD, true);

      vi.advanceTimersByTimeAsync(apiSettings.interval);

      expect(component.setPage).toHaveBeenCalledTimes(3);
      expect(component.setPage).toHaveBeenCalledWith(stepIndexProblemsDataset);

      component.cleanup();
      vi.advanceTimersByTimeAsync(apiSettings.interval);
    });

    it('should submit the progress form (wrapper call)', () => {
      vi.spyOn(component, 'onSubmitProgress');
      component.fnSubmitProgress();
      expect(component.onSubmitProgress).toHaveBeenCalledWith(
        component.ButtonAction.BTN_PROGRESS,
        true
      );
    });

    it('should submit the problems (wrapper call)', () => {
      vi.spyOn(component, 'onSubmitProgress');
      component.fnSubmitProblems();
      expect(component.onSubmitProgress).toHaveBeenCalledWith(
        component.ButtonAction.BTN_PROBLEMS,
        true
      );
    });

    it('should handle the location pop-state', async () => {
      expect(component.progressData).toBeFalsy();

      const ps = ({
        url: '/dataset/1'
      } as unknown) as PopStateEvent;

      expect(component.progressData).toBeFalsy();
      expect(component.currentStepType).toEqual(SandboxPageType.HOME);
      component.handleLocationPopState(ps);
      vi.advanceTimersByTimeAsync(1);
      expect(component.progressData).toBeTruthy();
      expect(component.currentStepType).toEqual(SandboxPageType.PROGRESS_TRACK);

      ps.url = '/dataset';
      component.handleLocationPopState(ps);
      vi.advanceTimersByTimeAsync(1);
      expect(component.progressData).toBeFalsy();
      expect(component.trackRecordId).toBeFalsy();
      expect(component.currentStepType).toEqual(SandboxPageType.PROGRESS_TRACK);

      ps.url = '/new';
      component.handleLocationPopState(ps);
      vi.advanceTimersByTimeAsync(1);
      expect(component.progressData).toBeFalsy();
      expect(component.trackRecordId).toBeFalsy();
      expect(component.currentStepType).toEqual(SandboxPageType.UPLOAD);

      ps.url = '/dataset/1?recordId=2';
      component.handleLocationPopState(ps);
      vi.advanceTimersByTimeAsync(1);
      expect(component.trackRecordId).toBeTruthy();
      expect(component.currentStepType).toEqual(SandboxPageType.REPORT);

      ps.url = '';
      component.handleLocationPopState(ps);
      vi.advanceTimersByTimeAsync(1);
      expect(component.trackRecordId).toBeTruthy();
      expect(component.trackRecordId).toBeTruthy();
      expect(component.currentStepType).toEqual(SandboxPageType.HOME);

      ps.url = '/privacy-statement';
      component.handleLocationPopState(ps);
      vi.advanceTimersByTimeAsync(1);
      expect(component.currentStepType).toEqual(SandboxPageType.PRIVACY_STATEMENT);

      ps.url = '/cookie-policy';
      component.handleLocationPopState(ps);
      vi.advanceTimersByTimeAsync(1);
      expect(component.currentStepType).toEqual(SandboxPageType.COOKIE_POLICY);

      component.cleanup();
      vi.advanceTimersByTimeAsync(apiSettings.interval);
    });

    it('should get if the current step is a problem step', () => {
      expect(component.getIsProblem(stepIndexHome)).toBeFalsy();
      expect(component.getIsProblem(stepIndexReport)).toBeFalsy();
      expect(component.getIsProblem(stepIndexTrack)).toBeFalsy();
      expect(component.getIsProblem(stepIndexUpload)).toBeFalsy();
      expect(component.getIsProblem(stepIndexProblemsDataset)).toBeTruthy();
      expect(component.getIsProblem(stepIndexProblemsRecord)).toBeTruthy();
    });

    it('should get the outer orb config', () => {
      Object.keys(new Array(2).fill(null)).forEach((i: string) => {
        expect(component.getNavOrbConfigOuter(parseInt(i))).toBeTruthy();
      });
    });

    it('should get the outer orb config', () => {
      Object.keys(new Array(3).fill(null)).forEach((i: string) => {
        expect(component.getNavOrbConfigInner(parseInt(i))).toBeTruthy();
      });

      expect(component.getNavOrbConfigInner(stepIndexTrack)['indicate-polling']).toBeFalsy();
      component.sandboxNavConf[stepIndexTrack].isPolling = true;
      expect(component.getNavOrbConfigInner(stepIndexTrack)['indicate-polling']).toBeTruthy();

      expect(component.getNavOrbConfigInner(stepIndexReport)['indicate-polling']).toBeFalsy();
      component.sandboxNavConf[stepIndexReport].isPolling = true;
      expect(component.getNavOrbConfigInner(stepIndexReport)['indicate-polling']).toBeTruthy();
    });

    it('should invoke the progress load when problem patterns are loaded', () => {
      vi.spyOn(component, 'submitDatasetProgress');
      component.submitDatasetProblemPatterns();
      expect(component.submitDatasetProgress).toHaveBeenCalled();
    });

    it('should set the page', () => {
      mockedKeycloak.authenticated = false;

      const form = component.uploadComponent()?.form();
      expect(form).toBeTruthy();

      if (form) {
        vi.spyOn(form, 'enable');
        vi.spyOn(mockedKeycloak, 'login');

        expect(component.currentStepIndex).toEqual(stepIndexHome);
        expect(component.currentStepType).toEqual(SandboxPageType.HOME);

        component.setPage(stepIndexUpload, true);
        expect(form.enable).not.toHaveBeenCalled();
        expect(mockedKeycloak.login).toHaveBeenCalled();

        mockedKeycloak.authenticated = true;
        fixture.detectChanges();

        component.setPage(stepIndexUpload, true);

        expect(component.currentStepIndex).toEqual(stepIndexUpload);
        expect(form.enable).not.toHaveBeenCalled();
        component.setPage(stepIndexUpload, true);
        expect(form.enable).not.toHaveBeenCalled();
        form.disable();
        component.setPage(stepIndexUpload, true);
        expect(form.enable).toHaveBeenCalled();

        component.setPage(stepIndexHome, false);
        expect(component.currentStepIndex).toEqual(stepIndexHome);
        expect(component.currentStepType).toEqual(SandboxPageType.HOME);

        component.setPage(stepIndexPrivacy, false);
        expect(component.currentStepIndex).toEqual(stepIndexPrivacy);
        expect(component.currentStepType).toEqual(SandboxPageType.PRIVACY_STATEMENT);

        component.setPage(stepIndexCookie, false);
        expect(component.currentStepIndex).toEqual(stepIndexCookie);
        expect(component.currentStepType).toEqual(SandboxPageType.COOKIE_POLICY);
      }
    });

    it('should set the step conditionally via callSetPage', () => {
      vi.spyOn(component, 'setPage');

      const createKeyEvent = (ctrlKey = false): KeyboardEvent => {
        return ({
          preventDefault: vi.fn(),
          ctrlKey: ctrlKey
        } as unknown) as KeyboardEvent;
      };

      component.callSetPage(createKeyEvent(true), stepIndexUpload, [], false);
      expect(component.setPage).not.toHaveBeenCalled();

      component.callSetPage(createKeyEvent(false), stepIndexUpload, [], false);
      expect(component.setPage).toHaveBeenCalled();

      component.callSetPage(createKeyEvent(true), stepIndexUpload, [], true);
      expect(component.setPage).toHaveBeenCalledTimes(1);

      component.callSetPage(createKeyEvent(false), stepIndexUpload, []);
      expect(component.setPage).toHaveBeenCalledTimes(2);
    });

    it('should show the step content', () => {
      const conf = component.sandboxNavConf;

      conf[stepIndexHome].isHidden = true;
      conf[stepIndexTrack].isHidden = true;
      conf[stepIndexUpload].isHidden = true;
      conf[stepIndexReport].isHidden = true;
      conf[stepIndexProblemsRecord].isHidden = true;
      conf[stepIndexProblemsDataset].isHidden = true;

      component.setPage(stepIndexHome, false, false);
      expect(conf[stepIndexHome].isHidden).toBeFalsy();

      component.setPage(stepIndexUpload, false, false);
      expect(conf[stepIndexUpload].isHidden).toBeFalsy();

      component.setPage(stepIndexTrack, false, false);
      expect(conf[stepIndexTrack].isHidden).toBeFalsy();

      component.setPage(stepIndexProblemsDataset, false, true);
      expect(conf[stepIndexProblemsDataset].isHidden).toBeFalsy();

      component.setPage(stepIndexProblemsRecord, false, true);
      expect(conf[stepIndexProblemsRecord].isHidden).toBeFalsy();

      component.setPage(stepIndexReport, false, true);
      expect(conf[stepIndexReport].isHidden).toBeFalsy();
    });

    it('should validate the dataset id', () => {
      const frmCtrl = (val: string): FormControl => {
        return ({ value: val } as unknown) as FormControl;
      };
      ['0', '1'].forEach((val: string) => {
        expect(component.validateDatasetId(frmCtrl(val))).toBeFalsy();
      });
      [' 1', '1 ', ' 1 ', '1 1', 'a', '@', '_', '-'].forEach((val: string) => {
        expect(component.validateDatasetId(frmCtrl(val))).toBeTruthy();
      });
    });

    it('should validate the record id', () => {
      const recordId = component.formRecord.controls.recordToTrack;
      const datasetId = component.formProgress.controls.datasetToTrack;

      ['0', '1'].forEach((val: string) => {
        recordId.setValue(val);
        expect(component.validateRecordId(recordId)).toBeTruthy();
      });

      datasetId.setValue('1 1'); // invalid related

      ['0', '1'].forEach((val: string) => {
        recordId.setValue(val);
        expect(component.validateRecordId(recordId)).toBeTruthy();
      });

      datasetId.setValue('1'); // valid related

      ['0', '1'].forEach((val: string) => {
        recordId.setValue(val);
        expect(component.validateRecordId(recordId)).toBeFalsy();
      });

      recordId.setValue('1 1'); // invalid
      expect(component.validateRecordId(recordId)).toBeTruthy();
    });

    it('should follow the problem pattern link', () => {
      const recordId = '/1/234';
      vi.spyOn(component, 'fillAndSubmitRecordForm');
      vi.spyOn(component, 'submitRecordReport');
      component.trackDatasetId = '1';
      component.followProblemPatternLink(recordId);
      expect(component.fillAndSubmitRecordForm).toHaveBeenCalled();
    });

    it('should open the report', () => {
      vi.spyOn(component, 'fillAndSubmitRecordForm');
      const recordId = '1';
      component.openReport({ recordId: recordId, openMetadata: false });
      expect(component.trackRecordId).toEqual(recordId);
      expect(component.fillAndSubmitRecordForm).toHaveBeenCalled();
    });

    it('should set the view when requesting the record report', async () => {
      component.trackDatasetId = '1';
      component.trackRecordId = '1';
      component.recordReport = mockRecordReport;
      fixture.detectChanges();

      const report = component.reportComponent();
      expect(report).toBeTruthy();

      if (report) {
        vi.spyOn(report, 'setView');

        component.submitRecordReport();
        expect(report.setView).not.toHaveBeenCalled();
        vi.advanceTimersByTimeAsync(1);
        fixture.detectChanges();
        expect(report.setView).not.toHaveBeenCalled();

        component.submitRecordReport(true);
        expect(report.setView).not.toHaveBeenCalled();
        vi.advanceTimersByTimeAsync(1);
        fixture.detectChanges();
        expect(report.setView).toHaveBeenCalled();
      }
    });

    it('should poll problem patterns until the result is final', async () => {
      let analysisStatus = ProblemPatternAnalysisStatus.PENDING;
      const trackDatasetId = '1';
      component.trackDatasetId = trackDatasetId;

      vi.spyOn(sandbox, 'getProblemPatternsDataset').mockImplementation(() => {
        return of({
          datasetId: trackDatasetId,
          problemPatternList: [],
          analysisStatus: analysisStatus
        } as ProblemPatternsDataset);
      });

      expect(component.sandboxNavConf[stepIndexProblemsDataset].isPolling).toBeFalsy();

      component.submitDatasetProblemPatterns();

      vi.advanceTimersByTimeAsync(apiSettings.interval);
      expect(component.sandboxNavConf[stepIndexProblemsDataset].isPolling).toBeTruthy();
      vi.advanceTimersByTimeAsync(apiSettings.interval);
      expect(component.sandboxNavConf[stepIndexProblemsDataset].isPolling).toBeTruthy();

      analysisStatus = ProblemPatternAnalysisStatus.FINALIZED;
      vi.advanceTimersByTimeAsync(apiSettings.interval);
      expect(component.sandboxNavConf[stepIndexProblemsDataset].isPolling).toBeFalsy();
      component.cleanup();
      vi.advanceTimersByTimeAsync(apiSettings.interval);
    });

    it('should determine when the inputs are visible', () => {
      expect(component.defaultInputsShown()).toBeFalsy();
      component.currentStepType = SandboxPageType.PROGRESS_TRACK;
      expect(component.defaultInputsShown()).toBeTruthy();
    });

    it('should show all recent', () => {
      component.currentStepType = SandboxPageType.PROGRESS_TRACK;
      fixture.detectChanges();

      const dropIn = component.dropInDatasetId();
      expect(dropIn).toBeTruthy();

      if (dropIn) {
        vi.spyOn(component, 'setPage');
        vi.spyOn(dropIn, 'openPinnedAll');
        component.showAllRecent();
        expect(component.setPage).toHaveBeenCalled();
        expect(dropIn.openPinnedAll).toHaveBeenCalled();
      }
    });

    /*
    it('should supply a (dataset) dropIn focus function', async () => {
      component.currentStepType = SandboxPageType.PROGRESS_TRACK;
      fixture.detectChanges();
      await fixture.whenStable();

      const datasetField = component.datasetToTrack();

      if (datasetField) {
        datasetField.nativeElement.value = 'four';

        vi.spyOn(datasetField.nativeElement, 'focus');
        vi.spyOn(datasetField.nativeElement, 'setSelectionRange');

        component.fnFocusDatasetToTrack(false);

        expect(datasetField.nativeElement.focus).toHaveBeenCalled();
        expect(datasetField.nativeElement.setSelectionRange).toHaveBeenCalled();

        component.fnFocusDatasetToTrack(true);

        expect(datasetField.nativeElement.focus).toHaveBeenCalledTimes(2);
        expect(datasetField.nativeElement.setSelectionRange).toHaveBeenCalledTimes(2);
      }
    });

    it('should supply a (record) dropIn focus function', async () => {
      // Update state via Signals
      component.currentStepType = SandboxPageType.PROGRESS_TRACK;

      // In Zoneless, we manually trigger the check
      fixture.detectChanges();
      // Ensure the microtask queue is flushed (e.g. signal effects)
      await Promise.resolve();

      const recordField = component.recordToTrack(); // This is a Signal viewChild

      if (recordField) {
        const el = recordField.nativeElement;
        el.value = 'four/three';

        const focusSpy = vi.spyOn(el, 'focus');

        // The orchestrator update
        component.fnFocusRecordToTrack();

        // Tell Angular to check the new state
        fixture.detectChanges();

        expect(focusSpy).toHaveBeenCalled();
      }
    });
    */

    it('should open the dataset tiers', () => {
      vi.spyOn(component, 'fillAndSubmitProgressForm');

      component.openDatasetTiers();
      expect(component.recordShortcutRequest).toBeFalsy();
      expect(component.fillAndSubmitProgressForm).toHaveBeenCalled();

      component.openDatasetTiers('1');
      expect(component.recordShortcutRequest).toBeTruthy();
      expect(component.fillAndSubmitProgressForm).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      configureTestbed(true);
      b4Each();
      vi.useFakeTimers();
    });

    afterEach(() => {
      MockReset();
      fixture.destroy();
      vi.clearAllTimers();
      vi.useRealTimers();
    });

    it('should handle progress form errors', async () => {
      component.progressData = mockDataset;
      const confIndex = stepIndexTrack;

      expect(component.sandboxNavConf[confIndex].error).toBeFalsy();
      setFormValueDataset('1');
      component.onSubmitProgress(component.ButtonAction.BTN_PROGRESS);
      vi.advanceTimersByTimeAsync(1);
      expect(component.sandboxNavConf[confIndex].error).toBeTruthy();
      expect(component.progressData).toBeFalsy();
      expect(component.formProgress.value.datasetToTrack).toBeTruthy();

      component.currentStepIndex = confIndex;
      component.clearError();
      expect(component.sandboxNavConf[confIndex].error).toBeFalsy();

      component.cleanup();
      vi.advanceTimersByTimeAsync(apiSettings.interval);
    });

    it('should handle record form errors', async () => {
      const service = TestBed.inject(SandboxService);
      vi.spyOn(service, 'getRecordReport').mockImplementation(() => {
        return throwError(() => new Error('Error!'));
      });

      let index = stepIndexReport;
      component.recordReport = mockRecordReport;
      expect(component.sandboxNavConf[index].error).toBeFalsy();

      component.onSubmitRecord(component.ButtonAction.BTN_RECORD);
      await Promise.resolve();
      fixture.detectChanges();

      expect(component.sandboxNavConf[index].error).toBeFalsy();

      setFormValueDataset('1');
      setFormValueRecord('2');

      fixture.detectChanges();

      component.onSubmitRecord(component.ButtonAction.BTN_RECORD);
      await Promise.resolve();
      vi.advanceTimersByTimeAsync(1);
      fixture.detectChanges();

      expect(component.sandboxNavConf[index].error).toBeTruthy();
      expect(component.recordReport).toBeFalsy();

      component.sandboxNavConf[index].error = undefined;
      index = stepIndexProblemsRecord;

      component.onSubmitRecord(component.ButtonAction.BTN_PROBLEMS, true);
      await Promise.resolve();
      fixture.detectChanges();
      vi.advanceTimersByTimeAsync(1);
      expect(component.sandboxNavConf[index].error).toBeTruthy();
      expect(component.recordReport).toBeFalsy();

      component.clearError();
      expect(component.sandboxNavConf[index].error).toBeFalsy();

      component.cleanup();
      vi.advanceTimersByTimeAsync(apiSettings.interval);
    });

    it('should handle problem pattern errors (dataset)', async () => {
      const service = TestBed.inject(SandboxService);
      vi.spyOn(service, 'getDatasetInfo').mockImplementation(() => {
        return throwError(() => new Error('Problem Pattern'));
      });
      expect(component.sandboxNavConf[stepIndexProblemsDataset].error).toBeFalsy();
      component.trackDatasetId = '1';
      component.submitDatasetProblemPatterns();
      await Promise.resolve();
      vi.advanceTimersByTimeAsync(1);
      fixture.detectChanges();

      expect(component.sandboxNavConf[stepIndexProblemsDataset].error).toBeTruthy();

      component.clearError();
      expect(component.sandboxNavConf[stepIndexProblemsDataset].error).toBeTruthy();
      component.currentStepIndex = stepIndexProblemsDataset;
      component.clearError();
      expect(component.sandboxNavConf[stepIndexProblemsDataset].error).toBeFalsy();
    });

    it('should handle problem pattern errors (record)', async () => {
      const service = TestBed.inject(SandboxService);
      vi.spyOn(service, 'getProblemPatternsRecordWrapped').mockImplementation(() => {
        return throwError(() => new Error('Error!'));
      });

      expect(component.sandboxNavConf[stepIndexProblemsRecord].error).toBeFalsy();
      component.trackDatasetId = '1';
      component.trackRecordId = '1/2';
      component.submitRecordProblemPatterns();
      await Promise.resolve();
      vi.advanceTimersByTimeAsync(1);
      fixture.detectChanges();

      expect(component.sandboxNavConf[stepIndexProblemsRecord].error).toBeTruthy();

      component.currentStepIndex = stepIndexProblemsRecord;
      component.clearError();
      expect(component.sandboxNavConf[stepIndexProblemsRecord].error).toBeFalsy();
    });
  });
});
