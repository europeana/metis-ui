import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { FileUploadComponent, ProtocolFieldSetComponent, ProtocolType } from 'shared';
import { apiSettings } from '../../environments/apisettings';
import {
  mockDataset,
  mockRecordReport,
  MockSandboxService,
  MockSandboxServiceErrors
} from '../_mocked';
import { DatasetStatus, WizardStep, WizardStepType } from '../_models';
import { SandboxService } from '../_services';
import { UploadComponent } from '../upload';
import { WizardComponent } from './wizard.component';

describe('WizardComponent', () => {
  let component: WizardComponent;
  let fixture: ComponentFixture<WizardComponent>;
  const testFile = new File([], 'file.zip', { type: 'zip' });
  const params = new BehaviorSubject({} as Params);
  const queryParams = new BehaviorSubject({} as Params);
  const formNameDatasetId = 'datasetToTrack';
  const formNameRecordId = 'recordToTrack';

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      declarations: [
        FileUploadComponent,
        ProtocolFieldSetComponent,
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

    it('should subscribe to parameter changes', () => {
      expect(component.trackDatasetId).toBeFalsy();
      params.next({ id: '1' });
      fixture.detectChanges();
      expect(component.trackDatasetId).toBeTruthy();
      expect(component.trackRecordId).toBeFalsy();

      params.next({ id: '1' });
      queryParams.next({ recordId: '2' });

      expect(component.trackDatasetId).toBeTruthy();
      expect(component.trackRecordId).toBeTruthy();
    });

    it('should get the connect classes', () => {
      let cClasses = component.getConnectClasses('top');
      expect(cClasses.error).toBeFalsy();

      (component.formProgress.get(formNameDatasetId) as FormControl).setValue('1');
      fixture.detectChanges();
      cClasses = component.getConnectClasses('top');
      expect(cClasses.error).toBeFalsy();
      expect(cClasses.top).toBeFalsy();

      (component.formRecord.get(formNameRecordId) as FormControl).setValue('/1/23');
      fixture.detectChanges();
      cClasses = component.getConnectClasses('top');
      expect(cClasses.error).toBeFalsy();
      expect(cClasses.top).toBeTruthy();

      (component.formProgress.get(formNameDatasetId) as FormControl).setValue('2');
      fixture.detectChanges();
      cClasses = component.getConnectClasses('top');
      expect(cClasses.error).toBeTruthy();
      expect(cClasses.top).toBeTruthy();

      (component.formRecord.get(formNameRecordId) as FormControl).setValue('/2/23');
      fixture.detectChanges();
      cClasses = component.getConnectClasses('top');
      expect(cClasses.error).toBeFalsy();
      expect(cClasses.top).toBeTruthy();

      (component.formRecord.get(formNameRecordId) as FormControl).setValue('/BBB/23');
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
    });

    it('should reset the busy flags', fakeAsync(() => {
      component.isBusy = true;
      component.isPollingProgress = true;
      component.resetBusy();
      tick(component.resetBusyDelay);
      expect(component.isBusy).toBeFalsy();
      expect(component.isPollingProgress).toBeFalsy();
    }));

    it('should tell if the progress is complete', () => {
      expect(component.progressComplete()).toBeFalsy();
      component.progressData = Object.assign({}, mockDataset);
      component.progressData.status = DatasetStatus.COMPLETED;
      expect(component.progressComplete()).toBeTruthy();
      component.progressData.status = DatasetStatus.IN_PROGRESS;
      expect(component.progressComplete()).toBeFalsy();
    });

    it('should tell if the steps are complete', () => {
      const form = component.uploadComponent.form;

      // STEP 0
      expect(component.stepIsComplete(0)).toBeFalsy();
      (form.get('name') as FormControl).setValue('A');
      expect(component.stepIsComplete(0)).toBeFalsy();

      (form.get('country') as FormControl).setValue('Greece');
      (form.get('language') as FormControl).setValue('Greek');
      expect(component.stepIsComplete(0)).toBeFalsy();

      (form.get('uploadProtocol') as FormControl).setValue(ProtocolType.HTTP_HARVEST);
      (form.get('url') as FormControl).setValue('http://x');
      expect(component.stepIsComplete(0)).toBeTruthy();

      (form.get('name') as FormControl).setValue(' ');
      expect(component.stepIsComplete(0)).toBeFalsy();

      (form.get('name') as FormControl).setValue('A');
      expect(component.stepIsComplete(0)).toBeTruthy();

      (form.get('uploadProtocol') as FormControl).setValue(ProtocolType.OAIPMH_HARVEST);
      expect(component.stepIsComplete(0)).toBeFalsy();

      (form.get('harvestUrl') as FormControl).setValue('http://x');
      expect(component.stepIsComplete(0)).toBeFalsy();

      (form.get('setSpec') as FormControl).setValue('X');
      expect(component.stepIsComplete(0)).toBeFalsy();

      (form.get('metadataFormat') as FormControl).setValue('X');
      expect(component.stepIsComplete(0)).toBeTruthy();

      (form.get('uploadProtocol') as FormControl).setValue(ProtocolType.ZIP_UPLOAD);
      expect(component.stepIsComplete(0)).toBeFalsy();

      (form.get('dataset') as FormControl).setValue(testFile);
      expect(component.stepIsComplete(0)).toBeTruthy();

      // STEP 1

      expect(component.stepIsComplete(1)).toBeFalsy();
      (component.formProgress.get(formNameDatasetId) as FormControl).setValue(' ');
      expect(component.stepIsComplete(1)).toBeFalsy();
      (component.formProgress.get(formNameDatasetId) as FormControl).setValue('1');
      expect(component.stepIsComplete(1)).toBeTruthy();

      // STEP 2

      expect(component.stepIsComplete(2)).toBeFalsy();
      (component.formRecord.get('recordToTrack') as FormControl).setValue(' ');
      expect(component.stepIsComplete(2)).toBeFalsy();

      (component.formRecord.get('recordToTrack') as FormControl).setValue('1');
      expect(component.stepIsComplete(2)).toBeTruthy();
    });

    it('should submit the progress form, clearing the polling before and when complete', fakeAsync(() => {
      spyOn(component, 'clearDataPollers');
      component.onSubmitProgress();
      expect(component.clearDataPollers).not.toHaveBeenCalled();
      (component.formProgress.get(formNameDatasetId) as FormControl).setValue('1');
      component.onSubmitProgress();
      expect(component.clearDataPollers).toHaveBeenCalledTimes(1);
      tick(1);
      expect(component.clearDataPollers).toHaveBeenCalledTimes(2);

      // clear and re-submit

      spyOn(component, 'progressComplete').and.callFake(() => false);
      (component.formProgress.get(formNameDatasetId) as FormControl).setValue('1');
      component.onSubmitProgress();
      expect(component.clearDataPollers).toHaveBeenCalledTimes(3);
      tick(1);
      expect(component.clearDataPollers).toHaveBeenCalledTimes(3);

      // with location update

      component.onSubmitProgress(true);
      tick(1);
      expect(component.clearDataPollers).toHaveBeenCalledTimes(5);
      component.onSubmitProgress(true);
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

      expect(component.getNavOrbConfigInner(2)['indicate-polling']).toBeFalsy();
      component.isPollingRecord = true;
      expect(component.getNavOrbConfigInner(2)['indicate-polling']).toBeTruthy();
    });

    it('should get if the step is progress or report', () => {
      component.currentStepIndex = 0;
      expect(component.getIsRecordTrack(0)).toEqual(false);
      expect(component.getIsProgressTrack(0)).toEqual(false);
      expect(component.getIsProgressTrackOrReport(0)).toEqual(false);
      expect(component.getIsProgressTrackOrReport()).toEqual(false);
      expect(component.getIsProgressTrackOrReport(2)).toEqual(true);
      component.currentStepIndex = 1;
      expect(component.getIsProgressTrackOrReport()).toEqual(true);
      component.currentStepIndex = 2;
      expect(component.getIsProgressTrackOrReport()).toEqual(true);
    });

    it('should get if the step is submittable', () => {
      const form = component.uploadComponent.form;
      component.setStep(0);
      const wizardStep = component.wizardConf[0];
      expect(component.getStepIsSubmittable(wizardStep)).toEqual(false);

      (form.get('name') as FormControl).setValue('A');
      expect(component.getStepIsSubmittable(wizardStep)).toEqual(false);

      (form.get('country') as FormControl).setValue('Greece');
      expect(component.getStepIsSubmittable(wizardStep)).toEqual(false);

      (form.get('language') as FormControl).setValue('Greek');
      expect(component.getStepIsSubmittable(wizardStep)).toEqual(false);

      (form.get('dataset') as FormControl).setValue(testFile);
      expect(component.getStepIsSubmittable(wizardStep)).toEqual(true);
    });

    it('should set the step', fakeAsync(() => {
      const form = component.uploadComponent.form;
      spyOn(form, 'enable');
      expect(component.datasetOrbsHidden).toBeTruthy();
      expect(component.currentStepIndex).toEqual(1);
      component.setStep(0, false, false);
      expect(component.datasetOrbsHidden).toBeFalsy();
      tick(1);
      expect(component.currentStepIndex).toEqual(0);
      expect(form.enable).not.toHaveBeenCalled();
      component.setStep(0, true);
      expect(form.enable).not.toHaveBeenCalled();
      form.disable();
      component.setStep(0, true);
      expect(form.enable).toHaveBeenCalled();
    }));

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
      const recordId = component.formRecord.get(formNameRecordId) as FormControl;
      const datasetId = component.formProgress.get(formNameDatasetId) as FormControl;

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

      expect(component.validateRecordId(({} as unknown) as FormControl)).toBeFalsy();
    });
  });

  describe('Error handling', () => {
    beforeEach(async () => {
      configureTestbed(true);
    });

    beforeEach(b4Each);

    it('should handle progress form errors', fakeAsync(() => {
      component.progressData = mockDataset;
      expect(component.error).toBeFalsy();
      (component.formProgress.get(formNameDatasetId) as FormControl).setValue('1');
      component.onSubmitProgress();
      tick(1);
      expect(component.error).toBeTruthy();
      expect(component.progressData).toBeFalsy();
      expect(component.formProgress.value.datasetToTrack).toBeTruthy();
      component.cleanup();
      tick(apiSettings.interval);
    }));

    it('should handle record form errors', fakeAsync(() => {
      component.recordReport = mockRecordReport;
      expect(component.error).toBeFalsy();
      component.onSubmitRecord();
      expect(component.error).toBeFalsy();
      (component.formProgress.get(formNameDatasetId) as FormControl).setValue('1');
      (component.formRecord.get(formNameRecordId) as FormControl).setValue('2');
      component.onSubmitRecord();
      tick(1);
      expect(component.error).toBeTruthy();
      expect(component.recordReport).toBeFalsy();
      component.cleanup();
      tick(apiSettings.interval);
    }));
  });
});
