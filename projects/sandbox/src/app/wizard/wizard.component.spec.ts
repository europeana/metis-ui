import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProtocolType } from '@shared';
import { WizardStep } from '../_models';
import { WizardComponent } from './wizard.component';

describe('WizardComponent', () => {
  let component: WizardComponent;
  let fixture: ComponentFixture<WizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WizardComponent],
      imports: [HttpClientTestingModule, ReactiveFormsModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WizardComponent);
    component = fixture.componentInstance;
    component._wizardConf = [
      {
        title: '',
        instruction: '',
        fields: []
      },
      {
        title: 'harvest',
        instruction: 'Configure the Data Source',
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
      }
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get the form group', () => {
    expect(component.getFormGroup({ title: 'progress' } as WizardStep)).toEqual(
      component.formProgress
    );
    expect(component.getFormGroup({ title: 'x' } as WizardStep)).toEqual(component.formUpload);
  });

  it('should get if the orbs are square', () => {
    expect(component.getOrbsAreSquare()).toEqual(false);
    component.currentStepIndex = component.wizardConf.length - 1;
    expect(component.getOrbsAreSquare()).toEqual(false);
    const ctrl = component.formProgress.get('idToTrack') as FormControl;
    ctrl.setValue(1);
    expect(component.getOrbsAreSquare()).toEqual(true);
  });

  it('should set the step', () => {
    expect(component.orbsHidden).toBeTruthy();
    expect(component.currentStepIndex).toEqual(1);
    component.setStep(0);
    expect(component.orbsHidden).toBeFalsy();
    expect(component.currentStepIndex).toEqual(0);
  });
});
