import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of } from 'rxjs';
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
import { WizardComponent } from './wizard.component';

describe('WizardComponent', () => {
  let component: WizardComponent;
  let fixture: ComponentFixture<WizardComponent>;
  let sandbox: SandboxService;
  const testFile = new File([], 'file.zip', { type: 'zip' });
  const params = new BehaviorSubject({} as Params);
  const queryParams = new BehaviorSubject({} as Params);

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      declarations: [FileUploadComponent, ProtocolFieldSetComponent, WizardComponent],
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
    sandbox = TestBed.inject(SandboxService);
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(WizardComponent);
    component = fixture.componentInstance;
    params.next({});
    fixture.detectChanges();
  };

  const fillUploadForm = (useHarvestUrl = false): void => {
    (component.formUpload.get('name') as FormControl).setValue('A');
    (component.formUpload.get('country') as FormControl).setValue('Greece');
    (component.formUpload.get('language') as FormControl).setValue('Greek');
    (component.formUpload.get('dataset') as FormControl).setValue(testFile);

    if (useHarvestUrl) {
      (component.formUpload.get('harvestUrl') as FormControl).setValue('http://x');
    } else {
      (component.formUpload.get('url') as FormControl).setValue('http://x');
    }
    expect(component.formUpload.valid).toBeTruthy();
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

    it('should get the form group', () => {
      expect(
        component.getFormGroup({ stepType: WizardStepType.PROGRESS_TRACK } as WizardStep)
      ).toEqual(component.formProgress);
      expect(component.getFormGroup({ stepType: WizardStepType.SET_NAME } as WizardStep)).toEqual(
        component.formUpload
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
      const form = component.formUpload;

      expect(component.stepIsComplete(0)).toBeFalsy();
      (form.get('name') as FormControl).setValue('A');
      expect(component.stepIsComplete(0)).toBeTruthy();
      (form.get('name') as FormControl).setValue(' ');
      expect(component.stepIsComplete(0)).toBeFalsy();

      expect(component.stepIsComplete(1)).toBeFalsy();
      (form.get('country') as FormControl).setValue('Greece');
      (form.get('language') as FormControl).setValue('Greek');
      expect(component.stepIsComplete(1)).toBeTruthy();

      expect(component.stepIsComplete(2)).toBeFalsy();

      (form.get('uploadProtocol') as FormControl).setValue(ProtocolType.ZIP_UPLOAD);
      (form.get('dataset') as FormControl).setValue(testFile);

      (component.formUpload.get('uploadProtocol') as FormControl).setValue(
        ProtocolType.HTTP_HARVEST
      );
      expect(component.stepIsComplete(2)).toBeFalsy();

      (form.get('url') as FormControl).setValue('http://x');
      (form.get('harvestUrl') as FormControl).setValue('http://x');

      fixture.detectChanges();
      expect(component.stepIsComplete(2)).toBeTruthy();

      expect(component.stepIsComplete(3)).toBeFalsy();
      (component.formProgress.get('idToTrack') as FormControl).setValue('1');
      expect(component.stepIsComplete(3)).toBeTruthy();
      (component.formProgress.get('idToTrack') as FormControl).setValue(' ');
      expect(component.stepIsComplete(3)).toBeFalsy();
    });

    it('should validate input', () => {
      expect(component.stepIsComplete(0)).toBeFalsy();
      (component.formUpload.get('name') as FormControl).setValue('A');
      expect(component.stepIsComplete(0)).toBeTruthy();
      (component.formUpload.get('name') as FormControl).setValue(' ');
      expect(component.stepIsComplete(0)).toBeFalsy();
    });

    it('should validate conditionally', () => {
      const ctrlFile = component.formUpload.get(component.xsltFileFormName) as FormControl;
      const ctrlCB = component.formUpload.get('sendXSLT') as FormControl;

      component.updateConditionalXSLValidator();
      expect(ctrlFile.valid).toBeTruthy();

      ctrlCB.setValue(true);
      component.updateConditionalXSLValidator();
      expect(ctrlFile.valid).toBeFalsy();

      ctrlCB.setValue(false);
      component.updateConditionalXSLValidator();
      expect(ctrlFile.valid).toBeTruthy();

      component.formUpload.removeControl('sendXSLT');
      component.updateConditionalXSLValidator();
      expect(ctrlFile.valid).toBeTruthy();
    });

    it('should tell if the steps are submittable', () => {
      const assertSubmittable = (value: boolean): void => {
        Array.from(Array(3).keys()).forEach((i: number) => {
          expect(component.getStepIsSubmittable(component.wizardConf[i])).toEqual(value);
        });
      };

      assertSubmittable(false);
      fillUploadForm();
      assertSubmittable(true);
      (component.formUpload.get('country') as FormControl).setValue(null);
      assertSubmittable(false);
    });

    it('should tell if the steps are submitted', () => {
      const conf = component.wizardConf;
      [0, 1, 2].forEach((n: number) => {
        expect(component.getStepIsSubmitted(conf[n])).toBeFalsy();
      });
      component.formUpload.disable();
      [0, 1, 2].forEach((n: number) => {
        expect(component.getStepIsSubmitted(conf[n])).toBeTruthy();
      });

      component.trackDatasetId = undefined;
      expect(component.getStepIsSubmitted(conf[3])).toBeFalsy();
      component.trackDatasetId = '123';
      expect(component.getStepIsSubmitted(conf[3])).toBeTruthy();

      component.trackRecordId = undefined;
      expect(component.getStepIsSubmitted(conf[4])).toBeFalsy();
      component.trackRecordId = '123';
      expect(component.getStepIsSubmitted(conf[4])).toBeTruthy();
    });

    it('should submit the progress form, clearing the polling before and when complete', fakeAsync(() => {
      spyOn(component, 'clearDataPollers');
      component.onSubmitProgress();
      expect(component.clearDataPollers).not.toHaveBeenCalled();
      (component.formProgress.get('idToTrack') as FormControl).setValue('1');
      component.onSubmitProgress();
      expect(component.clearDataPollers).toHaveBeenCalledTimes(1);
      tick(1);
      expect(component.clearDataPollers).toHaveBeenCalledTimes(2);

      // clear and re-submit

      spyOn(component, 'progressComplete').and.callFake(() => false);
      (component.formProgress.get('idToTrack') as FormControl).setValue('1');
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

    it('should submit the dataset form (url)', fakeAsync(() => {
      expect(component.isBusy).toBeFalsy();
      component.onSubmitDataset();
      expect(component.isBusy).toBeFalsy();
      fillUploadForm(false);
      component.onSubmitDataset();
      tick(1);
      expect(component.isBusy).toBeTruthy();
      expect(component.trackDatasetId).toBeTruthy();

      component.cleanup();
      tick(apiSettings.interval);
    }));

    it('should get the outer orb config', () => {
      Object.keys(new Array(5).fill(null)).forEach((i: string) => {
        expect(component.getNavOrbConfigOuter(parseInt(i))).toBeTruthy();
      });
    });

    it('should get the outer orb config', () => {
      Object.keys(new Array(5).fill(null)).forEach((i: string) => {
        expect(component.getNavOrbConfigInner(parseInt(i))).toBeTruthy();
      });
      expect(component.getNavOrbConfigInner(3)['indicate-polling']).toBeFalsy();
      component.isPollingProgress = true;
      expect(component.getNavOrbConfigInner(3)['indicate-polling']).toBeTruthy();

      expect(component.getNavOrbConfigInner(4)['indicate-polling']).toBeFalsy();
      component.isPollingRecord = true;
      expect(component.getNavOrbConfigInner(4)['indicate-polling']).toBeTruthy();
    });

    it('should get if the step is progress or report', () => {
      component.currentStepIndex = 0;
      expect(component.getIsRecordTrack(0)).toEqual(false);
      expect(component.getIsProgressTrack(0)).toEqual(false);
      expect(component.getIsProgressTrackOrReport(0)).toEqual(false);
      expect(component.getIsProgressTrackOrReport()).toEqual(false);
      expect(component.getIsProgressTrackOrReport(3)).toEqual(true);
      expect(component.getIsProgressTrackOrReport(4)).toEqual(true);
      component.currentStepIndex = 3;
      expect(component.getIsProgressTrackOrReport()).toEqual(true);
      component.currentStepIndex = 4;
      expect(component.getIsProgressTrackOrReport()).toEqual(true);
    });

    it('should get if the step is submittable', () => {
      component.setStep(0);
      const wizardStep = component.wizardConf[0];
      expect(component.getStepIsSubmittable(wizardStep)).toEqual(false);
      const ctrl = component.formUpload.get('name') as FormControl;
      ctrl.setValue('name');
      expect(component.getStepIsSubmittable(wizardStep)).toEqual(false);
      fillUploadForm();
      expect(component.getStepIsSubmittable(wizardStep)).toEqual(true);
    });

    it('should set the step', () => {
      const form = component.formUpload;

      spyOn(form, 'enable');
      expect(component.datasetOrbsHidden).toBeTruthy();
      expect(component.currentStepIndex).toEqual(3);
      component.setStep(0);
      expect(component.datasetOrbsHidden).toBeFalsy();
      expect(component.currentStepIndex).toEqual(0);
      expect(form.enable).not.toHaveBeenCalled();
      component.setStep(0, true);
      expect(form.enable).not.toHaveBeenCalled();
      form.disable();
      component.setStep(0, true);
      expect(form.enable).toHaveBeenCalled();

      spyOn(component, 'updateLocation');
      component.setStep(4);
      expect(component.updateLocation).toHaveBeenCalled();
    });

    it('should calculate if it can go to the previous step', () => {
      component.setStep(3);
      expect(component.canGoToPrevious()).toBeFalsy();
      component.setStep(0);
      expect(component.canGoToPrevious()).toBeFalsy();
      component.setStep(1);
      expect(component.canGoToPrevious()).toBeTruthy();
      component.setStep(2);
      expect(component.canGoToPrevious()).toBeTruthy();
      component.setStep(3);
      expect(component.canGoToPrevious()).toBeFalsy();
      component.formUpload.disable();
      expect(component.canGoToPrevious()).toBeTruthy();
    });

    it('should calculate if it can go to the next step', () => {
      component.setStep(0);
      expect(component.canGoToNext()).toBeTruthy();
      component.setStep(1);
      expect(component.canGoToNext()).toBeTruthy();
      component.setStep(2);
      expect(component.canGoToNext()).toBeFalsy();
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
      const recordId = component.formRecord.get('recordToTrack') as FormControl;
      const datasetId = component.formProgress.get('idToTrack') as FormControl;

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

    it('should validate the dataset name', () => {
      const frmCtrl = (val: string): FormControl => {
        return ({ value: val } as unknown) as FormControl;
      };
      ['0', '1', 'A1', 'A_1', '_1_A_'].forEach((val: string) => {
        expect(component.validateDatasetName(frmCtrl(val))).toBeFalsy();
      });
      [' 1', '1 ', ' 1 ', '1 1', '@', '-', '"', 'A ', 'A A'].forEach((val: string) => {
        expect(component.validateDatasetName(frmCtrl(val))).toBeTruthy();
      });
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
      (component.formProgress.get('idToTrack') as FormControl).setValue('1');
      component.onSubmitProgress();
      tick(1);
      expect(component.error).toBeTruthy();
      expect(component.progressData).toBeFalsy();
      expect(component.formProgress.value.idToTrack).toBeTruthy();
      component.cleanup();
      tick(apiSettings.interval);
    }));

    it('should handle upload form errors', fakeAsync(() => {
      expect(component.error).toBeFalsy();
      fillUploadForm();
      expect(component.error).toBeFalsy();
      component.onSubmitDataset();
      tick(1);
      expect(component.error).toBeTruthy();
      component.cleanup();
      tick(apiSettings.interval);
    }));

    it('should handle upload form errors', fakeAsync(() => {
      spyOn(sandbox, 'submitDataset').and.callFake(() => {
        return of({});
      });
      fillUploadForm();
      component.onSubmitDataset();
      tick(1);

      expect(component.isBusy).toBeTruthy();
      expect(component.error).toBeFalsy();
      tick(component.resetBusyDelay);
      expect(component.isBusy).toBeFalsy();
      component.cleanup();
      tick(apiSettings.interval);
    }));

    it('should handle upload form errors (harvest url)', fakeAsync(() => {
      spyOn(sandbox, 'submitDataset').and.callFake(() => {
        return of({});
      });
      fillUploadForm(true);
      component.onSubmitDataset();
      tick(1);

      expect(component.isBusy).toBeTruthy();
      expect(component.error).toBeFalsy();
      tick(component.resetBusyDelay);
      expect(component.isBusy).toBeFalsy();
      component.cleanup();
      tick(apiSettings.interval);
    }));

    it('should handle record form errors', fakeAsync(() => {
      component.recordReport = mockRecordReport;
      expect(component.error).toBeFalsy();
      component.onSubmitRecord();
      expect(component.error).toBeFalsy();
      (component.formProgress.get('idToTrack') as FormControl).setValue('1');
      (component.formRecord.get('recordToTrack') as FormControl).setValue('2');
      component.onSubmitRecord();
      tick(1);
      expect(component.error).toBeTruthy();
      expect(component.recordReport).toBeFalsy();
      component.cleanup();
      tick(apiSettings.interval);
    }));
  });
});
