import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { PopStateEvent } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatomoTracker } from 'ngx-matomo-client';
import { BehaviorSubject, of } from 'rxjs';
import { apiSettings } from '../../environments/apisettings';
import {
  mockDataset,
  mockedMatomoTracker,
  mockProblemPatternsDataset,
  mockProblemPatternsRecord,
  mockRecordReport,
  MockSandboxService,
  MockSandboxServiceErrors
} from '../_mocked';
import {
  DatasetStatus,
  ProblemPatternAnalysisStatus,
  ProblemPatternsDataset,
  SandboxPage,
  SandboxPageType
} from '../_models';
import { SandboxService } from '../_services';
import { FormatHarvestUrlPipe } from '../_translate';
import { SandboxNavigatonComponent } from '.';

describe('SandboxNavigatonComponent', () => {
  let component: SandboxNavigatonComponent;
  let fixture: ComponentFixture<SandboxNavigatonComponent>;
  let sandbox: SandboxService;

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

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        RouterTestingModule,
        FormatHarvestUrlPipe
      ],
      providers: [
        {
          provide: SandboxService,
          useClass: errorMode ? MockSandboxServiceErrors : MockSandboxService
        },
        {
          provide: ActivatedRoute,
          useValue: { params: params, queryParams: queryParams }
        },
        {
          provide: MatomoTracker,
          useValue: mockedMatomoTracker
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    sandbox = TestBed.inject(SandboxService);
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(SandboxNavigatonComponent);
    component = fixture.componentInstance;
    params.next({});
    fixture.detectChanges();
  };

  describe('Normal operations', () => {
    beforeEach(async(configureTestbed));
    beforeEach(b4Each);

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should clear pollers when the trackDatasetId is set', () => {
      spyOn(component, 'clearDataPollerByIdentifier');
      component.trackDatasetId = '12';
      expect(component.clearDataPollerByIdentifier).toHaveBeenCalled();
    });

    it('should subscribe to parameter changes', fakeAsync(() => {
      expect(component.trackDatasetId).toBeFalsy();
      params.next({ id: '1' });
      tick(1);
      fixture.detectChanges();

      expect(component.trackDatasetId).toBeTruthy();
      expect(component.trackRecordId).toBeFalsy();

      queryParams.next({ view: 'problems' });
      tick(1);
      fixture.detectChanges();

      expect(component.trackDatasetId).toBeTruthy();
      expect(component.trackRecordId).toBeFalsy();

      queryParams.next({ recordId: '2' });
      tick(1);
      fixture.detectChanges();

      expect(component.trackDatasetId).toBeTruthy();
      expect(component.trackRecordId).toBeTruthy();

      params.next({ id: '1' });
      queryParams.next({ recordId: '2', view: 'problems' });
      tick(1);
      fixture.detectChanges();

      expect(component.trackDatasetId).toBeTruthy();
      expect(component.trackRecordId).toBeTruthy();

      component.cleanup();
      tick(apiSettings.interval);
    }));

    it('should get if a step is an indicator', () => {
      expect(component.getStepIsIndicator(stepIndexHome)).toBeFalsy();

      expect(component.getStepIsIndicator(stepIndexTrack)).toBeFalsy();
      component.progressData = structuredClone(mockDataset);
      setFormValueDataset('1');
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

      spyOn(component, 'goToLocation').and.callFake((path: string): void => {
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
        component.uploadComponent.form
      );
      expect(component.getFormGroup({ stepType: SandboxPageType.REPORT } as SandboxPage)).toEqual(
        component.formRecord
      );
      expect(
        component.getFormGroup({ stepType: SandboxPageType.PROBLEMS_DATASET } as SandboxPage)
      ).toEqual(component.uploadComponent.form);
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

    it('should submit the progress form, clearing the polling before and when complete', fakeAsync(() => {
      spyOn(component, 'clearDataPollers').and.callThrough();
      spyOn(component, 'setPage');

      component.onSubmitProgress(component.ButtonAction.BTN_PROGRESS);
      setFormValueDataset('1');
      component.onSubmitProgress(component.ButtonAction.BTN_PROGRESS, true);
      tick(apiSettings.interval);
      expect(component.setPage).toHaveBeenCalledTimes(1);
      expect(component.setPage).toHaveBeenCalledWith(stepIndexTrack);

      // clear and re-submit

      setFormValueDataset('1');

      component.onSubmitProgress(component.ButtonAction.BTN_PROGRESS, true);

      tick(apiSettings.interval);
      tick(apiSettings.interval);
      expect(component.setPage).toHaveBeenCalledTimes(2);

      // clear and re-submit

      setFormValueRecord('1');
      component.onSubmitProgress(component.ButtonAction.BTN_RECORD, true);

      tick(apiSettings.interval);

      expect(component.setPage).toHaveBeenCalledTimes(3);
      expect(component.setPage).toHaveBeenCalledWith(stepIndexProblemsDataset);

      component.cleanup();
      tick(apiSettings.interval);
    }));

    it('should handle the location pop-state', fakeAsync(() => {
      expect(component.progressData).toBeFalsy();

      const ps = ({
        url: '/dataset/1'
      } as unknown) as PopStateEvent;

      expect(component.progressData).toBeFalsy();
      expect(component.currentStepType).toEqual(SandboxPageType.HOME);
      component.handleLocationPopState(ps);
      tick(1);
      expect(component.progressData).toBeTruthy();
      expect(component.currentStepType).toEqual(SandboxPageType.PROGRESS_TRACK);

      ps.url = '/dataset';
      component.handleLocationPopState(ps);
      tick(1);
      expect(component.progressData).toBeFalsy();
      expect(component.trackRecordId).toBeFalsy();
      expect(component.currentStepType).toEqual(SandboxPageType.PROGRESS_TRACK);

      ps.url = '/new';
      component.handleLocationPopState(ps);
      tick(1);
      expect(component.progressData).toBeFalsy();
      expect(component.trackRecordId).toBeFalsy();
      expect(component.currentStepType).toEqual(SandboxPageType.UPLOAD);

      ps.url = '/dataset/1?recordId=2';
      component.handleLocationPopState(ps);
      tick(1);
      expect(component.trackRecordId).toBeTruthy();
      expect(component.currentStepType).toEqual(SandboxPageType.REPORT);

      ps.url = '';
      component.handleLocationPopState(ps);
      tick(1);
      expect(component.trackRecordId).toBeTruthy();
      expect(component.trackRecordId).toBeTruthy();
      expect(component.currentStepType).toEqual(SandboxPageType.HOME);

      ps.url = '/privacy-statement';
      component.handleLocationPopState(ps);
      tick(1);
      expect(component.currentStepType).toEqual(SandboxPageType.PRIVACY_STATEMENT);

      ps.url = '/cookie-policy';
      component.handleLocationPopState(ps);
      tick(1);
      expect(component.currentStepType).toEqual(SandboxPageType.COOKIE_POLICY);

      component.cleanup();
      tick(apiSettings.interval);
    }));

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
      spyOn(component, 'submitDatasetProgress');
      component.submitDatasetProblemPatterns();
      expect(component.submitDatasetProgress).toHaveBeenCalled();
    });

    it('should set the page', () => {
      const form = component.uploadComponent.form;
      spyOn(form, 'enable');

      expect(component.currentStepIndex).toEqual(stepIndexHome);
      expect(component.currentStepType).toEqual(SandboxPageType.HOME);
      component.setPage(stepIndexUpload, false, true);

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
    });

    it('should set the step conditionally via callSetPage', () => {
      spyOn(component, 'setPage');

      const createKeyEvent = (ctrlKey = false): KeyboardEvent => {
        return ({
          preventDefault: jasmine.createSpy(),
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
      spyOn(component, 'fillAndSubmitRecordForm');
      spyOn(component, 'submitRecordReport');
      component.trackDatasetId = '1';
      component.followProblemPatternLink(recordId);
      expect(component.fillAndSubmitRecordForm).toHaveBeenCalled();
    });

    it('should open the report', () => {
      spyOn(component, 'fillAndSubmitRecordForm');
      const recordId = '1';
      component.openReport({ recordId: recordId, openMetadata: false });
      expect(component.trackRecordId).toEqual(recordId);
      expect(component.fillAndSubmitRecordForm).toHaveBeenCalled();
    });

    it('should set the view when requesting the record report', fakeAsync(() => {
      component.trackDatasetId = '1';
      component.trackRecordId = '1';
      component.recordReport = mockRecordReport;
      fixture.detectChanges();
      spyOn(component.reportComponent, 'setView');

      component.submitRecordReport();
      expect(component.reportComponent.setView).not.toHaveBeenCalled();
      tick(1);
      fixture.detectChanges();
      expect(component.reportComponent.setView).not.toHaveBeenCalled();

      component.submitRecordReport(true);
      expect(component.reportComponent.setView).not.toHaveBeenCalled();
      tick(1);
      fixture.detectChanges();
      expect(component.reportComponent.setView).toHaveBeenCalled();
    }));

    it('should poll problem patterns until the result is final', fakeAsync(() => {
      let analysisStatus = ProblemPatternAnalysisStatus.PENDING;
      const trackDatasetId = '1';
      component.trackDatasetId = trackDatasetId;

      spyOn(sandbox, 'getProblemPatternsDataset').and.callFake((_) => {
        return of({
          datasetId: trackDatasetId,
          problemPatternList: [],
          analysisStatus: analysisStatus
        } as ProblemPatternsDataset);
      });

      expect(component.sandboxNavConf[stepIndexProblemsDataset].isPolling).toBeFalsy();

      component.submitDatasetProblemPatterns();

      tick(apiSettings.interval);
      expect(component.sandboxNavConf[stepIndexProblemsDataset].isPolling).toBeTruthy();
      tick(apiSettings.interval);
      expect(component.sandboxNavConf[stepIndexProblemsDataset].isPolling).toBeTruthy();

      analysisStatus = ProblemPatternAnalysisStatus.FINALIZED;
      tick(apiSettings.interval);
      expect(component.sandboxNavConf[stepIndexProblemsDataset].isPolling).toBeFalsy();
      component.cleanup();
      tick(apiSettings.interval);
    }));
  });

  describe('Error handling', () => {
    beforeEach(async () => {
      configureTestbed(true);
    });

    beforeEach(b4Each);

    it('should handle progress form errors', fakeAsync(() => {
      component.progressData = mockDataset;
      const confIndex = stepIndexTrack;

      expect(component.sandboxNavConf[confIndex].error).toBeFalsy();
      setFormValueDataset('1');
      component.onSubmitProgress(component.ButtonAction.BTN_PROGRESS);
      tick(1);
      expect(component.sandboxNavConf[confIndex].error).toBeTruthy();
      expect(component.progressData).toBeFalsy();
      expect(component.formProgress.value.datasetToTrack).toBeTruthy();

      component.currentStepIndex = confIndex;
      component.clearError();
      expect(component.sandboxNavConf[confIndex].error).toBeFalsy();

      component.cleanup();
      tick(apiSettings.interval);
    }));

    it('should handle record form errors', fakeAsync(() => {
      let index = stepIndexReport;
      component.recordReport = mockRecordReport;
      expect(component.sandboxNavConf[index].error).toBeFalsy();

      component.onSubmitRecord(component.ButtonAction.BTN_RECORD);
      expect(component.sandboxNavConf[index].error).toBeFalsy();

      setFormValueDataset('1');
      setFormValueRecord('2');

      component.onSubmitRecord(component.ButtonAction.BTN_RECORD);
      tick(1);
      expect(component.sandboxNavConf[index].error).toBeTruthy();
      expect(component.recordReport).toBeFalsy();

      component.sandboxNavConf[index].error = undefined;
      index = stepIndexProblemsRecord;

      component.onSubmitRecord(component.ButtonAction.BTN_PROBLEMS, true);
      tick(1);
      expect(component.sandboxNavConf[index].error).toBeTruthy();
      expect(component.recordReport).toBeFalsy();

      component.clearError();
      expect(component.sandboxNavConf[index].error).toBeFalsy();

      component.cleanup();
      tick(apiSettings.interval);
    }));

    it('should handle problem pattern errors (dataset)', fakeAsync(() => {
      expect(component.sandboxNavConf[stepIndexProblemsDataset].error).toBeFalsy();
      component.trackDatasetId = '1';
      component.submitDatasetProblemPatterns();
      tick(1);
      expect(component.sandboxNavConf[stepIndexProblemsDataset].error).toBeTruthy();

      component.clearError();
      expect(component.sandboxNavConf[stepIndexProblemsDataset].error).toBeTruthy();
      component.currentStepIndex = stepIndexProblemsDataset;
      component.clearError();
      expect(component.sandboxNavConf[stepIndexProblemsDataset].error).toBeFalsy();
    }));

    it('should handle problem pattern errors (record)', fakeAsync(() => {
      expect(component.sandboxNavConf[stepIndexProblemsRecord].error).toBeFalsy();
      component.trackDatasetId = '1';
      component.trackRecordId = '1/2';
      component.submitRecordProblemPatterns();
      tick(1);
      expect(component.sandboxNavConf[stepIndexProblemsRecord].error).toBeTruthy();

      component.currentStepIndex = stepIndexProblemsRecord;
      component.clearError();
      expect(component.sandboxNavConf[stepIndexProblemsRecord].error).toBeFalsy();
    }));
  });
});
