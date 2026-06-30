import { ComponentFixture, TestBed } from '@angular/core/testing';
import { computed, provideZonelessChangeDetection, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Validators } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { UploadComponent } from './upload.component';
import { SandboxConfService, UploadService } from '../_services';
import { ModalConfirmService, ProtocolType } from 'shared';
import { SandboxPageType } from '../_models';

describe('UploadComponent', () => {
  let component: UploadComponent;
  let fixture: ComponentFixture<UploadComponent>;
  let mockUploadService: any;
  let mockModalService: any;
  let mockSandboxConfService: any;
  let navConfSignal: any;

  beforeEach(async () => {
    mockUploadService = {
      getCountries: vi.fn().mockReturnValue(of([{ code: 'NL', name: 'Netherlands' }])),
      getLanguages: vi.fn().mockReturnValue(of([{ code: 'nl', name: 'Dutch' }])),
      submitDataset: vi.fn().mockReturnValue(of({ body: { 'dataset-id': '12345' } }))
    };

    mockModalService = {
      open: vi.fn().mockReturnValue(of(true)),
      add: vi.fn()
    };

    // Fix constructor stream tracking: Instantiate the signal reference BEFORE createComponent invokes the constructor hooks
    navConfSignal = signal([null, { error: new HttpErrorResponse({ status: 500 }) }]);

    mockSandboxConfService = {
      navConf: computed(() => navConfSignal()),
      updateStepStatus: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [UploadComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: UploadService, useValue: mockUploadService },
        { provide: ModalConfirmService, useValue: mockModalService },
        { provide: SandboxConfService, useValue: mockSandboxConfService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create the component and populate dropdown values cleanly', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.countries.status()).toBe('resolved');
    expect(component.countries.value()).toEqual([{ code: 'NL', name: 'Netherlands' }]);
    expect(component.languages.value()).toEqual([{ code: 'nl', name: 'Dutch' }]);
    expect(component.countries.error()).toBeUndefined();
  });

  it('should swallow pre-login authentication failures with safe empty arrays', async () => {
    const mock401Error = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    mockUploadService.getCountries.mockReturnValue(throwError(() => mock401Error));
    mockUploadService.getLanguages.mockReturnValue(throwError(() => mock401Error));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.countries.status()).toBe('resolved');
    expect(component.countries.value()).toEqual([]);
    expect(component.languages.value()).toEqual([]);
    expect(component.countries.error()).toBeUndefined();
  });

  it('should swallow cut network redirect connections (status 0) safely', async () => {
    const mockStatusZeroError = new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' });
    mockUploadService.getCountries.mockReturnValue(throwError(() => mockStatusZeroError));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.countries.status()).toBe('resolved');
    expect(component.countries.value()).toEqual([]);
    expect(component.countries.error()).toBeUndefined();
  });

  it('should rethrow standard application server runtime failures directly', async () => {
    const mock500Error = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error',
      error: 'Failed to populate countries configuration list'
    });
    mockUploadService.getCountries.mockReturnValue(throwError(() => mock500Error));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.countries.status()).toBe('error');
    expect(component.countries.error()).toBeDefined();
  });

  // ==========================================
  // 🚀 REACTION TEST COVERAGE PATHWAYS
  // ==========================================

  it('should notify outputs and change status state cleanly on successful submissions', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const mockBlobFile = new File([''], 'test-dataset.zip', { type: 'application/zip' });

    component.form().patchValue({
      name: 'TestSandboxDataset',
      country: 'NL',
      language: 'nl',
      uploadProtocol: ProtocolType.ZIP_UPLOAD,
      url: 'http://localhost:3000/mock-harvest',
      harvestUrl: 'http://localhost:3000/mock-harvest',
      stepSize: '1',
      dataset: mockBlobFile
    });

    const outputSpy = vi.spyOn(component.notifySubmitted, 'emit');

    component.onSubmitDataset();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(mockUploadService.submitDataset).toHaveBeenCalled();
    expect(outputSpy).toHaveBeenCalledWith('12345');
  });

  it('should keep the error state active and unlock the form when an upload fails with a 404 error', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const mock404Error = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
    mockUploadService.submitDataset.mockReturnValue(throwError(() => mock404Error));

    const mockBlobFile = new File([''], 'failing-dataset.zip', { type: 'application/zip' });

    component.form().patchValue({
      name: 'FailingSandboxDataset',
      country: 'NL',
      language: 'nl',
      uploadProtocol: ProtocolType.ZIP_UPLOAD,
      url: 'http://localhost:3000/fail-harvest',
      harvestUrl: 'http://localhost:3000/fail-harvest',
      stepSize: '1',
      dataset: mockBlobFile
    });

    mockSandboxConfService.updateStepStatus.mockClear();

    component.onSubmitDataset();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.form().disabled).toBe(false);

    expect(mockSandboxConfService.updateStepStatus).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ error: mock404Error })
    );
  });

  // ==========================================
  // 💎 REBUILD FORM & SIGNALS COVERAGE BLOCK
  // ==========================================

  describe('Form Lifecycle Tracking & Input Signals Expansion', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should react to change events on structural input signal parameters', () => {
      fixture.componentRef.setInput('showing', true);
      TestBed.flushEffects();
      expect(component.showing()).toBe(true);

      fixture.componentRef.setInput('showing', false);
      TestBed.flushEffects();
      expect(component.showing()).toBe(false);
    });

    it('should execute rebuildForm safely and tear down ancient subscription listeners', () => {
      const activeFormGroup = component.form();
      vi.spyOn(activeFormGroup, 'enable');

      component.rebuildForm();
      TestBed.flushEffects();

      expect(activeFormGroup.enable).toHaveBeenCalled();
      expect(mockSandboxConfService.updateStepStatus).toHaveBeenCalledWith(SandboxPageType.UPLOAD, {
        error: undefined
      });
    });

    it('should clear error parameters upon reactive value model modification updates', () => {
      mockSandboxConfService.updateStepStatus.mockClear();

      component
        .form()
        .get('url')
        ?.setValue('http://localhost:3000/mutated-path-alert');
      TestBed.flushEffects();

      expect(mockSandboxConfService.updateStepStatus).toHaveBeenCalledWith(SandboxPageType.UPLOAD, {
        error: undefined
      });
    });

    it('should dynamically append required validation rules on file attachments based on toggle states', () => {
      const currentForm = component.form();
      const xsltFileControl = currentForm.get(component.xsltFileFormName);

      currentForm.get('sendXSLT')?.setValue(true);
      TestBed.flushEffects();
      expect(xsltFileControl?.hasValidator(Validators.required)).toBe(true);

      currentForm.get('sendXSLT')?.setValue(false);
      TestBed.flushEffects();
      expect(xsltFileControl?.hasValidator(Validators.required)).toBe(false);
    });

    it('should check field verification matrices correctly when determining protocol validity maps', () => {
      component
        .form()
        .get('uploadProtocol')
        ?.setErrors({ checkFail: true });
      expect(component.protocolIsValid()).toBe(false);

      // Hydrate all fields referenced in components protocolIsValid array loop block to strip their default empty invalid status
      component.form().patchValue({
        uploadProtocol: 'OAI_PMH',
        url: 'http://valid-target.org',
        dataset: {},
        harvestUrl: 'http://valid-target.org',
        setSpec: 'all',
        metadataFormat: 'oai_dc',
        xsltFile: {}
      });
      component
        .form()
        .get('uploadProtocol')
        ?.setErrors(null);
      component.form().updateValueAndValidity();

      expect(component.protocolIsValid()).toBe(true);
    });

    it('should launch a request to clear old configurations when constructor error pipes emit clean conditions', () => {
      fixture.componentRef.setInput('showing', true);
      TestBed.flushEffects();

      mockSandboxConfService.updateStepStatus.mockClear();

      // Emit clean state through the bound pipeline constructor link to trigger rebuildForm execution
      navConfSignal.set([null, { error: undefined }]);
      TestBed.flushEffects();

      expect(mockSandboxConfService.updateStepStatus).toHaveBeenCalledWith(SandboxPageType.UPLOAD, {
        error: undefined
      });
    });

    it('should coordinate with structural modal window overlay managers when displaying information screens', () => {
      const anchorMockElement = document.createElement('div');
      component.showStepSizeInfo(anchorMockElement, false);

      expect(mockModalService.open).toHaveBeenCalledWith(
        component.modalIdStepSizeInfo,
        false,
        anchorMockElement
      );
    });
  });
});
