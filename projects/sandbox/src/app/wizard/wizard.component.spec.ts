import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProtocolType } from '@shared';
import { WizardStep, WizardStepType } from '../_models';
import { WizardComponent } from './wizard.component';

describe('WizardComponent', () => {
  let component: WizardComponent;
  let fixture: ComponentFixture<WizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WizardComponent],
      imports: [HttpClientTestingModule, ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WizardComponent);
    component = fixture.componentInstance;
    component._wizardConf = [
      {
        stepType: WizardStepType.SET_NAME,
        fields: []
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
    tick(500);
    expect(component.isBusy).toBeFalsy();
    component._wizardConf = [];
    expect(component.isPolling).toBeFalsy();
  }));

  it('should submit the progress from', () => {
    spyOn(component, 'clearDataPollers');
    component.onSubmitProgress();
    expect(component.clearDataPollers).not.toHaveBeenCalled();

    (component.formProgress.get('idToTrack') as FormControl).setValue('1');
    component.onSubmitProgress();
    expect(component.clearDataPollers).toHaveBeenCalled();
  });

  it('should submit the upload from', () => {
    expect(component.isBusy).toBeFalsy();
    component.onSubmitDataset();
    expect(component.isBusy).toBeFalsy();
  });

  it('should get if the orbs are square', () => {
    component.currentStepIndex = 1;
    expect(component.getOrbsAreSquare()).toEqual(false);
    component.setStep(component.getTrackProgressConfIndex());
    expect(component.getOrbsAreSquare()).toEqual(false);
    const ctrl = component.formProgress.get('idToTrack') as FormControl;
    ctrl.setValue(1);
    expect(component.getOrbsAreSquare()).toEqual(true);
  });

  it('should set the step', () => {
    expect(component.orbsHidden).toBeTruthy();
    expect(component.currentStepIndex).toEqual(2);
    component.setStep(0);
    expect(component.orbsHidden).toBeFalsy();
    expect(component.currentStepIndex).toEqual(0);
  });

  it('should get the index of the progress track step', () => {
    expect(component.getTrackProgressConfIndex()).toEqual(2);
  });
});
