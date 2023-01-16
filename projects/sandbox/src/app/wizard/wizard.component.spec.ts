import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { PopStateEvent } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { FileUploadComponent, ProtocolFieldSetComponent } from 'shared';
import { apiSettings } from '../../environments/apisettings';
import {
  mockDataset,
  mockProblemPatternsDataset,
  mockProblemPatternsRecord,
  mockRecordReport,
  MockSandboxService,
  MockSandboxServiceErrors
} from '../_mocked';
import { DatasetStatus, WizardStep, WizardStepType } from '../_models';
import { SandboxService } from '../_services';
import { FormatHarvestUrlPipe } from '../_translate';
import { ProblemViewerComponent } from '../problem-viewer';
import { RecordReportComponent } from '../record-report';
import { UploadComponent } from '../upload';
import { WizardComponent } from './wizard.component';

describe('WizardComponent', () => {
  let component: WizardComponent;
  let fixture: ComponentFixture<WizardComponent>;
  const params = new BehaviorSubject({} as Params);
  const queryParams = new BehaviorSubject({} as Params);

  const stepIndexHome = 0;
  const stepIndexUpload = 1;
  const stepIndexTrack = 2;
  const stepIndexProblemsDataset = 3;
  const stepIndexReport = 4;
  const stepIndexProblemsRecord = 5;

  const setFormValueDataset = (val: string): void => {
    component.formProgress.controls.datasetToTrack.setValue(val);
  };

  const setFormValueRecord = (val: string): void => {
    component.formRecord.controls.recordToTrack.setValue(val);
  };

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      declarations: [
        FileUploadComponent,
        FormatHarvestUrlPipe,
        ProblemViewerComponent,
        ProtocolFieldSetComponent,
        RecordReportComponent,
        UploadComponent,
        WizardComponent
      ],
      imports: [HttpClientTestingModule, ReactiveFormsModule, RouterTestingModule],
      providers: [
        {
          provide: SandboxService,
          useClass: errorMode ? MockSandboxServiceErrors : MockSandboxService
        },
        {
          provide: ActivatedRoute,
          useValue: { params: params, queryParams: queryParams }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(WizardComponent);
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
      component.progressData = Object.assign({}, mockDataset);
      setFormValueDataset('1');
      expect(component.getStepIsIndicator(stepIndexTrack)).toBeFalsy();
      component.wizardConf[stepIndexTrack].lastLoadedIdDataset = '1';
      expect(component.getStepIsIndicator(stepIndexTrack)).toBeTruthy();

      expect(component.getStepIsIndicator(stepIndexProblemsDataset)).toBeFalsy();
      component.problemPatternsDataset = mockProblemPatternsDataset;
      expect(component.getStepIsIndicator(stepIndexProblemsDataset)).toBeFalsy();
      component.wizardConf[stepIndexProblemsDataset].lastLoadedIdDataset = '1';
      expect(component.getStepIsIndicator(stepIndexProblemsDataset)).toBeTruthy();

      expect(component.getStepIsIndicator(stepIndexReport)).toBeFalsy();
      component.recordReport = mockRecordReport;
      expect(component.getStepIsIndicator(stepIndexReport)).toBeFalsy();
      component.wizardConf[stepIndexReport].lastLoadedIdDataset = '1';
      component.wizardConf[stepIndexReport].lastLoadedIdRecord = '2';
      expect(component.getStepIsIndicator(stepIndexReport)).toBeFalsy();
      setFormValueRecord('2');
      expect(component.getStepIsIndicator(stepIndexReport)).toBeTruthy();

      expect(component.getStepIsIndicator(stepIndexProblemsRecord)).toBeFalsy();
      component.problemPatternsRecord = {
        datasetId: '1',
        problemPatternList: mockProblemPatternsRecord
      };
      expect(component.getStepIsIndicator(stepIndexProblemsRecord)).toBeFalsy();
      component.wizardConf[stepIndexProblemsRecord].lastLoadedIdDataset = '1';
      component.wizardConf[stepIndexProblemsRecord].lastLoadedIdRecord = '2';
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
    });

    it('should get the form group', () => {
      expect(
        component.getFormGroup({ stepType: WizardStepType.PROGRESS_TRACK } as WizardStep)
      ).toEqual(component.formProgress);
      expect(component.getFormGroup({ stepType: WizardStepType.UPLOAD } as WizardStep)).toEqual(
        component.uploadComponent.form
      );
      expect(component.getFormGroup({ stepType: WizardStepType.REPORT } as WizardStep)).toEqual(
        component.formRecord
      );
      expect(
        component.getFormGroup({ stepType: WizardStepType.PROBLEMS_DATASET } as WizardStep)
      ).toEqual(component.uploadComponent.form);
    });

    it('should reset the busy flags', () => {
      component.wizardConf[stepIndexUpload].isBusy = true;
      component.wizardConf[stepIndexProblemsRecord].isBusy = true;
      component.isPollingProgress = true;
      component.resetBusy();
      expect(component.wizardConf[stepIndexUpload].isBusy).toBeFalsy();
      expect(component.wizardConf[stepIndexProblemsRecord].isBusy).toBeFalsy();
      expect(component.isPollingProgress).toBeFalsy();
    });

    it('should set the busy flag for upload', () => {
      expect(component.wizardConf[stepIndexUpload].isBusy).toBeFalsy();
      component.setBusyUpload(true);
      expect(component.wizardConf[stepIndexUpload].isBusy).toBeTruthy();
    });

    it('should set the trackDatasetId on upload success', () => {
      const testId = '3';
      expect(component.trackDatasetId).toBeFalsy();
      component.dataUploaded(testId);
      expect(component.trackDatasetId).toEqual(testId);
    });

    it('should tell if the default inputs should be shown', () => {
      component.currentStepType = WizardStepType.PROBLEMS_RECORD;
      expect(component.defaultInputsShown()).toBeTruthy();
      component.currentStepType = WizardStepType.HOME;
      expect(component.defaultInputsShown()).toBeFalsy();
      component.currentStepType = WizardStepType.PROBLEMS_DATASET;
      expect(component.defaultInputsShown()).toBeTruthy();
      component.currentStepType = WizardStepType.UPLOAD;
      expect(component.defaultInputsShown()).toBeFalsy();
      component.currentStepType = WizardStepType.PROGRESS_TRACK;
      expect(component.defaultInputsShown()).toBeTruthy();
    });

    it('should tell if the progress is complete', () => {
      expect(component.progressComplete()).toBeFalsy();
      component.progressData = Object.assign({}, mockDataset);
      component.progressData.status = DatasetStatus.COMPLETED;
      expect(component.progressComplete()).toBeTruthy();
      component.progressData.status = DatasetStatus.IN_PROGRESS;
      expect(component.progressComplete()).toBeFalsy();
    });

    it('should submit the progress form, clearing the polling before and when complete', fakeAsync(() => {
      spyOn(component, 'clearDataPollers');
      component.onSubmitProgress(component.ButtonAction.BTN_PROGRESS);
      expect(component.clearDataPollers).not.toHaveBeenCalled();
      setFormValueDataset('1');
      component.onSubmitProgress(component.ButtonAction.BTN_PROGRESS);
      expect(component.clearDataPollers).toHaveBeenCalledTimes(1);
      tick(apiSettings.interval);
      expect(component.clearDataPollers).toHaveBeenCalledTimes(2);

      // clear and re-submit

      spyOn(component, 'progressComplete').and.callFake(() => false);
      setFormValueDataset('1');
      component.onSubmitProgress(component.ButtonAction.BTN_PROGRESS);
      expect(component.clearDataPollers).toHaveBeenCalledTimes(3);
      tick(apiSettings.interval);
      expect(component.clearDataPollers).toHaveBeenCalledTimes(3);
      component.cleanup();
      tick(apiSettings.interval);
    }));

    it('should handle the location pop-state', fakeAsync(() => {
      expect(component.progressData).toBeFalsy();

      const ps = ({
        url: '/dataset/1'
      } as unknown) as PopStateEvent;

      expect(component.progressData).toBeFalsy();
      expect(component.currentStepType).toEqual(WizardStepType.HOME);
      component.handleLocationPopState(ps);
      tick(1);
      expect(component.progressData).toBeTruthy();
      expect(component.currentStepType).toEqual(WizardStepType.PROGRESS_TRACK);

      ps.url = '/dataset';
      component.handleLocationPopState(ps);
      tick(1);
      expect(component.progressData).toBeFalsy();
      expect(component.trackRecordId).toBeFalsy();
      expect(component.currentStepType).toEqual(WizardStepType.PROGRESS_TRACK);

      ps.url = '/new';
      component.handleLocationPopState(ps);
      tick(1);
      expect(component.progressData).toBeFalsy();
      expect(component.trackRecordId).toBeFalsy();
      expect(component.currentStepType).toEqual(WizardStepType.UPLOAD);

      ps.url = '/dataset/1?recordId=2';
      component.handleLocationPopState(ps);
      tick(1);
      expect(component.trackRecordId).toBeTruthy();
      expect(component.currentStepType).toEqual(WizardStepType.REPORT);

      ps.url = '';
      component.handleLocationPopState(ps);
      tick(1);
      expect(component.trackRecordId).toBeFalsy();
      expect(component.trackRecordId).toBeFalsy();
      expect(component.currentStepType).toEqual(WizardStepType.HOME);

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
      component.isPollingProgress = true;
      expect(component.getNavOrbConfigInner(stepIndexTrack)['indicate-polling']).toBeTruthy();

      expect(component.getNavOrbConfigInner(stepIndexReport)['indicate-polling']).toBeFalsy();
      component.isPollingRecord = true;
      expect(component.getNavOrbConfigInner(stepIndexReport)['indicate-polling']).toBeTruthy();
    });

    it('should set the step', () => {
      const form = component.uploadComponent.form;
      spyOn(form, 'enable');
      expect(component.currentStepIndex).toEqual(stepIndexHome);
      component.setStep(stepIndexUpload, false, false);
      expect(component.currentStepIndex).toEqual(stepIndexUpload);
      expect(form.enable).not.toHaveBeenCalled();
      component.setStep(stepIndexUpload, true);
      expect(form.enable).not.toHaveBeenCalled();
      form.disable();
      component.setStep(stepIndexUpload, true);
      expect(form.enable).toHaveBeenCalled();
    });

    it('should set the step conditionally via callSetStep', () => {
      spyOn(component, 'setStep');

      const createKeyEvent = (ctrlKey = false): KeyboardEvent => {
        return ({
          preventDefault: jasmine.createSpy(),
          ctrlKey: ctrlKey
        } as unknown) as KeyboardEvent;
      };

      component.callSetStep(createKeyEvent(true), stepIndexUpload, false);
      expect(component.setStep).not.toHaveBeenCalled();

      component.callSetStep(createKeyEvent(false), stepIndexUpload, false);
      expect(component.setStep).toHaveBeenCalled();

      component.callSetStep(createKeyEvent(true), stepIndexUpload, true);
      expect(component.setStep).toHaveBeenCalledTimes(1);

      component.callSetStep(createKeyEvent(false), stepIndexUpload);
      expect(component.setStep).toHaveBeenCalledTimes(2);
    });

    it('should show the step content', () => {
      const conf = component.wizardConf;

      conf[stepIndexHome].isHidden = true;
      conf[stepIndexTrack].isHidden = true;
      conf[stepIndexUpload].isHidden = true;
      conf[stepIndexReport].isHidden = true;
      conf[stepIndexProblemsRecord].isHidden = true;
      conf[stepIndexProblemsDataset].isHidden = true;

      component.setStep(stepIndexHome, false, false);
      expect(conf[stepIndexHome].isHidden).toBeFalsy();

      component.setStep(stepIndexUpload, false, false);
      expect(conf[stepIndexUpload].isHidden).toBeFalsy();

      component.setStep(stepIndexTrack, false, false);
      expect(conf[stepIndexTrack].isHidden).toBeFalsy();

      component.setStep(stepIndexProblemsDataset, false, true);
      expect(conf[stepIndexProblemsDataset].isHidden).toBeFalsy();

      component.setStep(stepIndexProblemsRecord, false, true);
      expect(conf[stepIndexProblemsRecord].isHidden).toBeFalsy();

      component.setStep(stepIndexReport, false, true);
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
  });

  describe('Error handling', () => {
    beforeEach(async () => {
      configureTestbed(true);
    });

    beforeEach(b4Each);

    it('should handle progress form errors', fakeAsync(() => {
      component.progressData = mockDataset;
      const confIndex = stepIndexTrack;

      expect(component.wizardConf[confIndex].error).toBeFalsy();
      setFormValueDataset('1');
      component.onSubmitProgress(component.ButtonAction.BTN_PROGRESS);
      tick(1);
      expect(component.wizardConf[confIndex].error).toBeTruthy();
      expect(component.progressData).toBeFalsy();
      expect(component.formProgress.value.datasetToTrack).toBeTruthy();
      component.cleanup();
      tick(apiSettings.interval);
    }));

    it('should handle record form errors', fakeAsync(() => {
      let index = stepIndexReport;
      component.recordReport = mockRecordReport;
      expect(component.wizardConf[index].error).toBeFalsy();

      component.onSubmitRecord(component.ButtonAction.BTN_RECORD);
      expect(component.wizardConf[index].error).toBeFalsy();

      setFormValueDataset('1');
      setFormValueRecord('2');

      component.onSubmitRecord(component.ButtonAction.BTN_RECORD);
      tick(1);
      expect(component.wizardConf[index].error).toBeTruthy();
      expect(component.recordReport).toBeFalsy();

      component.wizardConf[index].error = undefined;
      index = stepIndexProblemsRecord;

      component.onSubmitRecord(component.ButtonAction.BTN_PROBLEMS, false);
      tick(1);
      expect(component.wizardConf[index].error).toBeTruthy();
      expect(component.recordReport).toBeFalsy();

      component.cleanup();
      tick(apiSettings.interval);
    }));

    it('should handle problem pattern errors (dataset)', fakeAsync(() => {
      expect(component.wizardConf[stepIndexProblemsDataset].error).toBeFalsy();
      component.trackDatasetId = '1';
      component.submitDatasetProblemPatterns();
      tick(1);
      expect(component.wizardConf[stepIndexProblemsDataset].error).toBeTruthy();
    }));

    it('should handle problem pattern errors (record)', fakeAsync(() => {
      expect(component.wizardConf[stepIndexProblemsRecord].error).toBeFalsy();
      component.trackDatasetId = '1';
      component.trackRecordId = '1/2';
      component.submitRecordProblemPatterns();
      tick(1);
      expect(component.wizardConf[stepIndexProblemsRecord].error).toBeTruthy();
    }));
  });
});
