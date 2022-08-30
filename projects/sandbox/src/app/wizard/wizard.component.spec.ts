import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
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
import { ProblemViewerComponent } from '../problem-viewer';
import { RecordReportComponent } from '../record-report';
import { UploadComponent } from '../upload';
import { WizardComponent } from './wizard.component';

describe('WizardComponent', () => {
  let component: WizardComponent;
  let fixture: ComponentFixture<WizardComponent>;
  const params = new BehaviorSubject({} as Params);
  const queryParams = new BehaviorSubject({} as Params);
  const formNameDatasetId = 'datasetToTrack';
  const formNameRecordId = 'recordToTrack';

  const setFormValueDataset = (val: string): void => {
    (component.formProgress.get(formNameDatasetId) as UntypedFormControl).setValue(val);
  };

  const setFormValueRecord = (val: string): void => {
    (component.formRecord.get(formNameRecordId) as UntypedFormControl).setValue(val);
  };

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      declarations: [
        FileUploadComponent,
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
      expect(component.getStepIsIndicator(0)).toBeFalsy();
      expect(component.getStepIsIndicator(0)).toBeFalsy();

      expect(component.getStepIsIndicator(1)).toBeFalsy();
      component.progressData = Object.assign({}, mockDataset);
      setFormValueDataset('1');
      expect(component.getStepIsIndicator(1)).toBeFalsy();
      component.wizardConf[1].lastLoadedIdDataset = '1';
      expect(component.getStepIsIndicator(1)).toBeTruthy();

      expect(component.getStepIsIndicator(2)).toBeFalsy();
      component.problemPatternsDataset = mockProblemPatternsDataset;
      expect(component.getStepIsIndicator(2)).toBeFalsy();
      component.wizardConf[2].lastLoadedIdDataset = '1';
      expect(component.getStepIsIndicator(2)).toBeTruthy();

      expect(component.getStepIsIndicator(3)).toBeFalsy();
      component.recordReport = mockRecordReport;
      expect(component.getStepIsIndicator(3)).toBeFalsy();
      component.wizardConf[3].lastLoadedIdDataset = '1';
      component.wizardConf[3].lastLoadedIdRecord = '2';
      expect(component.getStepIsIndicator(3)).toBeFalsy();
      setFormValueRecord('2');
      expect(component.getStepIsIndicator(3)).toBeTruthy();

      expect(component.getStepIsIndicator(4)).toBeFalsy();
      component.problemPatternsRecord = mockProblemPatternsRecord;
      expect(component.getStepIsIndicator(4)).toBeFalsy();
      component.wizardConf[4].lastLoadedIdDataset = '1';
      component.wizardConf[4].lastLoadedIdRecord = '2';
      expect(component.getStepIsIndicator(4)).toBeTruthy();
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
      component.wizardConf[0].isBusy = true;
      component.wizardConf[4].isBusy = true;
      component.isPollingProgress = true;
      component.resetBusy();
      expect(component.wizardConf[0].isBusy).toBeFalsy();
      expect(component.wizardConf[4].isBusy).toBeFalsy();
      expect(component.isPollingProgress).toBeFalsy();
    });

    it('should set the busy flag for upload', () => {
      expect(component.wizardConf[0].isBusy).toBeFalsy();
      component.setBusyUpload(true);
      expect(component.wizardConf[0].isBusy).toBeTruthy();
    });

    it('should set the trackDatasetId on upload success', () => {
      const testId = '3';
      expect(component.trackDatasetId).toBeFalsy();
      component.dataUploaded(testId);
      expect(component.trackDatasetId).toEqual(testId);
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
      tick(1);
      expect(component.clearDataPollers).toHaveBeenCalledTimes(2);

      // clear and re-submit

      spyOn(component, 'progressComplete').and.callFake(() => false);
      setFormValueDataset('1');
      component.onSubmitProgress(component.ButtonAction.BTN_PROGRESS);
      expect(component.clearDataPollers).toHaveBeenCalledTimes(3);
      tick(1);
      expect(component.clearDataPollers).toHaveBeenCalledTimes(3);

      // with location update

      component.onSubmitProgress(component.ButtonAction.BTN_PROGRESS, true);
      tick(1);
      expect(component.clearDataPollers).toHaveBeenCalledTimes(5);
      component.onSubmitProgress(component.ButtonAction.BTN_PROGRESS, true);
      tick(1);
      expect(component.clearDataPollers).toHaveBeenCalledTimes(6);

      component.cleanup();
      tick(apiSettings.interval);
    }));

    it('should get the outer orb config', () => {
      Object.keys(new Array(3).fill(null)).forEach((i: string) => {
        expect(component.getNavOrbConfigOuter(parseInt(i))).toBeTruthy();
      });
    });

    it('should get the outer orb config', () => {
      Object.keys(new Array(3).fill(null)).forEach((i: string) => {
        expect(component.getNavOrbConfigInner(parseInt(i))).toBeTruthy();
      });
      expect(component.getNavOrbConfigInner(1)['indicate-polling']).toBeFalsy();
      component.isPollingProgress = true;
      expect(component.getNavOrbConfigInner(1)['indicate-polling']).toBeTruthy();

      expect(component.getNavOrbConfigInner(3)['indicate-polling']).toBeFalsy();
      component.isPollingRecord = true;
      expect(component.getNavOrbConfigInner(3)['indicate-polling']).toBeTruthy();
    });

    it('should set the step', () => {
      const form = component.uploadComponent.form;
      const conf = component.wizardConf;
      spyOn(form, 'enable');
      expect(conf[0].isHidden).toBeTruthy();
      expect(component.currentStepIndex).toEqual(1);
      component.setStep(0, false, false);
      expect(conf[0].isHidden).toBeFalsy();
      expect(component.currentStepIndex).toEqual(0);
      expect(form.enable).not.toHaveBeenCalled();
      component.setStep(0, true);
      expect(form.enable).not.toHaveBeenCalled();
      form.disable();
      component.setStep(0, true);
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

      component.callSetStep(createKeyEvent(true), 1, false);
      expect(component.setStep).not.toHaveBeenCalled();

      component.callSetStep(createKeyEvent(false), 1, false);
      expect(component.setStep).toHaveBeenCalled();
    });

    it('should show the orbs', () => {
      const conf = component.wizardConf;
      expect(conf[0].isHidden).toBeTruthy();
      expect(conf[1].isHidden).toBeFalsy();
      expect(conf[2].isHidden).toBeTruthy();
      expect(conf[3].isHidden).toBeTruthy();
      expect(conf[4].isHidden).toBeTruthy();

      component.setStep(0, false, false);
      expect(conf[0].isHidden).toBeFalsy();

      component.setStep(1, false, false);
      expect(conf[1].isHidden).toBeFalsy();

      component.setStep(2, false, false);
      expect(conf[2].isHidden).toBeFalsy();

      component.setStep(3, false, false);
      expect(conf[3].isHidden).toBeFalsy();

      component.setStep(4, false, false);
      expect(conf[4].isHidden).toBeFalsy();
    });

    it('should validate the dataset id', () => {
      const frmCtrl = (val: string): UntypedFormControl => {
        return ({ value: val } as unknown) as UntypedFormControl;
      };
      ['0', '1'].forEach((val: string) => {
        expect(component.validateDatasetId(frmCtrl(val))).toBeFalsy();
      });
      [' 1', '1 ', ' 1 ', '1 1', 'a', '@', '_', '-'].forEach((val: string) => {
        expect(component.validateDatasetId(frmCtrl(val))).toBeTruthy();
      });
    });

    it('should validate the record id', () => {
      const recordId = component.formRecord.get(formNameRecordId) as UntypedFormControl;
      const datasetId = component.formProgress.get(formNameDatasetId) as UntypedFormControl;

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

      expect(component.validateRecordId(({} as unknown) as UntypedFormControl)).toBeFalsy();
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
      expect(component.wizardConf[1].error).toBeFalsy();
      setFormValueDataset('1');
      component.onSubmitProgress(component.ButtonAction.BTN_PROGRESS);
      tick(1);
      expect(component.wizardConf[1].error).toBeTruthy();
      expect(component.progressData).toBeFalsy();
      expect(component.formProgress.value.datasetToTrack).toBeTruthy();
      component.cleanup();
      tick(apiSettings.interval);
    }));

    it('should handle record form errors', fakeAsync(() => {
      let index = component.getStepIndex(WizardStepType.REPORT);
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
      index = component.getStepIndex(WizardStepType.PROBLEMS_RECORD);

      component.onSubmitRecord(component.ButtonAction.BTN_PROBLEMS, false);
      tick(1);
      expect(component.wizardConf[index].error).toBeTruthy();
      expect(component.recordReport).toBeFalsy();

      component.cleanup();
      tick(apiSettings.interval);
    }));

    it('should handle problem pattern errors (dataset)', fakeAsync(() => {
      expect(component.wizardConf[2].error).toBeFalsy();
      component.trackDatasetId = '1';
      component.submitDatasetProblemPatterns();
      tick(1);
      expect(component.wizardConf[2].error).toBeTruthy();
    }));

    it('should handle problem pattern errors (record)', fakeAsync(() => {
      expect(component.wizardConf[4].error).toBeFalsy();
      component.trackDatasetId = '1';
      component.trackRecordId = '1/2';
      component.submitRecordProblemPatterns();
      tick(1);
      expect(component.wizardConf[4].error).toBeTruthy();
    }));
  });
});
