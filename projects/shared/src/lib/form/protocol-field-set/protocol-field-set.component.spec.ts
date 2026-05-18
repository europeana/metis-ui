import { beforeEach, describe, expect, it } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProtocolFieldSetComponent } from './protocol-field-set.component';
import { ProtocolType } from '../../_models/shared-models';

describe('ProtocolFieldSetComponent', () => {
  let component: ProtocolFieldSetComponent;
  let fixture: ComponentFixture<ProtocolFieldSetComponent>;
  let mockForm: FormGroup;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProtocolFieldSetComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProtocolFieldSetComponent);
    component = fixture.componentInstance;

    // Create a minimal raw form structure representing your host form layout
    mockForm = new FormGroup({
      activeProtocol: new FormControl(ProtocolType.ZIP_UPLOAD),
      zipFile: new FormControl(null),
      harvestUrl: new FormControl(''),
      metadataFormat: new FormControl(''),
      url: new FormControl('')
    });

    // Mount standard required inputs using the new Angular signal input setter API
    fixture.componentRef.setInput('protocolForm', mockForm);
    fixture.componentRef.setInput('protocolSwitchField', 'activeProtocol');
    fixture.componentRef.setInput('fileFormName', 'zipFile');

    fixture.detectChanges(); // Triggers ngOnInit validation mapping
  });

  it('should initialize and apply validation rules for the default ZIP protocol', () => {
    expect(component).toBeTruthy();

    // Default protocol is ZIP: zipFile should automatically be forced to required
    const zipControl = mockForm.get('zipFile');
    expect(zipControl?.hasValidator(Validators.required)).toBe(true);
  });

  it('should clear old rules and swap validators dynamically when the active protocol changes', () => {
    // Switch form state over to OAI-PMH
    mockForm.get('activeProtocol')?.setValue(ProtocolType.OAIPMH_HARVEST);

    // The old ZIP file validation should be wiped completely clean
    const zipControl = mockForm.get('zipFile');
    expect(zipControl?.hasValidator(Validators.required)).toBe(false);

    // New OAI-PMH harvest fields should now actively enforce their restrictions
    const harvestUrlControl = mockForm.get('harvestUrl');
    const metaFormatControl = mockForm.get('metadataFormat');
    expect(harvestUrlControl?.hasValidator(Validators.required)).toBe(true);
    expect(metaFormatControl?.hasValidator(Validators.required)).toBe(true);
  });

  it('should isolate and clear targeted form validation parameters via helper arrays', () => {
    // Manually force a required rule on a control
    const urlControl = mockForm.get('url');
    urlControl?.setValidators([Validators.required]);
    expect(urlControl?.hasValidator(Validators.required)).toBe(true);

    // Trigger cleanup utility directly
    component.clearFormValidators(mockForm);

    expect(urlControl?.hasValidator(Validators.required)).toBe(false);
  });

  it('should safely delegate clearFileValue to the child file upload component', () => {
    // 1. Fetch the instantiated child uploader resolved by the viewChild signal query
    const childComponent = component.fileUpload();
    expect(childComponent).toBeTruthy();

    // 2. Set up a spy on the child uploader's cleanup function
    const clearSpy = vi.spyOn(childComponent!, 'clearFileValue');

    // 3. Trigger the method on the parent wrapper component
    component.clearFileValue();

    // 4. Verify that the call successfully propagated down to the child element
    expect(clearSpy).toHaveBeenCalled();
  });
});
