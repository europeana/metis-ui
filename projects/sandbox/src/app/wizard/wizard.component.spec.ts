import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { ProtocolType } from 'shared';
import { apiSettings } from '../../environments/apisettings';
import { mockDataset, MockSandboxService, MockSandboxServiceErrors } from '../_mocked';
import { DatasetStatus, WizardStep, WizardStepType } from '../_models';
import { SandboxService } from '../_services';
import { WizardComponent } from './wizard.component';

describe('WizardComponent', () => {
  let component: WizardComponent;
  let fixture: ComponentFixture<WizardComponent>;
  let sandbox: SandboxService;
  const testFile = new File([], 'file.zip', { type: 'zip' });

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      declarations: [WizardComponent],
      imports: [HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        {
          provide: SandboxService,
          useClass: errorMode ? MockSandboxServiceErrors : MockSandboxService
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    sandbox = TestBed.inject(SandboxService);
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(WizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const fillUploadForm = (): void => {
    (component.formUpload.get('name') as FormControl).setValue('A');
    (component.formUpload.get('country') as FormControl).setValue('Greece');
    (component.formUpload.get('language') as FormControl).setValue('Greek');
    (component.formUpload.get('dataset') as FormControl).setValue(testFile);
    (component.formUpload.get('url') as FormControl).setValue('http://x');
    expect(component.formUpload.valid).toBeTruthy();
  };

  describe('Normal operations', () => {
    beforeEach(async(configureTestbed));
    beforeEach(b4Each);

    it('should create', () => {
      expect(component).toBeTruthy();
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
      component.isPolling = true;
      component.resetBusy();
      tick(component.resetBusyDelay);
      expect(component.isBusy).toBeFalsy();
      expect(component.isPolling).toBeFalsy();
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
      (form.get('url') as FormControl).setValue('http://x');

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
      component.cleanup();
      tick(apiSettings.interval);
    }));

    it('should submit the dataset form', fakeAsync(() => {
      expect(component.isBusy).toBeFalsy();
      component.onSubmitDataset();
      expect(component.isBusy).toBeFalsy();
      fillUploadForm();
      component.onSubmitDataset();
      tick(1);
      expect(component.isBusy).toBeTruthy();
      expect(component.trackDatasetId).toBeTruthy();
      component.cleanup();
      tick(apiSettings.interval);
    }));

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
      expect(component.orbsHidden).toBeTruthy();
      expect(component.currentStepIndex).toEqual(3);
      component.setStep(0);
      expect(component.orbsHidden).toBeFalsy();
      expect(component.currentStepIndex).toEqual(0);
      expect(form.enable).not.toHaveBeenCalled();
      component.setStep(0, true);
      expect(form.enable).not.toHaveBeenCalled();
      form.disable();
      component.setStep(0, true);
      expect(form.enable).toHaveBeenCalled();
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
      expect(component.error).toBeFalsy();
      (component.formProgress.get('idToTrack') as FormControl).setValue('1');
      component.onSubmitProgress();
      tick(1);
      expect(component.error).toBeTruthy();
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
  });
});
