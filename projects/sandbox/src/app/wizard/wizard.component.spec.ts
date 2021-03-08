import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProtocolType } from '@shared';
import { apiSettings } from '../../environments/apisettings';
import { mockDatasetInfo, MockSandboxService } from '../_mocked';
import { DatasetInfoStatus, WizardStep, WizardStepType } from '../_models';
import { SandboxService } from '../_services';
import { WizardComponent } from './wizard.component';

describe('WizardComponent', () => {
  let component: WizardComponent;
  let fixture: ComponentFixture<WizardComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [WizardComponent],
      imports: [HttpClientTestingModule, ReactiveFormsModule],
      providers: [{ provide: SandboxService, useClass: MockSandboxService }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WizardComponent);
    component = fixture.componentInstance;
    component._wizardConf = [
      {
        stepType: WizardStepType.SET_NAME
      },
      {
        stepType: WizardStepType.PROTOCOL_SELECT,
        fields: [
          {
            name: 'uploadProtocol',
            validators: [Validators.required],
            defaultValue: ProtocolType.ZIP_UPLOAD
          },
          {
            name: 'harvestUrl'
          },
          {
            name: 'setSpec'
          },
          {
            name: 'metadataFormat'
          },
          {
            name: 'url'
          },
          {
            name: 'fileFormName',
            validators: [Validators.required]
          }
        ]
      },
      {
        stepType: WizardStepType.PROGRESS_TRACK
      }
    ];
    fixture.detectChanges();
  });

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

  it('should get the index of the tracking step', () => {
    expect(component.getTrackProgressConfIndex()).toBeGreaterThan(-1);
    component._wizardConf = [];
    expect(component.getTrackProgressConfIndex()).toEqual(-1);
  });

  it('should reset the busy flags', fakeAsync(() => {
    component.isBusy = true;
    component.isPolling = true;
    component.resetBusy();
    tick(component.resetBusyDelay);
    expect(component.isBusy).toBeFalsy();
    component._wizardConf = [];
    expect(component.isPolling).toBeFalsy();
  }));

  it('should tell if the progress is complete', () => {
    expect(component.progressComplete()).toBeFalsy();
    component.progressData = Object.assign({}, mockDatasetInfo);
    component.progressData.status = DatasetInfoStatus.COMPLETED;
    expect(component.progressComplete()).toBeTruthy();
    component.progressData.status = DatasetInfoStatus.IN_PROGRESS;
    expect(component.progressComplete()).toBeFalsy();
  });

  it('should submit the progress from', fakeAsync(() => {
    spyOn(component, 'clearDataPollers');
    component.onSubmitProgress();
    expect(component.clearDataPollers).not.toHaveBeenCalled();

    (component.formProgress.get('idToTrack') as FormControl).setValue('1');
    component.onSubmitProgress();
    expect(component.clearDataPollers).toHaveBeenCalled();

    component.cleanup();
    tick(apiSettings.interval);
  }));

  it('should submit the upload from', fakeAsync(() => {
    expect(component.isBusy).toBeFalsy();
    component.onSubmitDataset();
    expect(component.isBusy).toBeFalsy();

    component.cleanup();
    tick(apiSettings.interval);
  }));

  it('should get if the step is submittable', () => {
    const conf = [
      {
        stepType: WizardStepType.SET_NAME,
        fields: [
          {
            name: 'name',
            validators: [Validators.required]
          }
        ]
      }
    ];
    component._wizardConf = conf;
    component.buildForms();
    expect(component.getStepIsSubmittable(component.wizardConf[0])).toEqual(false);
    const ctrl = component.formUpload.get('name') as FormControl;
    ctrl.setValue('name');
    expect(component.getStepIsSubmittable(component.wizardConf[0])).toEqual(true);
  });

  it('should set the step', () => {
    const form = component.formUpload;
    spyOn(form, 'enable');
    expect(component.orbsHidden).toBeTruthy();
    expect(component.currentStepIndex).toEqual(2);
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

  it('should get the index of the progress track step', () => {
    expect(component.getTrackProgressConfIndex()).toEqual(2);
  });
});
