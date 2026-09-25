import '@angular/localize/init';
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
      url: new FormControl(null),
      incrementalHarvest: new FormControl(false),
      setSpec: new FormControl('')
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

    // Triggers the initial constructor signal effect pass
    fixture.detectChanges();
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

    // Forces the constructor effect to flush the new activeForm stream rules
    fixture.detectChanges();
    await fixture.whenStable();

    // ZIP fields should be cleared of active validation parameters
    expect(testForm.get('dataset')?.hasError('required')).toBe(false);

    // OAI-PMH targets must now enforce mandatory assertions
    expect(testForm.get('harvestUrl')?.hasError('required')).toBe(true);
    expect(testForm.get('metadataFormat')?.hasError('required')).toBe(true);
  });

  it('should clear old configurations and switch constraints when moving to HTTP harvest', async () => {
    testForm.get('protocolSelector')?.setValue(ProtocolType.HTTP_HARVEST);

    // Flush value change pipeline triggers
    fixture.detectChanges();
    await fixture.whenStable();

    expect(testForm.get('dataset')?.hasError('required')).toBe(false);
    expect(testForm.get('metadataFormat')?.hasError('required')).toBe(false);

    // HTTP target validation rules apply
    expect(testForm.get('url')?.hasError('required')).toBe(true);
  });

  it('should evaluate conditional layout queries correctly using existing component helpers', async () => {
    testForm.get('protocolSelector')?.setValue(ProtocolType.ZIP_UPLOAD);

    // Keep layout values in lockstep
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isProtocolFile()).toBe(true);
    expect(component.isProtocolHTTP()).toBe(false);
    expect(component.isProtocolOAIPMH()).toBe(false);

    // Swap values to hit alternative conditional evaluation pathways
    testForm.get('protocolSelector')?.setValue(ProtocolType.HTTP_HARVEST);
    expect(component.isProtocolHTTP()).toBe(true);

    testForm.get('protocolSelector')?.setValue(ProtocolType.OAIPMH_HARVEST);
    expect(component.isProtocolOAIPMH()).toBe(true);
  });

  it('should check if a protocol is disabled via form state or disabledProtocols input array', async () => {
    expect(component.isProtocolDisabled(ProtocolType.ZIP_UPLOAD)).toBe(false);

    fixture.componentRef.setInput('disabledProtocols', [ProtocolType.ZIP_UPLOAD]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.isProtocolDisabled(ProtocolType.ZIP_UPLOAD)).toBe(true);

    // Reset list
    fixture.componentRef.setInput('disabledProtocols', []);
    fixture.detectChanges();
    await fixture.whenStable();

    testForm.disable();
    expect(component.isProtocolDisabled(ProtocolType.ZIP_UPLOAD)).toBe(true);
  });

  it('should verify protocol visibility state matrix correctly', async () => {
    // Matches baseline setup matrix
    expect(component.isProtocolVisible(ProtocolType.ZIP_UPLOAD)).toBe(true);

    // Switch visible configurations array
    fixture.componentRef.setInput('visibleProtocols', [ProtocolType.HTTP_HARVEST]);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isProtocolVisible(ProtocolType.ZIP_UPLOAD)).toBe(false);
    expect(component.isProtocolVisible(ProtocolType.HTTP_HARVEST)).toBe(true);
  });

  it('should invoke clearFileValue on child components safely and handle null edge cases', async () => {
    const fileUploadSpy = vi.spyOn(component, 'fileUpload').mockReturnValue(undefined as any);
    expect(() => component.clearFileValue()).not.toThrow();
    fileUploadSpy.mockRestore();

    const mockUploadSpy = { clearFileValue: vi.fn() };

    Object.defineProperty(component, 'fileUpload', {
      value: () => mockUploadSpy,
      writable: true,
      configurable: true
    });

    component.clearFileValue();
    expect(mockUploadSpy.clearFileValue).toHaveBeenCalled();
  });

  it('should dynamically handle a complete FormGroup instance replacement and manage subscription leakage', async () => {
    const secondaryNewForm = new FormGroup({
      protocolSelector: new FormControl(ProtocolType.HTTP_HARVEST),
      dataset: new FormControl(null),
      harvestUrl: new FormControl(null),
      metadataFormat: new FormControl(null),
      url: new FormControl(null),
      incrementalHarvest: new FormControl(false),
      setSpec: new FormControl('')
    });

    const oldSubsCopy = [...component.subs];
    const subSpies = oldSubsCopy.map((sub) => vi.spyOn(sub, 'unsubscribe'));

    fixture.componentRef.setInput('protocolForm', secondaryNewForm);
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert every old subscription reference was torn down to prevent memory leaks
    subSpies.forEach((spy) => expect(spy).toHaveBeenCalled());

    expect(secondaryNewForm.get('url')?.hasError('required')).toBe(true);
  });
});
