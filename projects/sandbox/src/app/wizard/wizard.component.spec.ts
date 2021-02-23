import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { ProtocolType } from '@shared';
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
});
