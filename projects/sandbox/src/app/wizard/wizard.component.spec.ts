import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
      (component.formProgress.get(formNameDatasetId) as FormControl).setValue('1');
      component.onSubmitProgress(component.ButtonAction.BTN_PROGRESS);
      expect(component.clearDataPollers).toHaveBeenCalledTimes(1);
      tick(1);
      expect(component.clearDataPollers).toHaveBeenCalledTimes(2);

      // clear and re-submit

      spyOn(component, 'progressComplete').and.callFake(() => false);
      (component.formProgress.get(formNameDatasetId) as FormControl).setValue('1');
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

    it('should follow the problem pattern link', () => {
      const recordId = '/1/234';
      spyOn(component, 'fillAndSubmitRecordForm');
      spyOn(component, 'submitRecordReport');
      component.trackDatasetId = '1';
      component.followProblemPatternLink(recordId);
      expect(component.fillAndSubmitRecordForm).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    beforeEach(async () => {
      configureTestbed(true);
    });

    beforeEach(b4Each);

    it('should handle progress form errors', fakeAsync(() => {
      component.progressData = mockDataset;
      expect(component.wizardConf[1].error).toBeFalsy();
      (component.formProgress.get(formNameDatasetId) as FormControl).setValue('1');
      component.onSubmitProgress(component.ButtonAction.BTN_PROGRESS);
      tick(1);
      expect(component.wizardConf[1].error).toBeTruthy();
      expect(component.progressData).toBeFalsy();
      expect(component.formProgress.value.datasetToTrack).toBeTruthy();
      component.cleanup();
      tick(apiSettings.interval);
    }));

    it('should handle record form errors', fakeAsync(() => {
      const index = component.getStepIndex(WizardStepType.REPORT);
      component.recordReport = mockRecordReport;
      expect(component.wizardConf[index].error).toBeFalsy();

      component.onSubmitRecord(component.ButtonAction.BTN_RECORD);
      expect(component.wizardConf[index].error).toBeFalsy();

      (component.formProgress.get(formNameDatasetId) as FormControl).setValue('1');
      (component.formRecord.get(formNameRecordId) as FormControl).setValue('2');

      component.onSubmitRecord(component.ButtonAction.BTN_RECORD);
      tick(1);
      expect(component.wizardConf[index].error).toBeTruthy();
      expect(component.recordReport).toBeFalsy();
      component.cleanup();
      tick(apiSettings.interval);
    }));
  });
});
