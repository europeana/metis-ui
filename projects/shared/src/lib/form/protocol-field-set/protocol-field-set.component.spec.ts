import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProtocolFieldSetComponent } from './protocol-field-set.component';
import { ProtocolType } from '../../_models/shared-models';

describe('ProtocolFieldSetComponent (Zoneless Validation)', () => {
  let component: ProtocolFieldSetComponent;
  let fixture: ComponentFixture<ProtocolFieldSetComponent>;
  let testForm: FormGroup;

  beforeEach(async () => {
    testForm = new FormGroup({
      protocolSelector: new FormControl(ProtocolType.ZIP_UPLOAD),
      dataset: new FormControl(null),
      harvestUrl: new FormControl(null),
      metadataFormat: new FormControl(null),
      url: new FormControl(null)
    });

    await TestBed.configureTestingModule({
      imports: [ProtocolFieldSetComponent, ReactiveFormsModule],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProtocolFieldSetComponent);
    component = fixture.componentInstance;

    // Set up the required signal inputs before initialization
    fixture.componentRef.setInput('fileFormName', 'dataset');
    fixture.componentRef.setInput('protocolSwitchField', 'protocolSelector');
    fixture.componentRef.setInput('protocolForm', testForm);
    fixture.componentRef.setInput('visibleProtocols', [
      ProtocolType.ZIP_UPLOAD,
      ProtocolType.HTTP_HARVEST,
      ProtocolType.OAIPMH_HARVEST
    ]);

    fixture.detectChanges(); // Triggers ngOnInit synchronously
    await fixture.whenStable();
  });

  it('should initially apply standard validation constraints for ZIP protocol configurations', async () => {
    const datasetCtrl = testForm.get('dataset');
    expect(datasetCtrl?.valid).toBe(false);
    expect(datasetCtrl?.hasError('required')).toBe(true);

    expect(testForm.get('harvestUrl')?.hasError('required')).toBe(false);
  });

  it('should dynamically shift validator rules when protocol changes to OAIPMH', async () => {
    testForm.get('protocolSelector')?.setValue(ProtocolType.OAIPMH_HARVEST);
    await fixture.whenStable(); // Await zoneless microtask execution pass

    // ZIP fields should be cleared of active validation parameters
    expect(testForm.get('dataset')?.hasError('required')).toBe(false);

    // OAI-PMH targets must now enforce mandatory assertions
    expect(testForm.get('harvestUrl')?.hasError('required')).toBe(true);
    expect(testForm.get('metadataFormat')?.hasError('required')).toBe(true);
  });

  it('should clear old configurations and switch constraints when moving to HTTP harvest', async () => {
    testForm.get('protocolSelector')?.setValue(ProtocolType.HTTP_HARVEST);
    await fixture.whenStable();

    expect(testForm.get('dataset')?.hasError('required')).toBe(false);
    expect(testForm.get('metadataFormat')?.hasError('required')).toBe(false);

    // HTTP target validation rules apply
    expect(testForm.get('url')?.hasError('required')).toBe(true);
  });

  it('should evaluate conditional layout queries correctly using existing component helpers', async () => {
    testForm.get('protocolSelector')?.setValue(ProtocolType.ZIP_UPLOAD);
    await fixture.whenStable();

    expect(component.isProtocolFile()).toBe(true);
    expect(component.isProtocolHTTP()).toBe(false);
    expect(component.isProtocolOAIPMH()).toBe(false);
  });
});
